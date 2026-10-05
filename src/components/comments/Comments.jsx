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
      className="pt-5"
    >
      <div>
        <h2
          id="comments-heading"
          className="mb-6 scroll-mt-28 text-[28px] font-bold tracking-[-0.56px] text-ink-text"
        >
          COMMENTS{!isPending && !isError && ` (${total})`}
        </h2>

        <PostComment postId={postId} />

        <div className="mt-2">
          {isPending ? (
            <Loader text="Loading comments" compact />
          ) : isError ? (
            <div className="rounded-[2px] border border-ink-error/50 bg-ink-surface px-4 py-6 text-center">
              <p className="text-sm font-extrabold text-ink-error">
                We couldn&apos;t load the comments.
              </p>
              <p className="mt-1 text-xs text-ink-text-2">
                {error?.message}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-4 inline-flex h-9 items-center rounded-[3px] border border-ink-border-strong bg-ink-primary px-4 text-xs font-extrabold text-ink-on-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFetching ? "Retrying…" : "Try again"}
              </button>
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-text-2">
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
                    className="inline-flex h-10 items-center rounded-[3px] border border-ink-border bg-ink-surface px-5 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFetchingNextPage
                      ? "Loading…"
                      : `View all ${total} comments`}
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
