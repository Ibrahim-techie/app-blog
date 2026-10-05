import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import savedservice from "../services/saved.service";
import postservice from "../services/Post.service";

const PAGE_SIZE = 12;

// Page on the saved rows, not on the posts that came back: a page of 12 saves
// can yield fewer cards if some posts were deleted, and that must not be read
// as "no more pages".
const getNextPageParam = (lastPage) =>
  lastPage.saved.length < PAGE_SIZE
    ? undefined
    : lastPage.saved[lastPage.saved.length - 1].$id;

/**
 * The signed-in user's saved posts, newest save first (or oldest, with
 * `order: "asc"`).
 *
 * savedPosts only links a user to a post id, so each page is two requests:
 * the saved rows, then all of their posts in one batch. The posts table stays
 * the single source of truth — nothing about a post is copied into savedPosts.
 */
function useSavedPosts({ order = "desc" } = {}) {
  const userId = useSelector((state) => state.auth.userData?.$id);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    // "list" stays right after userId so existing invalidations of
    // ["saved", userId, "list"] still cover every order.
    queryKey: ["saved", userId, "list", order],
    queryFn: async ({ pageParam }) => {
      const { rows: saved } = await savedservice.getSavedPosts({
        userId,
        lastId: pageParam,
        limit: PAGE_SIZE,
        order,
      });

      const found = await postservice.getPostsByIds(
        saved.map((row) => row.postId),
      );

      // The batch fetch returns posts in no particular order, so put them back
      // in the order they were saved. Deleted posts, and drafts the reader can
      // no longer see, are missing from `found` and drop out here.
      const byId = new Map(found.map((post) => [post.$id, post]));
      const posts = saved
        .map((row) => byId.get(row.postId))
        .filter(Boolean);

      return { saved, posts };
    },
    initialPageParam: null,
    getNextPageParam,
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  const pages = data?.pages.map((page) => page.posts) ?? [];
  const posts = pages.flat();

  // Named fields rather than `...query`: TanStack only re-renders for the
  // properties a component actually reads, and spreading reads all of them.
  return {
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
  };
}

export default useSavedPosts;
