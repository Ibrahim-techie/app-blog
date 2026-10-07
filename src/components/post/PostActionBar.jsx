import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import LikeButton from "../likes/LikeButton";
import SaveButton from "../saved/SaveButton";
import { BAR_ICON, BAR_PILL, barTone } from "./barButton";

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
    <div className="flex items-center justify-between gap-3 py-1 sm:h-[60px] sm:gap-4 sm:border-y sm:border-ink-border sm:py-0">
      <div className="flex items-center gap-2 sm:gap-7">
        <LikeButton postId={post.$id} variant="bar" />
        <button
          type="button"
          onClick={goToComments}
          aria-label="Go to comments"
          className={`${BAR_PILL} ${barTone(false)}`}
        >
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>
            <span className="hidden sm:inline">
              Comment{commentCount !== undefined && " · "}
            </span>
            {commentCount !== undefined && (
              <span className="tabular-nums">{commentCount}</span>
            )}
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-7">
        <SaveButton postId={post.$id} variant="bar" />
        <button
          type="button"
          onClick={share}
          aria-label="Share this post"
          className={`${BAR_ICON} ${barTone(false)}`}
        >
          <Share2 size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}

export default PostActionBar;
