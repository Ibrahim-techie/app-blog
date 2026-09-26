import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import commentService from "../../services/comment.service";

const MAX_LENGTH = 1000;

function PostComment({ postId }) {
  const userData = useSelector((state) => state.auth.userData);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { content: "" } });

  // useWatch rather than watch(): the latter returns a function the React
  // Compiler can't memoize, which disables optimisation for this component.
  const content = useWatch({ control, name: "content" });

  const createComment = useMutation({
    mutationFn: (commentData) => commentService.createComment(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      reset();
      toast.success("Comment added");
    },
    onError: (error) =>
      toast.error("Couldn't post your comment", {
        description: error?.message,
      }),
  });

  const onSubmit = (data) =>
    createComment.mutate({
      userId: userData.$id,
      userName: userData.name,
      content: data.content.trim(),
      postId,
    });

  if (!postId) return null;

  if (!userData) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white"
        >
          {userData.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder="Write a comment…"
            aria-label="Write a comment"
            disabled={createComment.isPending}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900/40"
            {...register("content", {
              required: "Comment cannot be empty",
              // A box full of spaces passes `required`, so check the trimmed value.
              validate: (value) =>
                value.trim().length >= 2 ||
                "Comment must be at least 2 characters",
              maxLength: {
                value: MAX_LENGTH,
                message: `Comment cannot exceed ${MAX_LENGTH} characters`,
              },
            })}
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-500" role="alert">
              {errors.content?.message}
            </p>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-gray-400">
                {content?.length ?? 0}/{MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={createComment.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createComment.isPending ? "Posting…" : "Post comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PostComment;
