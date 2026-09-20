# Blogify — a multi-user blogging platform

A full blogging platform built with React 19 and Appwrite: accounts, a rich-text editor, image uploads, drafts, full-text search, and an infinite-scrolling feed backed by cursor pagination.

**🔗 Live demo → [app-blog-six.vercel.app](https://app-blog-six.vercel.app)**

> Browse the feed without an account. Sign up with any email to publish your own posts.

![Blogify dashboard](docs/screenshot.png)

---

## Features

- **Accounts** — email/password sign-up and sign-in, session-aware routing, protected pages
- **Write** — TinyMCE rich-text editor with featured-image upload
- **Drafts** — posts are `active` or `inactive`; drafts are visible only to their author, enforced at the database level
- **Feed** — infinite scroll over a cursor-paginated list, loading the next page before you reach the bottom
- **Search** — debounced full-text search over post titles, scoped to your own posts on the dashboard
- **Readable URLs** — `/post/how-i-built-this/68c1f2a9e3b4` with automatic redirects when a title changes
- **Instant navigation** — hovering a post card prefetches it, so opening it is immediate
- **Dark mode**, responsive layout

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Server state | TanStack Query v5 (`useInfiniteQuery`, `useQuery`) |
| Client state | Redux Toolkit (auth session, theme) |
| Forms | React Hook Form |
| Routing | React Router v7 |
| Backend | Appwrite — auth, TablesDB, Storage |
| Editor | TinyMCE |
| Build / host | Vite 8, Vercel |

---

## Engineering notes

The parts of this project that took real thought.

### Cursor pagination instead of page numbers

`?page=2` is computed as "skip the first 24 rows". If someone publishes a post while you're scrolling, every row shifts down one and page 2 repeats a row page 1 already showed. Delete a post and a row is skipped entirely.

This app pages with `Query.cursorAfter(lastRowId)` — "give me what comes after this exact row" — so inserts and deletes elsewhere in the list can't shift the window. Sorting is `$createdAt DESC, $id DESC`: the `$id` tiebreaker matters because two posts created in the same millisecond would otherwise have an unstable order and could repeat or vanish across pages.

List queries also use `Query.select([...])` to exclude the article body, which is the largest column. A feed of 12 posts fetches titles and thumbnails, not 12 full articles; the body is loaded only on the post page.

→ [`src/services/Post.service.js`](src/services/Post.service.js)

### Why a hand-written pagination hook was replaced

The first version was a custom `usePaginatedList` hook. The subtle problem it had to solve: if you type "rea" and then "react", two searches are in flight, and **the slower one can land last** — leaving results for "rea" on screen under the word "react". The hook fixed this by stamping every request with an incrementing id and discarding any response that wasn't the newest.

That's one of several problems a caching layer already solves, so the hook was replaced with TanStack Query's `useInfiniteQuery`, which keys each search by its own term. The migration also brought request deduplication, caching between page visits, and background refreshing — and cut the hook's state juggling down to a query key.

→ [`src/Pages/AllPost.jsx`](src/Pages/AllPost.jsx), [`src/Pages/Home.jsx`](src/Pages/Home.jsx)

### Titles were being used as primary keys

Originally a post's database ID was its slugified title, so `/post/my-trip` mapped to row `my-trip`. Three bugs fell out of that:

1. **Two users could never publish the same title** — the second save failed with a 409 conflict.
2. **Titles in Hindi, Urdu or emoji produced an empty or invalid ID**, because slugifying strips non-Latin characters.
3. **Two different long titles collided** if their first 36 characters matched, since IDs are capped at 36 characters.

Posts now use `ID.unique()`, and the slug is purely cosmetic — worked out from the title when a link is built, never stored. Lookups use only the ID, so:

- identical titles are fine; they produce different URLs
- renaming a post doesn't break old links — the post page detects a stale slug and redirects to the current URL with `replace: true`, keeping one canonical address per post
- links shared before the change (`/post/my-trip`) still resolve, via a fallback route that redirects

→ [`src/utils/postUrl.js`](src/utils/postUrl.js), [`src/Pages/Post.jsx`](src/Pages/Post.jsx)

### Permissions belong on the server, not in the UI

Hiding the Edit and Delete buttons from non-authors isn't security — the Appwrite project ID ships inside the JavaScript bundle, so anyone could call the API from the browser console.

Every post is created with its own permissions:

```js
read:   published post → anyone   |   draft → author only
update: author only
delete: author only
```

The feed is public, so a published post is readable by guests, while a draft is
readable only by the person who wrote it — enforced by the database, not the UI.

Because a draft's readability depends on its status, the permissions are rewritten whenever the post is updated. The UI checks are still there for a good experience, but they're a convenience on top of a rule the database enforces.

→ [`src/services/Post.service.js`](src/services/Post.service.js)

### Uploading an image before saving a post is a transaction

Publishing does two things that can each fail: upload an image to Storage, then write a row to the database. If the upload succeeds and the save fails, the image is stranded in the bucket forever, and a naive `catch` leaves the user staring at a form that did nothing.

The form tracks the uploaded file as an **orphan** — an image no saved post points at yet:

```
upload image         →  orphan = new file
save fails           →  delete the orphan, show the error
save succeeds        →  orphan = null   (the post owns it now)
replacing an image   →  delete the OLD file, only after the save succeeded
```

Clearing `orphan` after a successful save is the part that's easy to miss: without it, a later failure in the same `try` block would delete the image the new post is already using.

→ [`src/components/Postform/Postform.jsx`](src/components/Postform/Postform.jsx)

### Keeping the cache honest after a write

Cached lists go stale the moment a post is created, edited or deleted. Every list query is keyed under a shared `["posts", …]` prefix, so one call marks them all for refresh.

Deleting needs more than that. Invalidating alone still renders the cached list on the way back, showing a card for a post that no longer exists — click it and you get a 404. So the deleted row is removed from every cached page first, and the refresh happens after:

```js
queryClient.setQueriesData({ queryKey: ["posts"] }, dropRow(id));
queryClient.invalidateQueries({ queryKey: ["posts"] });
```

→ [`src/Pages/Post.jsx`](src/Pages/Post.jsx)

### Infinite scroll that doesn't stall

An `IntersectionObserver` only fires when an element *crosses* the viewport boundary. Create it once and a first page too short to fill the screen leaves the sentinel permanently visible — no crossing ever happens, and scrolling dies after one page.

The observer is rebuilt whenever a page finishes loading, which re-reports the sentinel's current position and keeps loading until the screen is full. A `rootMargin` of 200px starts the next fetch before the reader reaches the bottom.

→ [`src/Pages/AllPost.jsx`](src/Pages/AllPost.jsx)

### Prefetching on hover

Hovering a post card fetches that post into the cache under the same key and `staleTime` the post page uses, so the click renders from cache instead of showing a loader.

→ [`src/components/PostCard.jsx`](src/components/PostCard.jsx)

### Deploying a client-side router

A single-page app on static hosting 404s on refresh: the host looks for a file at `/post/my-trip/68c1f2…` and finds nothing. [`vercel.json`](vercel.json) rewrites every unmatched path to `index.html` so the router can handle it. Hashed assets are served with a one-year immutable cache.

---

## Running locally

```bash
git clone https://github.com/Ibrahim-techie/app-blog.git
cd app-blog
npm install
cp .env.sample .env    # then fill in your own values
npm run dev
```

### Environment variables

```ini
VITE_APPWRITE_ENDPOINT=https://<region>.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_Table_ID=
VITE_APPWRITE_BUCKET_ID=
VITE_TINYMCE_API_KEY=
```

Anything prefixed `VITE_` is bundled into the client and visible to visitors. That's expected for these — Appwrite protects the project with a domain allowlist and per-row permissions, not by hiding the project ID. **Never put an Appwrite API secret key in a `VITE_` variable.**

### Appwrite setup

1. **Table columns:** `title` (string), `content` (string, large), `featuredImage` (string), `status` (string), `userID` (string), `author` (string)
2. **Indexes:** a fulltext index on `title` for search, plus key indexes on `userID` and `status` for filtering
3. **Storage:** create a bucket and allow image uploads
4. **Platforms:** add `localhost` for development, and your deployed domain — otherwise the browser blocks every request with a CORS error
5. **Row security:** enable it on the table so the per-post permissions above are enforced

---

## Project structure

```
src/
├── Pages/          route-level screens (Home, AllPost, Post, AddPost, EditPost, …)
├── components/     reusable UI + the post form
├── services/       Appwrite wrappers — auth, posts, storage
├── redux/          auth session and theme
├── customHooks/    useDebouncedValue
└── utils/          slug + URL building
```

Appwrite is reached only through `src/services/`, so the pages never import the SDK directly. Swapping the backend means rewriting those files and nothing else.

---

## Roadmap

**Next up**
- [ ] Unit and component tests (Vitest + React Testing Library), starting with slug generation and the pagination hooks
- [ ] GitHub Actions running lint, tests and build on every pull request
- [ ] Migrate to TypeScript, beginning with the service layer

**Features**
- [ ] Comments on posts
- [ ] Likes and bookmarks, with optimistic updates
- [ ] Tags and filtering by tag
- [ ] Public author profiles
- [ ] Draft autosave and estimated reading time

**Polish and performance**
- [ ] Extend dark mode to the post card, post page and editor
- [ ] Persist the chosen theme across reloads
- [ ] Skeleton loaders in place of spinners
- [ ] Shared-element transition from card image to post hero
- [ ] Route-level code splitting to shrink the initial bundle
- [ ] Serve resized images to the feed instead of full-size uploads
- [ ] Accessibility pass: focus trapping in dialogs, labelled form controls

