import { useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import likeservice from "../services/like.service";
import commentService from "../services/comment.service";
import { CATEGORIES } from "../constants/categories";

// Platform-wide numbers move slowly; five minutes stale is plenty.
const STALE = 5 * 60_000;

/**
 * Real platform totals for the Home hero: published articles, likes and
 * comments. Each is a single count request — no rows are downloaded.
 *
 * Under ["posts"] so publishing or deleting a post refreshes them through the
 * invalidation the post form and delete flow already do.
 */
export function useSiteStats() {
  return useQuery({
    queryKey: ["posts", "site-stats"],
    queryFn: async () => {
      const [articles, likes, comments] = await Promise.all([
        postservice.getPostCount({ status: "active" }),
        likeservice.getTotalLikeCount(),
        commentService.getTotalCommentCount(),
      ]);
      return { articles, likes, comments };
    },
    staleTime: STALE,
  });
}

/** Published-article count per category, for the Home community panel. */
export function useCategoryCounts() {
  return useQuery({
    queryKey: ["posts", "category-counts"],
    queryFn: async () => {
      const counts = await Promise.all(
        CATEGORIES.map((category) =>
          postservice.getPostCount({ status: "active", category: category.key }),
        ),
      );
      return Object.fromEntries(
        CATEGORIES.map((category, index) => [category.key, counts[index]]),
      );
    },
    staleTime: STALE,
  });
}
