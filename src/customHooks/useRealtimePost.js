import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import { subscribeWithCleanup } from "../utils/realtime";

/** Refreshes this post when its author edits it in another browser. */
function useRealtimePosts(postId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    return subscribeWithCleanup(
      postservice.subscribeToPosts((event) => {
        // A post row identifies itself by $id. There is no postId column here
        // — that belongs to comments and likes, which point *at* a post.
        if (event.payload?.$id !== postId) return;

        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        // The title or image may have changed, so cached feed cards are stale.
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }),
    );
  }, [postId, queryClient]);
}

export default useRealtimePosts;
