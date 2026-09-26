import { useInfiniteQuery } from "@tanstack/react-query";
import commentService from "../../services/comment.service";
import Loader from "../Loading";
import PostComment from "./PostComment";
import CommentList from "./CommentList";
import useRealtimeComments from "../../customHooks/useRealtimeComments";

const PAGE_SIZE = 10;

// A short page means the server had nothing left, so stop asking.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

/**
 * Owns the comment section for one post: fetching, paging and the surrounding
 * states. The pieces below it stay presentational — CommentList maps, and
 * CommentItem renders and edits a single comment.
 */
function Comments({ postId }) {
  // Comments posted or removed in another browser show up here without a reload.
  useRealtimeComments(postId);

  const query = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) =>
      commentService.getComments({
        postId,
        lastId: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: null,
    getNextPageParam,
    enabled: !!postId,
    staleTime: 3000,
  });

  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isFetching,
  } = query;

  const comments = data?.pages.flatMap((page) => page.rows) ?? [];
  // Appwrite reports the real total, so the heading isn't just "loaded so far".
  const total = data?.pages[0]?.total ?? comments.length;

  if (!postId) return null;

  return (
    <section
      aria-labelledby="comments-heading"
      className="mx-auto mt-10 max-w-4xl"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <h2
            id="comments-heading"
            className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Comments
          </h2>
          {!isPending && !isError && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {total}
            </span>
          )}
        </div>

        <PostComment postId={postId} />

        <div className="mt-8">
          {isPending ? (
            <Loader text="Loading comments" compact />
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                We couldn&apos;t load the comments.
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {error?.message}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFetching ? "Retrying…" : "Try again"}
              </button>
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No comments yet — be the first to say something.
            </p>
          ) : (
            <>
              <CommentList comments={comments} postId={postId} />

              {hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {isFetchingNextPage
                      ? "Loading…"
                      : `Load more comments (${total - comments.length} left)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Comments;
