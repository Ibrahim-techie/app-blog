import { Heart } from "lucide-react";
import { toast } from "sonner";
import usePostLike from "../../customHooks/usePostLike";

function LikeButton({ postId }) {
  const { liked, count, canLike, isPending, toggle } = usePostLike(postId);

  // A dead, disabled button tells a signed-out reader nothing. Let them press
  // it and explain what's missing.
  const onClick = () =>
    canLike
      ? toggle()
      : toast.info("Sign in to like this post", {
          description: "It takes a few seconds to create an account.",
        });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      title={canLike ? undefined : "Sign in to like this post"}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        liked
          ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
          : "border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:text-rose-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-rose-900 dark:hover:text-rose-400"
      }`}
    >
      <Heart
        size={18}
        fill={liked ? "currentColor" : "none"}
        className={`transition-transform duration-200 ${
          liked ? "scale-110" : "group-hover:scale-110"
        }`}
      />
      <span>{liked ? "Liked" : "Like"}</span>
      <span
        aria-label={`${count} ${count === 1 ? "like" : "likes"}`}
        className="tabular-nums text-gray-500 dark:text-gray-400"
      >
        {count}
      </span>
    </button>
  );
}

export default LikeButton;
