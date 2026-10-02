import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import savedservice from "../services/saved.service";

/**
 * Save state for one post: whether you've saved it, and a toggle.
 *
 * Deliberately not optimistic. The cache is updated from the server's reply,
 * so the button only ever shows a state that really exists.
 */
function usePostSave(postId) {
  const userId = useSelector((state) => state.auth.userData?.$id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // userId sits directly after "saved" so ["saved", userId] is a prefix of
  // every saved-posts key for this user — the same reasoning as the likes keys.
  // It also keeps one account's saves out of another's cache on a shared browser.
  const savedKey = ["saved", userId, "post", postId];
  const listKey = ["saved", userId, "list"];

  const { data: savedRow, isPending } = useQuery({
    queryKey: savedKey,
    queryFn: () => savedservice.getUserSavedPost(userId, postId),
    enabled: Boolean(userId && postId),
    staleTime: 60_000,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (savedRow) {
        try {
          await savedservice.deleteSavedPost(savedRow.$id);
        } catch (error) {
          // Already removed in another tab — the outcome we wanted anyway.
          if (error?.code !== 404) throw error;
        }
        return null;
      }

      try {
        return await savedservice.createSavedPost(userId, postId);
      } catch (error) {
        // The unique (userId, postId) index refused a duplicate: another tab
        // saved it first. It IS saved, so fetch that row instead of failing.
        if (error?.code === 409) {
          return savedservice.getUserSavedPost(userId, postId);
        }
        throw error;
      }
    },

    onSuccess: (row) => {
      queryClient.setQueryData(savedKey, row);
      // The Saved page is a different query; mark it stale so it shows the
      // change next time it renders.
      queryClient.invalidateQueries({ queryKey: listKey });

      if (row) {
        toast.success("Post saved", {
          description: "Find it any time under Saved.",
          action: { label: "View", onClick: () => navigate("/saved") },
        });
      } else {
        toast.success("Removed from saved");
      }
    },

    onError: (error) =>
      toast.error("Couldn't update your saved posts", {
        description: error?.message || "Please try again.",
      }),
  });

  return {
    saved: Boolean(savedRow),
    canSave: Boolean(userId),
    // A disabled query also reports "pending", so only count it as loading
    // when there is a user to look up — otherwise guests get a dead button.
    isChecking: Boolean(userId) && isPending,
    isPending: toggle.isPending,
    toggle: () => toggle.mutate(),
  };
}

export default usePostSave;
