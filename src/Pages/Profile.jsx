import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Postcard, Container, Loader } from "../components";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import EditProfileDialog from "../components/profile/EditProfileDialog";
import postservice from "../services/Post.service";
import useProfileStats from "../customHooks/useProfileStats";

const PAGE_SIZE = 12;

// Cursor pagination, same as the other feeds.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

function Profile() {
  const user = useSelector((state) => state.auth.userData);
  const userId = user?.$id;
  const [isEditing, setIsEditing] = useState(false);
  const loaderRef = useRef(null);

  const stats = useProfileStats(userId);

  // Published posts only — drafts stay on the Home dashboard. Kept under
  // ["posts", "user", userId] so post create/edit/delete refresh it too.
  const myPosts = useInfiniteQuery({
    queryKey: ["posts", "user", userId, "profile"],
    queryFn: ({ pageParam }) =>
      postservice.getcursorRows({
        lastId: pageParam,
        limit: PAGE_SIZE,
        userID: userId,
        status: "active",
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: Boolean(userId),
  });

  const posts = myPosts.data?.pages.flatMap((page) => page.rows) ?? [];
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = myPosts;

  // Same infinite-scroll observer as AllPost.jsx.
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
    <main className="min-h-screen bg-writr-bg dark:bg-gray-950">
      <Container>
        <div className="px-4 py-14 sm:px-6 lg:px-0">
          <ProfileHeader user={user} onEdit={() => setIsEditing(true)} />

          <ProfileStats
            stats={stats.data}
            isPending={stats.isPending}
            isError={stats.isError}
            isFetching={stats.isFetching}
            onRetry={() => stats.refetch()}
          />

          <section aria-labelledby="my-posts-title">
            <div className="mb-6 flex items-baseline justify-between border-b border-writr-border pb-3 dark:border-gray-800">
              <h2
                id="my-posts-title"
                className="font-serif text-2xl text-writr-text dark:text-white"
              >
                My Posts
              </h2>
              <Link
                to="/add-post"
                className="text-sm text-writr-text-2 underline-offset-4 hover:text-writr-text hover:underline dark:text-gray-400 dark:hover:text-white"
              >
                Write a post
              </Link>
            </div>

            {myPosts.isPending ? (
              <Loader text="Loading your posts" />
            ) : myPosts.isError ? (
              <div className="rounded-[6px] border border-writr-border bg-writr-surface px-6 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-medium text-writr-text dark:text-white">
                  Something went wrong
                </h3>
                <p className="mt-2 text-sm text-writr-text-2 dark:text-gray-400">
                  {myPosts.error?.message ??
                    "We couldn't load your posts. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => myPosts.refetch()}
                  disabled={myPosts.isFetching}
                  className="mt-5 rounded-[4px] border border-writr-text px-4 py-2 text-sm text-writr-text transition-colors hover:bg-writr-text hover:text-writr-surface disabled:opacity-60 dark:border-gray-300 dark:text-gray-200"
                >
                  {myPosts.isFetching ? "Retrying…" : "Retry"}
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-[6px] border border-dashed border-writr-border bg-writr-surface px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
                <h3 className="font-serif text-xl text-writr-text dark:text-white">
                  Nothing published yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-writr-text-2 dark:text-gray-400">
                  Posts you publish will appear here. Drafts stay on your
                  dashboard until you make them active.
                </p>
                <Link
                  to="/add-post"
                  className="mt-6 inline-block rounded-[4px] bg-writr-green px-5 py-2.5 text-sm font-medium text-writr-surface transition-colors hover:bg-writr-text dark:bg-gray-100 dark:text-gray-900"
                >
                  Write your first post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posts.map((post) => (
                  <Postcard key={post.$id} {...post} />
                ))}
              </div>
            )}

            {isFetchingNextPage && (
              <Loader text="Loading more" compact />
            )}

            <div ref={loaderRef} className="h-10" />
          </section>
        </div>
      </Container>

      {isEditing && (
        <EditProfileDialog user={user} onClose={() => setIsEditing(false)} />
      )}
    </main>
  );
}

export default Profile;
