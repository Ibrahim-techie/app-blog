import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import postservice from "../services/Post.service";
import fileservice from "../services/storage.service";

/**
 * Deleting a post: remove the row, clean up its image, repair the cached
 * lists, then leave the page.
 *
 * Kept out of the page component because none of it is layout — it is a
 * sequence with its own failure handling.
 */
function useDeletePost(post) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await postservice.deletePost(post.$id);

      // The post is already gone, so a failed image delete is invisible to the
      // reader. Log it rather than blocking them with an error.
      if (post.featuredImage) {
        const removed = await fileservice.fileDelete(post.featuredImage);
        if (!removed) console.error("Failed to delete associated image");
      }
    },

    onMutate: () => {
      setError("");
      return { toastId: toast.loading("Deleting post…") };
    },

    onError: (deleteError, _variables, context) => {
      // Nothing was deleted, so keep the dialog open and say why.
      toast.error("Couldn't delete this post", { id: context?.toastId });
      setError(
        deleteError?.message ||
          "We couldn't delete this post. Please try again.",
      );
    },

    onSuccess: (_data, _variables, context) => {
      // Drop the row from every cached list right away. Invalidating alone
      // would still render the cached copy on the way back, leaving a card
      // that 404s when clicked.
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                rows: page.rows.filter((row) => row.$id !== post.$id),
              })),
            }
          : old,
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast.success("Post deleted", {
        id: context?.toastId,
        description: post.title,
      });

      // "replace" so Back doesn't return to the deleted post's URL.
      navigate("/", { replace: true });
    },
  });

  return {
    deletePost: mutation.mutate,
    isDeleting: mutation.isPending,
    error,
    clearError: () => setError(""),
  };
}

export default useDeletePost;
