import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Postcard, Container, Loader, Button } from "../components";
import GooeySearchBar from "../components/search";
import postservice from "../services/Post.service";
import useDebouncedValue from "../customHooks/useDebouncedValue";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 3;
const STATUS_TABS = ["active", "inactive", "all"];

// Cursor pagination: the next page starts after the last row we already have.
// A short page means the server had nothing left, so stop asking.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const userId = useSelector((state) => state.auth.userData?.$id);
  const [postStatus, setPostStatus] = useState("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();
  const loaderRef = useRef(null);

  const isSignedIn = authStatus && Boolean(userId);
  const isSearching = search.trim().length > 0;
  const isDebouncing = isSearching && search !== debouncedSearch;
  const isTooShort = isSearching && trimmed.length < MIN_SEARCH_LENGTH;

  // userId and postStatus are part of the key so each user and each tab gets
  // its own cache entry. Without them the tabs would keep returning the first
  // tab's cached rows, and a second account on this browser would see the
  // previous user's posts.
  const feed = useInfiniteQuery({
    queryKey: ["posts", "user", userId, postStatus],
    queryFn: ({ pageParam }) =>
      postservice.getcursorRows({
        lastId: pageParam,
        limit: PAGE_SIZE,
        userID: userId,
        status: postStatus,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: isSignedIn,
  });

  const searchList = useInfiniteQuery({
    queryKey: ["posts", "user", userId, postStatus, "search", trimmed],
    queryFn: ({ pageParam }) =>
      postservice.searchRows({
        searchTerm: trimmed,
        lastId: pageParam,
        limit: PAGE_SIZE,
        userID: userId,
        status: postStatus,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: isSignedIn && isSearching && trimmed.length >= MIN_SEARCH_LENGTH,
  });

  const active = isSearching ? searchList : feed;
  const posts = active.data?.pages.flatMap((page) => page.rows) ?? [];

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = active;

  // Rebuilding the observer whenever the page settles re-reports the current
  // intersection, so a first page too short to fill the screen keeps loading
  // instead of waiting for a scroll that never comes.
  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isRefreshing =
    active.isFetching && !active.isFetchingNextPage && !active.isPending;
  const isCountKnown = !isDebouncing && !isTooShort && !active.isPending;

  // ---------------- NOT LOGGED IN ----------------

  // trmporary testing

  if (!isSignedIn) {
    return (
      <main className="min-h-[70vh] bg-gray-50 dark:bg-gray-950">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm dark:bg-indigo-950">
                ✍️
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Read, write, publish
              </h1>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Browse what people are writing — no account needed. Sign in to
                publish your own posts and manage them from a dashboard.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/all-posts"
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Browse posts
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // ---------------- DASHBOARD ----------------

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          {/* Dashboard header */}
          <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Your Dashboard
                  </p>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Your Posts
                </h1>
                <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">
                  Manage, organize and read the content you&apos;ve created.
                </p>
              </div>

              <div className="w-fit rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Showing
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {isCountKnown ? (
                    <>
                      {posts.length}
                      {hasNextPage && "+"}{" "}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {posts.length === 1 && !hasNextPage ? "Post" : "Posts"}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {STATUS_TABS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    aria-pressed={postStatus === status}
                    bgColor={
                      postStatus === status
                        ? "bg-indigo-600"
                        : "bg-transparent hover:bg-white dark:hover:bg-gray-700"
                    }
                    textColor={
                      postStatus === status
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }
                    className="rounded-lg px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-200"
                    onClick={() => setPostStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <GooeySearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search your posts by title..."
            />

            <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 px-1">
              {isSearching ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Searching{" "}
                  {postStatus !== "all" && (
                    <span className="font-medium">{postStatus} </span>
                  )}
                  posts for{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    &quot;{search}&quot;
                  </span>
                </p>
              ) : (
                <span />
              )}

              {isRefreshing && (
                <span className="flex shrink-0 items-center gap-2 rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                  Updating
                </span>
              )}
            </div>
          </div>

          {/* Posts */}
          {isDebouncing ? (
            <Loader
              text="Searching your posts"
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            />
          ) : isTooShort ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                ⌨️
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keep typing
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter at least {MIN_SEARCH_LENGTH} characters to search your
                posts.
              </p>
            </div>
          ) : active.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {active.error?.message ??
                  "We couldn't load your posts. Please try again."}
              </p>
              <button
                type="button"
                onClick={() => active.refetch()}
                disabled={active.isFetching}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {active.isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : active.isPending ? (
            <Loader
              text={isSearching ? "Searching your posts" : "Loading your posts"}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            />
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                {isSearching ? "🔎" : "📝"}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isSearching
                  ? "No posts match your search"
                  : postStatus === "all"
                    ? "No posts yet"
                    : `No ${postStatus} posts`}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {isSearching
                  ? postStatus === "all"
                    ? "Try a different title."
                    : `Try a different title, or search in "all" instead of "${postStatus}".`
                  : postStatus === "all"
                    ? "You haven't written anything yet. Your first post is one click away."
                    : `You don't have any ${postStatus} posts at the moment.`}
              </p>
              {!isSearching && (
                <Link
                  to="/add-post"
                  className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Write a post
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map((post) => (
                <Postcard key={post.$id} {...post} />
              ))}
            </div>
          )}

          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-1.5 py-6">
              <span className="size-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s] dark:bg-gray-400" />
              <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-300" />
              <span className="size-2 animate-bounce rounded-full bg-gray-500 dark:bg-gray-400" />
            </div>
          )}

          {!hasNextPage && !isFetchingNextPage && posts.length > 0 && (
            <div className="flex items-center justify-center gap-4 py-10">
              <span className="h-px w-12 bg-gray-200 dark:bg-gray-800" />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                You&apos;ve reached the end
              </p>
              <span className="h-px w-12 bg-gray-200 dark:bg-gray-800" />
            </div>
          )}

          <div ref={loaderRef} className="h-10" />
        </section>
      </Container>
    </main>
  );
}

export default Home;
