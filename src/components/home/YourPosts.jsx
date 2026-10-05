import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Postcard, Loader } from "../index";
import GooeySearchBar from "../search";
import {
  FeedEmpty,
  FeedEnd,
  FeedError,
  FeedLoadingMore,
  PostGrid,
} from "../feed/FeedStates";
import postservice from "../../services/Post.service";
import useDebouncedValue from "../../customHooks/useDebouncedValue";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 3;
const STATUS_TABS = ["active", "inactive", "all"];

// Cursor pagination: the next page starts after the last row we already have.
// A short page means the server had nothing left, so stop asking.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

/**
 * The signed-in author's dashboard: their own posts with Active / Inactive /
 * All tabs, title search and infinite scroll. Moved here from Home.jsx
 * unchanged in behaviour — same queries, keys and states — and restyled.
 */
function YourPosts({ userId }) {
  const [postStatus, setPostStatus] = useState("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();
  const loaderRef = useRef(null);

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
    enabled: Boolean(userId),
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
    enabled:
      Boolean(userId) && isSearching && trimmed.length >= MIN_SEARCH_LENGTH,
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

  return (
    <section aria-labelledby="your-posts-title" className="border-t border-ink-border pt-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-brand">
            YOUR DASHBOARD
          </p>
          <h2
            id="your-posts-title"
            className="mt-3 text-[24px] font-bold tracking-[-0.6px] text-ink-text sm:text-[30px]"
          >
            YOUR POSTS
          </h2>
          <p className="mt-2 text-[15px] leading-[1.65] text-ink-text-2">
            Manage, organize and read the content you&apos;ve created.
          </p>
        </div>

        <div className="w-fit">
          <p className="font-mono text-[10px] tracking-[0.3px] text-ink-muted">
            SHOWING
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-ink-text tabular-nums">
            {isCountKnown ? (
              <>
                {posts.length}
                {hasNextPage && "+"}{" "}
                <span className="text-xs font-semibold text-ink-text-2">
                  {posts.length === 1 && !hasNextPage ? "Post" : "Posts"}
                </span>
              </>
            ) : (
              <span className="text-ink-muted">—</span>
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Post status"
          className="inline-flex w-fit rounded-[3px] border border-ink-border bg-ink-surface p-1"
        >
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={postStatus === status}
              onClick={() => setPostStatus(status)}
              className={`h-9 rounded-[2px] px-4 text-xs font-extrabold capitalize transition-colors ${
                postStatus === status
                  ? "bg-ink-sage text-ink-on-sage"
                  : "text-ink-text-2 hover:text-ink-text"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <GooeySearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search your posts by title..."
        />
      </div>

      <div className="mb-6 flex min-h-6 items-center justify-between gap-3">
        {isSearching ? (
          <p className="text-sm text-ink-text-2">
            Searching{" "}
            {postStatus !== "all" && (
              <span className="font-semibold">{postStatus} </span>
            )}
            posts for{" "}
            <span className="font-extrabold text-ink-text">
              &quot;{search}&quot;
            </span>
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

      {isDebouncing ? (
        <Loader text="Searching your posts" compact />
      ) : isTooShort ? (
        <FeedEmpty title="Keep typing">
          Enter at least {MIN_SEARCH_LENGTH} characters to search your posts.
        </FeedEmpty>
      ) : active.isError ? (
        <FeedError
          message={
            active.error?.message ??
            "We couldn't load your posts. Please try again."
          }
          onRetry={() => active.refetch()}
          isRetrying={active.isFetching}
        />
      ) : active.isPending ? (
        <Loader
          text={isSearching ? "Searching your posts" : "Loading your posts"}
          compact
        />
      ) : posts.length === 0 ? (
        <FeedEmpty
          title={
            isSearching
              ? "No posts match your search"
              : postStatus === "all"
                ? "No posts yet"
                : `No ${postStatus} posts`
          }
          action={
            isSearching ? undefined : { to: "/add-post", label: "Write a post" }
          }
        >
          {isSearching
            ? postStatus === "all"
              ? "Try a different title."
              : `Try a different title, or search in "all" instead of "${postStatus}".`
            : postStatus === "all"
              ? "You haven't written anything yet. Your first post is one click away."
              : `You don't have any ${postStatus} posts at the moment.`}
        </FeedEmpty>
      ) : (
        <PostGrid>
          {posts.map((post) => (
            <Postcard key={post.$id} {...post} />
          ))}
        </PostGrid>
      )}

      {isFetchingNextPage && <FeedLoadingMore />}

      {!hasNextPage && !isFetchingNextPage && posts.length > 0 && <FeedEnd />}

      <div ref={loaderRef} className="h-10" />
    </section>
  );
}

export default YourPosts;
