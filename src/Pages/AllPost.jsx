import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import GooeySearchBar from "../components/search";
import useDebouncedValue from "../customHooks/useDebouncedValue";
import { categoryLabel, isCategory } from "../constants/categories";
import CardGrid from "../components/feed/CardGrid";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import {
  EditorialNote,
  FeedEnd,
  FeedError,
  FeedLoadingMore,
  PageHero,
  SectionHeading,
  StateCard,
} from "../components/feed/FeedStates";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 3;

// Only orders Appwrite can actually produce. "Most liked" / "Most discussed"
// from the design would need like and comment counts stored on the post.
const SORT_OPTIONS = [
  { value: "desc", label: "Latest" },
  { value: "asc", label: "Oldest" },
];

// Cursor pagination: the next page starts after the last row we already have.
// A short page means the server had nothing left, so stop asking.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

function AllPost() {
  // Category and sort live in the URL, so sidebar / Home links can open a
  // filtered Explore and the view survives a reload. Unknown values are
  // ignored rather than trusted.
  const [params, setParams] = useSearchParams();
  const rawCategory = params.get("category");
  const category = isCategory(rawCategory) ? rawCategory : null;
  const order = params.get("sort") === "asc" ? "asc" : "desc";

  // The header search arrives as ?q=. Typing here stays local (rewriting the
  // URL on every keystroke would add a history entry per letter), but a new
  // ?q= from the header replaces whatever was typed.
  const urlQuery = params.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    setSearch(urlQuery);
  }

  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();

  const isSearching = search.trim().length > 0;
  const isDebouncing = isSearching && search !== debouncedSearch;
  const isTooShort = isSearching && trimmed.length < MIN_SEARCH_LENGTH;
  const loaderRef = useRef(null);

  const setParam = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });

  const feed = useInfiniteQuery({
    queryKey: ["posts", "feed", category, order],
    queryFn: ({ pageParam }) =>
      postservice.getcursorRows({
        lastId: pageParam,
        limit: PAGE_SIZE,
        category,
        order,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
  });

  const searchList = useInfiniteQuery({
    queryKey: ["posts", "search", trimmed, category, order],
    queryFn: ({ pageParam }) =>
      postservice.searchRows({
        searchTerm: trimmed,
        lastId: pageParam,
        limit: PAGE_SIZE,
        category,
        order,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: isSearching && trimmed.length >= MIN_SEARCH_LENGTH,
  });

  // The real number of published posts in this view, for the section header.
  const total = useQuery({
    queryKey: ["posts", "count", category],
    queryFn: () => postservice.getPostCount({ status: "active", category }),
    staleTime: 60000,
  });

  const active = isSearching ? searchList : feed;
  const pages = active.data?.pages.map((page) => page.rows) ?? [];
  const postCount = pages.reduce((sum, rows) => sum + rows.length, 0);

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
      //pretend that viewport is 200px bigger so it can be fetched early
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isRefreshing =
    active.isFetching && !active.isFetchingNextPage && !active.isPending;
  const label = categoryLabel(category);

  const meta = isSearching
    ? isTooShort || isDebouncing || active.isPending
      ? null
      : `${postCount}${hasNextPage ? "+" : ""} RESULT${postCount === 1 && !hasNextPage ? "" : "S"}`
    : total.data !== undefined
      ? `${total.data} ARTICLE${total.data === 1 ? "" : "S"}`
      : null;

  return (
    <div className="flex flex-col gap-8 px-5 py-8 sm:p-10">
      <PageHero title="EXPLORE IDEAS.">
        Discover stories, knowledge and ideas from writers across INK.
      </PageHero>

      <GooeySearchBar
        size="lg"
        value={search}
        onChange={setSearch}
        placeholder={label ? `Search ${label} articles…` : "Search articles…"}
      />

      <FeedToolbar
        category={category}
        onCategory={(key) => setParam("category", key)}
        sort={order}
        sortOptions={SORT_OPTIONS}
        onSort={(value) => setParam("sort", value === "asc" ? "asc" : null)}
      />

      <section aria-labelledby="explore-results" className="flex flex-col gap-6">
        <SectionHeading
          id="explore-results"
          title={
            isSearching
              ? "SEARCH RESULTS"
              : label
                ? label.toUpperCase()
                : "ALL POSTS"
          }
          meta={meta}
        />

        {(isSearching || isRefreshing) && (
          <div className="-mt-4 flex min-h-5 items-center justify-between gap-3">
            {isSearching ? (
              <p className="text-sm text-ink-text-2">
                Searching for{" "}
                <span className="font-extrabold text-ink-text">
                  &quot;{search}&quot;
                </span>
                {label && <> in {label}</>}
              </p>
            ) : (
              <span />
            )}
            {isRefreshing && (
              <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-[0.3px] text-ink-muted">
                <span className="size-1.5 animate-pulse bg-ink-brand" />
                UPDATING
              </span>
            )}
          </div>
        )}

        {isDebouncing ? (
          <StateCard kind="loading" title="Searching posts">
            Fresh perspectives are on their way.
          </StateCard>
        ) : isTooShort ? (
          <StateCard kind="search" title="Keep typing">
            Enter at least {MIN_SEARCH_LENGTH} characters to search posts.
          </StateCard>
        ) : active.isError ? (
          <FeedError
            message={
              active.error?.message ??
              "We couldn't load these posts. Please try again."
            }
            onRetry={() => active.refetch()}
            isRetrying={active.isFetching}
          />
        ) : active.isPending ? (
          <StateCard kind="loading" title="Loading posts">
            Fresh perspectives are on their way.
          </StateCard>
        ) : postCount === 0 ? (
          isSearching ? (
            <StateCard kind="search" title="No search results">
              Try another keyword or browse all topics.
            </StateCard>
          ) : (
            <StateCard kind="empty" title="No posts available">
              {label
                ? `Nothing has been published in ${label} yet. Check back soon.`
                : "New stories will appear here. Check back soon."}
            </StateCard>
          )
        ) : (
          <CardGrid pages={pages} />
        )}

        {isFetchingNextPage && <FeedLoadingMore />}

        {!hasNextPage && !isFetchingNextPage && postCount > 0 && <FeedEnd />}

        <div ref={loaderRef} className="h-10" />

        <EditorialNote
          left="INDEPENDENT VOICES. FRESH PERSPECTIVES."
          right={order === "asc" ? "OLDEST FIRST" : "NEWEST FIRST"}
        />
      </section>
    </div>
  );
}

export default AllPost;
