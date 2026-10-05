import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import usePostSave from "../../customHooks/usePostSave";

/**
 * Save / unsave a post. `variant="icon"` is the bare bookmark used on article
 * cards, `variant="bar"` the "Bookmark" action on the post page, and the
 * default a bordered button. All run the same usePostSave logic.
 */
function SaveButton({ postId, variant = "button" }) {
  const { saved, canSave, isChecking, isPending, toggle } =
    usePostSave(postId);

  // Same approach as LikeButton: a signed-out reader can press it and is told
  // what's missing, rather than meeting a dead, disabled button.
  const onClick = () =>
    canSave
      ? toggle()
      : toast.info("Sign in to save this post", {
          description: "Saved posts are kept in your account.",
        });

  const shared = {
    type: "button",
    onClick,
    // Wait for the saved state before allowing a click, so a fast press
    // can't try to save a post that is already saved.
    disabled: isChecking || isPending,
    "aria-pressed": saved,
    "aria-label": saved ? "Remove from saved posts" : "Save this post",
    title: canSave ? undefined : "Sign in to save this post",
  };

  if (variant === "bar") {
    return (
      <button
        {...shared}
        className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          saved ? "text-ink-brand" : "text-ink-text-2 hover:text-ink-text"
        }`}
      >
        <Bookmark
          size={18}
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {isPending ? (saved ? "Removing…" : "Saving…") : saved ? "Bookmarked" : "Bookmark"}
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        {...shared}
        className="inline-flex size-7 items-center justify-center rounded-[2px] text-ink-text transition-colors hover:bg-ink-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Bookmark
          size={17}
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      {...shared}
      className={`inline-flex h-10 items-center gap-2 rounded-[3px] border px-4 text-xs font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        saved
          ? "border-ink-sage bg-ink-sage text-ink-on-sage"
          : "border-ink-border bg-ink-surface text-ink-text hover:border-ink-border-strong"
      }`}
    >
      <Bookmark
        size={16}
        strokeWidth={1.75}
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
      <span>{isPending ? (saved ? "Removing…" : "Saving…") : saved ? "Saved" : "Save"}</span>
    </button>
  );
}

export default SaveButton;
