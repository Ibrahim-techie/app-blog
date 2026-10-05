import { useEffect, useRef } from "react";
import CardGrid from "./CardGrid";
import {
  FeedEmpty,
  FeedEnd,
  FeedError,
  FeedLoadingMore,
  StateCard,
} from "./FeedStates";

/**
 * Grid + states + infinite scroll for any paged post list that exposes
 * `pages` (arrays of post rows) and TanStack's infinite-query flags — the
 * profile tabs all have that shape.
 */
function PagedFeed({ feed, loadingTitle, empty }) {
  const loaderRef = useRef(null);
  const { pages, hasNextPage, isFetchingNextPage, fetchNextPage } = feed;
  const count = pages.reduce((sum, rows) => sum + rows.length, 0);

  // Same observer as AllPost.jsx: rebuilt whenever a page settles so a short
  // first page keeps loading until the sentinel leaves the viewport.
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

  return (
    <>
      {feed.isPending ? (
        <StateCard kind="loading" title={loadingTitle}>
          Fresh perspectives are on their way.
        </StateCard>
      ) : feed.isError ? (
        <FeedError
          message={feed.error?.message ?? "We couldn't load these posts."}
          onRetry={() => feed.refetch()}
          isRetrying={feed.isFetching}
        />
      ) : count === 0 && !hasNextPage ? (
        <FeedEmpty title={empty.title} action={empty.action}>
          {empty.text}
        </FeedEmpty>
      ) : (
        <CardGrid pages={pages} />
      )}

      {isFetchingNextPage && <FeedLoadingMore />}
      {!hasNextPage && !isFetchingNextPage && count > 0 && <FeedEnd />}
      <div ref={loaderRef} className="h-10" />
    </>
  );
}

export default PagedFeed;
