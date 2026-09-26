import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import commentService from "../services/comment.service";

/**
 * Keeps one post's comment list in step with everyone else's changes.
 *
 * Appwrite pushes an event whenever a comment row is created, updated or
 * deleted. Rather than trying to patch the cache from the payload, this marks
 * the list stale and lets TanStack Query refetch — the server stays the single
 * source of truth, and a burst of events collapses into one refetch.
 */
function useRealtimeComments(postId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    const unsubscribe = commentService.subscribeToComments((event) => {
      // The channel carries every post's comments, so ignore other posts'.
      if (event.payload?.postId !== postId) return;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    });

    return unsubscribe;
  }, [postId, queryClient]);
}

export default useRealtimeComments;
