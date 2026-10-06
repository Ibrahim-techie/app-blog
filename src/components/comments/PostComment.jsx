import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import commentService from "../../services/comment.service";
import UserAvatar from "../UserAvatar";

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
      <div className="rounded-lg border border-dashed border-ink-border bg-ink-surface px-4 py-5 text-center">
        <p className="text-sm text-ink-text-2">
          <Link
            to="/login"
            className="font-semibold text-ink-text underline underline-offset-4"
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
      <div className="flex gap-3.5">
        <UserAvatar
          name={userData.name}
          avatarId={userData.prefs?.avatarId}
          size={36}
          className="rounded-full bg-ink-surface-2 text-xs text-ink-text"
        />

        <div className="min-w-0 flex-1 rounded-lg border border-ink-border bg-ink-surface p-4 focus-within:border-ink-border-strong">
          <textarea
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder="Write a comment…"
            aria-label="Write a comment"
            disabled={createComment.isPending}
            className="w-full resize-none bg-transparent text-sm text-ink-text outline-none placeholder:text-ink-text-2 disabled:opacity-60"
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

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-error" role="alert">
              {errors.content?.message}
            </p>

            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono tracking-[0.96px] text-xs text-ink-text-2">
                {content?.length ?? 0}/{MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={createComment.isPending}
                className="inline-flex h-11 items-center rounded-lg bg-ink-primary px-5 text-xs font-semibold text-ink-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createComment.isPending ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PostComment;
