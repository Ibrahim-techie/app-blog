import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import likeservice from "../services/like.service";
import commentService from "../services/comment.service";
import savedservice from "../services/saved.service";

/**
 * Everything a page of cards shows beyond the post row itself — like and
 * comment counts, and whether each post is bookmarked — in at most three
 * requests for the whole page instead of two or three per card.
 *
 * The bookmark answers are written into the same cache entries each card's
 * SaveButton reads (["saved", userId, "post", postId]), so those buttons
 * start out correct and don't ask Appwrite again.
 */
function useCardMeta(postIds) {
  const userId = useSelector((state) => state.auth.userData?.$id);
  const queryClient = useQueryClient();

  return useQuery({
    // Under ["likes"] would collide with per-post like keys; a separate root
    // keeps it independent. Sorted so the same page always shares an entry.
    queryKey: ["card-meta", userId ?? "guest", [...postIds].sort()],
    queryFn: async () => {
      const [likes, comments, saved] = await Promise.all([
        likeservice.getLikeCountsByPost(postIds),
        commentService.getCommentCountsByPost(postIds),
        userId ? savedservice.getUserSavedForPosts(userId, postIds) : [],
      ]);

      if (userId) {
        const byPost = new Map(saved.map((row) => [row.postId, row]));
        for (const id of postIds) {
          queryClient.setQueryData(
            ["saved", userId, "post", id],
            byPost.get(id) ?? null,
          );
        }
      }

      return { likes, comments };
    },
    enabled: postIds.length > 0,
    staleTime: 60_000,
  });
}

export default useCardMeta;
