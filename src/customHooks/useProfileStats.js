import { useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import likeservice from "../services/like.service";
import commentService from "../services/comment.service";

/**
 * Published posts, likes received and comments received for one user.
 *
 * Neither likes nor comments record who wrote the post, so this first finds
 * the user's published post ids, then counts likes and comments on those.
 * The user's own likes and comments are left out — they weren't "received".
 *
 * Keyed under ["posts"] on purpose: creating, editing or deleting a post
 * already invalidates ["posts"], so the counts refresh with no extra wiring.
 */
function useProfileStats(userId) {
  return useQuery({
    queryKey: ["posts", "user", userId, "stats"],
    queryFn: async () => {
      const postIds = await postservice.getPublishedPostIds(userId);
      if (postIds.length === 0) return { posts: 0, likes: 0, comments: 0 };

      const [likes, comments] = await Promise.all([
        likeservice.getLikeCountForPosts(postIds, userId),
        commentService.getCommentCountForPosts(postIds, userId),
      ]);

      return { posts: postIds.length, likes, comments };
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export default useProfileStats;
