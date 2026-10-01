import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import commentService from "../services/comment.service";
import { subscribeWithCleanup } from "../utils/realtime";

/**
 * Keeps one post's comment list in step with everyone else's changes.
 *
 * Rather than patching the cache from the event payload, this marks the list
 * stale and lets TanStack Query refetch — the server stays the single source
 * of truth, and a burst of events collapses into one refetch.
 */
function useRealtimeComments(postId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    return subscribeWithCleanup(
      commentService.subscribeToComments((event) => {
        // The channel carries every post's comments, so ignore other posts'.
        if (event.payload?.postId !== postId) return;

        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }),
    );
  }, [postId, queryClient]);
}

export default useRealtimeComments;
