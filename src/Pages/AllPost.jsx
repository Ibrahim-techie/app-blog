import { useState, useRef, useEffect } from "react";
import { Postcard, Container, Loader } from "../components";
import postservice from "../services/Post.service";
import GooeySearchBar from "../components/search";
import useDebouncedValue from "../customHooks/useDebouncedValue";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 3;

// Cursor pagination: the next page starts after the last row we already have.
// A short page means the server had nothing left, so stop asking.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

function AllPost() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();

  const isSearching = search.trim().length > 0;
  const isDebouncing = isSearching && search !== debouncedSearch;
  const isTooShort = isSearching && trimmed.length < MIN_SEARCH_LENGTH;
  const loaderRef = useRef(null);

  const feed = useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: ({ pageParam }) =>
      postservice.getcursorRows({ lastId: pageParam, limit: PAGE_SIZE }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
  });

  const searchList = useInfiniteQuery({
    queryKey: ["posts", "search", trimmed],
    queryFn: ({ pageParam }) =>
      postservice.searchRows({
        searchTerm: trimmed,
        lastId: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: isSearching && trimmed.length >= MIN_SEARCH_LENGTH,
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
      //pretend that viewport is 200px bigger so it can be fetched early
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isRefreshing =
    active.isFetching && !active.isFetchingNextPage && !active.isPending;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Explore
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Discover Posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Search through articles, discover new ideas, and find something
              worth reading.
            </p>
          </div>

          <div className="mb-8">
            <GooeySearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search posts by title..."
            />

            <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 px-1">
              {isSearching ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Searching for{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    &quot;{search}&quot;
                  </span>
                </p>
              ) : (
                <span />
              )}

              {isRefreshing && (
                <span className="flex shrink-0 items-center gap-2 rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                  Updating
                </span>
              )}
            </div>
          </div>

          {isDebouncing ? (
            <Loader
              text="Searching posts"
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ) : isTooShort ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                ⌨️
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Keep typing
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Enter at least {MIN_SEARCH_LENGTH} characters to search posts.
              </p>
            </div>
          ) : active.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {active.error?.message ??
                  "We couldn't load these posts. Please try again."}
              </p>
              <button
                onClick={() => active.refetch()}
                disabled={active.isFetching}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {active.isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : active.isPending ? (
            <Loader
              text={isSearching ? "Searching posts" : "Loading posts"}
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                {isSearching ? "🔎" : "📝"}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {isSearching ? "No posts found" : "No posts yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {isSearching
                  ? "We couldn't find any posts matching your search."
                  : "There's nothing published here yet. Check back soon."}
              </p>
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
              <span className="size-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s] dark:bg-slate-400" />
              <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s] dark:bg-slate-300" />
              <span className="size-2 animate-bounce rounded-full bg-slate-500 dark:bg-slate-400" />
            </div>
          )}

          {!hasNextPage && !isFetchingNextPage && posts.length > 0 && (
            <div className="flex items-center justify-center gap-4 py-10">
              <span className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                You&apos;ve reached the end
              </p>
              <span className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
            </div>
          )}

          <div ref={loaderRef} className="h-10" />
        </section>
      </Container>
    </main>
  );
}

export default AllPost;
