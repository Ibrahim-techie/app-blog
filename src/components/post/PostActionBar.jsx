import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import LikeButton from "../likes/LikeButton";
import SaveButton from "../saved/SaveButton";

/**
 * Like · Comment · Bookmark · Share — the 60px action row from the INK post
 * design. Likes and bookmarks use their existing hooks; Comment scrolls to
 * the comment section; Share uses the device share sheet where there is one
 * and otherwise copies the link.
 */
function PostActionBar({ post, commentCount }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied", { description: "Paste it anywhere to share." });
      }
    } catch (error) {
      // Closing the share sheet is a cancel, not a failure.
      if (error?.name !== "AbortError") {
        toast.error("Couldn't share this post", { description: error?.message });
      }
    }
  };

  const goToComments = () =>
    document
      .getElementById("comments-heading")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex h-[60px] items-center justify-between gap-4 border-y border-ink-border">
      <div className="flex items-center gap-7">
        <LikeButton postId={post.$id} variant="bar" />
        <button
          type="button"
          onClick={goToComments}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-text-2 transition-colors hover:text-ink-text"
        >
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>
            Comment
            {commentCount !== undefined && (
              <>
                {" "}· <span className="tabular-nums">{commentCount}</span>
              </>
            )}
          </span>
        </button>
      </div>
      <div className="flex items-center gap-7">
        <SaveButton postId={post.$id} variant="bar" />
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-text-2 transition-colors hover:text-ink-text"
        >
          <Share2 size={18} strokeWidth={1.75} aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  );
}

export default PostActionBar;
