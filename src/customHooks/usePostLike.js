import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import likeservice from "../services/like.service";
import useRealtimeLikes from "./useRealtimeLikes";
// Stand-in row used only between the click and the server's reply.
const PENDING_LIKE = { $id: "__optimistic__" };

/**
 * Like state for one post: whether you've liked it, how many likes it has,
 * and a toggle.
 *
 * The toggle updates the cache before the request finishes, because a heart
 * that waits on a round trip feels broken. If the server refuses, the previous
 * values are put back and the user is told.
 */
function usePostLike(postId) {
  const userId = useSelector((state) => state.auth.userData?.$id);
  const queryClient = useQueryClient();

  // postId sits directly after "likes" so ["likes", postId] is a prefix of
  // both keys — one invalidation refreshes the count and my own like together,
  // without touching other posts' cached likes.
  const mineKey = ["likes", postId, "mine", userId];
  const countKey = ["likes", postId, "count"];

  const { data: myLike } = useQuery({
    queryKey: mineKey,
    queryFn: () => likeservice.getUserLike(userId, postId),
    enabled: Boolean(userId && postId),
    staleTime: 60_000,
  });

  const { data: count = 0 } = useQuery({
    queryKey: countKey,
    queryFn: () => likeservice.getLikeCount(postId),
    enabled: Boolean(postId),
    staleTime: 60_000,
  });

  useRealtimeLikes(postId);

  const liked = Boolean(myLike);

  const toggle = useMutation({
    mutationFn: () =>
      myLike
        ? likeservice.removeLike(myLike.$id)
        : likeservice.createLike(userId, postId),

    onMutate: async () => {
      // Stop in-flight refetches from overwriting the optimistic values.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: mineKey }),
        queryClient.cancelQueries({ queryKey: countKey }),
      ]);

      const previous = {
        mine: queryClient.getQueryData(mineKey),
        count: queryClient.getQueryData(countKey),
      };

      const isLiking = !previous.mine;
      queryClient.setQueryData(mineKey, isLiking ? PENDING_LIKE : null);
      queryClient.setQueryData(countKey, (old) =>
        Math.max(0, (old ?? 0) + (isLiking ? 1 : -1)),
      );

      return previous;
    },

    onError: (error, _variables, previous) => {
      if (previous) {
        queryClient.setQueryData(mineKey, previous.mine);
        queryClient.setQueryData(countKey, previous.count);
      }
      toast.error("Couldn't update your like", {
        description: error?.message || "Please try again.",
      });
    },

    // Replace the stand-in row with whatever the server really has, whether
    // the write succeeded or was rolled back.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mineKey });
      queryClient.invalidateQueries({ queryKey: countKey });
      // Card grids and the profile "Liked" tab show likes too.
      queryClient.invalidateQueries({ queryKey: ["card-meta"] });
      queryClient.invalidateQueries({ queryKey: ["likes", "user", userId] });
    },
  });

  return {
    liked,
    count,
    canLike: Boolean(userId),
    isPending: toggle.isPending,
    toggle: () => toggle.mutate(),
  };
}

export default usePostLike;
