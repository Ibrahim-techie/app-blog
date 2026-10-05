import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import likeservice from "../services/like.service";
import postservice from "../services/Post.service";

const PAGE_SIZE = 12;

// Page on the like rows, not the posts found — same reasoning as useSavedPosts.
const getNextPageParam = (lastPage) =>
  lastPage.liked.length < PAGE_SIZE
    ? undefined
    : lastPage.liked[lastPage.liked.length - 1].$id;

/**
 * The posts the signed-in user has liked, most recent like first. Built the
 * same way as useSavedPosts: a page of like rows, then their posts in one
 * batch. Lives under ["likes", "user", userId] so it never collides with the
 * per-post ["likes", postId, …] keys.
 */
function useLikedPosts({ enabled = true } = {}) {
  const userId = useSelector((state) => state.auth.userData?.$id);

  const query = useInfiniteQuery({
    queryKey: ["likes", "user", userId, "list"],
    queryFn: async ({ pageParam }) => {
      const { rows: liked } = await likeservice.getUserLikes({
        userId,
        lastId: pageParam,
        limit: PAGE_SIZE,
      });
      const found = await postservice.getPostsByIds(
        liked.map((row) => row.postId),
      );
      const byId = new Map(found.map((post) => [post.$id, post]));
      return {
        liked,
        posts: liked.map((row) => byId.get(row.postId)).filter(Boolean),
      };
    },
    initialPageParam: null,
    getNextPageParam,
    enabled: Boolean(userId) && enabled,
    staleTime: 60_000,
  });

  const pages = query.data?.pages.map((page) => page.posts) ?? [];

  return {
    pages,
    posts: pages.flat(),
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

export default useLikedPosts;
