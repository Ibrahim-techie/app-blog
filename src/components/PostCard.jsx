import fileservice from "../services/storage.service";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Heart, MessageCircle } from "lucide-react";
import { postPath } from "../utils/postUrl";
import { useQueryClient } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import { categoryLabel } from "../constants/categories";
import { cardDate } from "../utils/postText";
import UserAvatar from "./UserAvatar";
import SaveButton from "./saved/SaveButton";

// The three card sizes in the INK designs.
//  featured — Home's three-up grid: tall image, 22px title.
//  grid     — Explore / Profile / Bookmarks four-up grid: shorter image.
//  compact  — the Post page's "Related articles" column: 20px title.
const VARIANTS = {
  featured: {
    image: "aspect-[270/210]",
    body: "gap-4 px-4 pt-4 pb-5",
    title: "text-[22px] tracking-[-0.66px]",
  },
  grid: {
    image: "aspect-[270/160]",
    body: "gap-3 p-4",
    title: "text-[22px] tracking-[-0.66px]",
  },
  compact: {
    image: "aspect-[291/124]",
    body: "gap-4 p-4",
    title: "text-[20px] tracking-[-0.6px]",
  },
};

/**
 * The INK article card, shared by Home, Explore, Bookmarks, Profile and the
 * Post page.
 *
 * Takes a post row as props. Everything else is optional and simply not drawn
 * when absent: `excerpt` / `readingMinutes` (only callers that loaded the
 * body have them), `likes` / `comments` (counts from useCardMeta), the
 * category, and the author photo.
 *
 * `showSave` adds the bookmark. Grids pre-load every card's saved state in one
 * request (useCardMeta), so the buttons don't each ask Appwrite.
 */
function PostCard({
  $createdAt,
  $id,
  title,
  featuredImage,
  author,
  userID,
  category,
  excerpt,
  readingMinutes,
  likes,
  comments,
  showSave = false,
  variant = "featured",
}) {
  const me = useSelector((state) => state.auth.userData);
  const label = categoryLabel(category);
  const size = VARIANTS[variant] ?? VARIANTS.featured;

  // Avatars live in each user's private account prefs, so the only photo a
  // reader can see is their own — on their own posts. Everyone else gets
  // initials.
  const isMine = Boolean(me?.$id && me.$id === userID);
  const avatarId = isMine ? me.prefs?.avatarId : null;

  const queryclient = useQueryClient();
  const prefetchpost = () =>
    void queryclient.query({
      queryKey: ["post", $id],
      queryFn: () => postservice.getPost($id),
      staleTime: 60000,
    });
  // console.log(`fetched post whose ID is :${$id}`)

  const hasEngagement = likes !== undefined || comments !== undefined;

  return (
    <article
      onMouseEnter={prefetchpost}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2px] border border-ink-border bg-ink-surface transition-colors hover:border-ink-border-strong"
    >
      <div className="flex flex-col gap-4">
        <div className={`${size.image} w-full overflow-hidden bg-ink-surface-2`}>
          {featuredImage && (
            <img
              src={fileservice.filePreview(featuredImage)}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          )}
        </div>
        {label && (
          <p className="px-4 font-mono text-[9px] font-medium leading-[14px] text-ink-brand">
            {label.toUpperCase()}
          </p>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${size.body}`}>
        <h3 className={`${size.title} font-bold leading-[1.25] text-ink-text`}>
          {/* The link stretches over the whole card, so the card stays one
              big click target while the buttons sit above it. */}
          <Link
            to={postPath({ $id, title })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:underline focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="line-clamp-3 text-[15px] leading-[1.65] text-ink-text-2">
            {excerpt}
          </p>
        )}

        <div className="mt-auto h-px w-full bg-ink-border opacity-80" />

        <div className="flex items-center gap-2">
          <UserAvatar
            name={author}
            avatarId={avatarId}
            size={27}
            className={`rounded-[3px] text-[9px] ${
              isMine
                ? "bg-ink-sage text-ink-avatar-text"
                : "bg-ink-surface-2 text-ink-brand"
            }`}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-xs font-extrabold text-ink-text">
              {author || "Anonymous"}
            </p>
            <p className="truncate font-mono text-[11px] text-ink-muted">
              <time dateTime={$createdAt}>{cardDate($createdAt)}</time>
              {readingMinutes ? ` · ${readingMinutes} MIN READ` : ""}
            </p>
          </div>
          {showSave && (
            <div className="relative z-10 shrink-0">
              <SaveButton postId={$id} variant="icon" />
            </div>
          )}
        </div>

        {hasEngagement && (
          <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-ink-muted">
            <span className="flex items-center gap-1.5" title="Likes">
              <Heart size={14} strokeWidth={1.75} aria-hidden="true" />
              <span className="tabular-nums">{likes ?? "—"}</span>
              <span className="sr-only">likes</span>
            </span>
            <span className="flex items-center gap-1.5" title="Comments">
              <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
              <span className="tabular-nums">{comments ?? "—"}</span>
              <span className="sr-only">comments</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default PostCard;
