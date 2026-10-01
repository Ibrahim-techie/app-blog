import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import likeservice from "../services/like.service";
import { subscribeWithCleanup } from "../utils/realtime";

/** Keeps one post's like count and your own like in step with everyone else. */
function useRealtimeLikes(postId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    return subscribeWithCleanup(
      likeservice.subscribeToLike((event) => {
        // The channel carries likes for every post, so ignore the others.
        if (event.payload?.postId !== postId) return;

        // ["likes", postId] is a prefix of both the count and "mine" keys, so
        // this refreshes the number and the filled-in heart in one call.
        queryClient.invalidateQueries({ queryKey: ["likes", postId] });
      }),
    );
  }, [postId, queryClient]);
}

export default useRealtimeLikes;
