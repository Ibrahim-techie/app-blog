import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import usePostSave from "../../customHooks/usePostSave";

function SaveButton({ postId }) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      // Wait for the saved state before allowing a click, so a fast press
      // can't try to save a post that is already saved.
      disabled={isChecking || isPending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved posts" : "Save this post"}
      title={canSave ? undefined : "Sign in to save this post"}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        saved
          ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-400"
          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
      }`}
    >
      <Bookmark
        size={18}
        fill={saved ? "currentColor" : "none"}
        className={`transition-transform duration-200 ${
          saved ? "scale-110" : "group-hover:scale-110"
        }`}
      />
      <span>{isPending ? (saved ? "Removing…" : "Saving…") : saved ? "Saved" : "Save"}</span>
    </button>
  );
}

export default SaveButton;
