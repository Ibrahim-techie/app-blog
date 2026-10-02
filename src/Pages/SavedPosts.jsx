import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Postcard, Container, Loader } from "../components";
import useSavedPosts from "../customHooks/useSavedPosts";

function SavedPosts() {
  const loaderRef = useRef(null);
  const {
    posts,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSavedPosts();

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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Your library
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Saved Posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Posts you&apos;ve bookmarked to come back to later. Only you can
              see this list.
            </p>
          </div>

          {isPending ? (
            <Loader
              text="Loading your saved posts"
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {error?.message ??
                  "We couldn't load your saved posts. Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                🔖
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                You haven&apos;t saved any posts yet.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Press Save on any post and it will show up here.
              </p>
              <Link
                to="/all-posts"
                className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Browse posts
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

export default SavedPosts;
