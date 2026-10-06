import { Heart } from "lucide-react";
import { toast } from "sonner";
import usePostLike from "../../customHooks/usePostLike";
import useEmailVerification from "../../customHooks/useEmailVerification";

/**
 * Like / unlike a post. `variant="bar"` is the plain "♡ Like · 124" action
 * from the INK post design; the default is the bordered button.
 */
function LikeButton({ postId, variant = "button" }) {
  const { liked, count, canLike, isPending, toggle } = usePostLike(postId);
  const { isVerified, resend } = useEmailVerification();

  // A dead, disabled button tells a signed-out reader nothing. Let them press
  // it and explain what's missing.
  const onClick = () => {
    if (!canLike) {
      toast.info("Sign in to like this post", {
        description: "It takes a few seconds to create an account.",
      });
    } else if (!isVerified) {
      toast.info("Verify your email to like posts", {
        description: "Check your inbox for the link.",
        action: { label: "Resend", onClick: resend },
      });
    } else {
      toggle();
    }
  };

  const shared = {
    type: "button",
    onClick,
    disabled: isPending,
    "aria-pressed": liked,
    "aria-label": liked ? "Unlike this post" : "Like this post",
    title: canLike ? undefined : "Sign in to like this post",
  };

  if (variant === "bar") {
    return (
      <button
        {...shared}
        className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
          liked ? "text-ink-brand" : "text-ink-text-2 hover:text-ink-text"
        }`}
      >
        <Heart
          size={18}
          strokeWidth={1.75}
          fill={liked ? "currentColor" : "none"}
          aria-hidden="true"
        />
        <span>
          {liked ? "Liked" : "Like"} ·{" "}
          <span className="tabular-nums">{count}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      {...shared}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        liked
          ? "border-ink-sage bg-ink-sage text-ink-on-sage"
          : "border-ink-border bg-ink-surface text-ink-text hover:border-ink-border-strong"
      }`}
    >
      <Heart
        size={16}
        strokeWidth={1.75}
        fill={liked ? "currentColor" : "none"}
        aria-hidden="true"
      />
      <span>{liked ? "Liked" : "Like"}</span>
      <span
        aria-label={`${count} ${count === 1 ? "like" : "likes"}`}
        className="font-mono tracking-[0.96px] tabular-nums opacity-70"
      >
        {count}
      </span>
    </button>
  );
}

export default LikeButton;
