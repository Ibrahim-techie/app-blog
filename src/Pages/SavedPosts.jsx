import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import useSavedPosts from "../customHooks/useSavedPosts";
import savedservice from "../services/saved.service";
import postservice from "../services/Post.service";
import { excerpt, readingMinutes } from "../utils/postText";
import { categoryLabel } from "../constants/categories";
import CardGrid from "../components/feed/CardGrid";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import {
  EditorialNote,
  FeedEmpty,
  FeedEnd,
  FeedError,
  FeedLoadingMore,
  PageHero,
  SectionHeading,
  StateCard,
} from "../components/feed/FeedStates";

const SORT_OPTIONS = [
  { value: "desc", label: "Recently saved" },
  { value: "asc", label: "Oldest saved" },
];

/**
 * Shown under the empty state: the three newest published articles. Shares
 * Home's "featured" query, so it's usually already cached.
 */
function SuggestedPosts() {
  const newest = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: () => postservice.getFeaturedPosts(3),
    staleTime: 60_000,
  });

  if (!newest.data?.length) return null;

  const rows = newest.data.map(({ content, ...post }) => ({
    ...post,
    excerpt: excerpt(content),
    readingMinutes: readingMinutes(content),
  }));

  return (
    <section aria-labelledby="suggested-title" className="flex flex-col gap-6 pt-4">
      <SectionHeading
        id="suggested-title"
        title="Suggested for you"
        meta="NEWEST ON INK"
      />
      <CardGrid pages={[rows]} wideFirst={false} />
    </section>
  );
}

function SavedPosts() {
  const userId = useSelector((state) => state.auth.userData?.$id);
  const loaderRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [order, setOrder] = useState("desc");

  const {
    pages,
    posts,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSavedPosts({ order });

  const savedCount = useQuery({
    queryKey: ["saved", userId, "count"],
    queryFn: () => savedservice.getSavedCount(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // Saved rows don't carry a category, so the filter applies to the posts
  // already loaded. While a category is chosen the observer below keeps
  // pulling pages until the list is exhausted, so nothing is missed.
  const visiblePages = category
    ? pages.map((rows) => rows.filter((post) => post.category === category))
    : pages;
  const visibleCount = visiblePages.reduce((sum, rows) => sum + rows.length, 0);

  // Rebuilding the observer whenever a page settles re-reports the current
  // intersection, so a first page too short to fill the screen keeps loading.
  // Same approach as AllPost.jsx.
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

  // A page of saves can come back with no visible posts if they were all
  // deleted. Only call the list empty once there is nothing more to fetch.
  const isEmpty = posts.length === 0 && !hasNextPage;
  const label = categoryLabel(category);
  const count = savedCount.data;

  return (
    <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-8 px-5 py-8 sm:p-10">
      <div className="flex flex-col gap-6">
        <PageHero title="Bookmarks.">Save ideas worth coming back to.</PageHero>
        {!isEmpty && (
          <FeedToolbar
            category={category}
            onCategory={setCategory}
            sort={order}
            sortOptions={SORT_OPTIONS}
            onSort={setOrder}
          />
        )}
      </div>

      <section aria-labelledby="saved-title" className="flex flex-col gap-6">
        <SectionHeading
          id="saved-title"
          title={label ? `Saved · ${label}` : "Saved posts"}
          meta={
            count === undefined
              ? null
              : `${count} saved post${count === 1 ? "" : "s"}`
          }
        />

        {isPending ? (
          <StateCard kind="loading" title="Loading your saved posts">
            Your library is on its way.
          </StateCard>
        ) : isError ? (
          <FeedError
            message={
              error?.message ??
              "We couldn't load your saved posts. Please try again."
            }
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : isEmpty ? (
          <FeedEmpty
            icon="bookmark"
            title="No saved posts yet."
            action={{ to: "/all-posts", label: "Explore Posts" }}
          >
            Bookmark articles you want to read later and they&apos;ll appear
            here.
          </FeedEmpty>
        ) : visibleCount === 0 && !hasNextPage ? (
          <StateCard kind="empty" title={`No saved ${label} posts`}>
            Choose another category, or All, to see everything you saved.
          </StateCard>
        ) : (
          <CardGrid pages={visiblePages} />
        )}

        {isFetchingNextPage && <FeedLoadingMore />}

        {!hasNextPage && !isFetchingNextPage && visibleCount > 0 && <FeedEnd />}

        <div ref={loaderRef} className="h-10" />

        {isEmpty && <SuggestedPosts />}

        {!isEmpty && (
          <EditorialNote
            left="ONLY YOU CAN SEE YOUR BOOKMARKS."
            right={order === "asc" ? "OLDEST SAVED FIRST" : "RECENTLY SAVED FIRST"}
          />
        )}
      </section>
    </div>
  );
}

export default SavedPosts;
