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

// The card sizes in the INK v2 designs.
//  featured — Home's three-up row: category inside the body, serif excerpt.
//  grid     — Explore / Profile / Bookmarks three-up grid.
//  wide     — the grid's first card, spanning two columns.
//  compact  — the Post page's "Related articles" column: no excerpt.
const VARIANTS = {
  featured: {
    image: "aspect-[357/235]",
    body: "gap-4 p-6",
    excerpt: "font-serif text-[17px] leading-[1.6]",
    labelInBody: true,
  },
  grid: {
    image: "aspect-[357/190]",
    body: "gap-3 p-4",
    excerpt: "text-sm leading-[1.65]",
  },
  wide: {
    span: "sm:col-span-2",
    image: "aspect-[357/190] sm:aspect-auto sm:h-[222px]",
    body: "gap-3 p-4",
    excerpt: "text-sm leading-[1.65]",
  },
  compact: {
    image: "aspect-[376/154]",
    body: "gap-4 p-4",
    excerpt: "hidden",
  },
};

const LABEL = "font-mono text-xs leading-[14px] tracking-[0.96px] text-ink-text-2";

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

  const categoryTag = label && (
    <p className={size.labelInBody ? LABEL : `px-4 ${LABEL}`}>
      {label.toUpperCase()}
    </p>
  );

  return (
    <article
      onMouseEnter={prefetchpost}
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-border bg-ink-surface transition-colors hover:border-ink-border-strong hover:bg-ink-surface-2 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink-text ${size.span ?? ""}`}
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
        {!size.labelInBody && categoryTag}
      </div>

      <div className={`flex flex-1 flex-col ${size.body}`}>
        {size.labelInBody && categoryTag}

        <h3 className="text-xl font-semibold leading-[1.25] tracking-[-0.6px] text-ink-text">
          {/* The link stretches over the whole card, so the card stays one
              big click target while the buttons sit above it. The card
              draws the focus ring (has-[a:focus-visible]). */}
          <Link
            to={postPath({ $id, title })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className={`line-clamp-3 text-ink-text-2 ${size.excerpt}`}>
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-ink-border pt-3">
          <UserAvatar
            name={author}
            avatarId={avatarId}
            size={variant === "featured" ? 32 : 27}
            className="rounded-lg bg-ink-surface-2 text-xs text-ink-text group-hover:bg-ink-sage-hover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p
              className={`truncate text-ink-text ${
                variant === "featured" ? "text-sm font-medium" : "text-xs font-semibold"
              }`}
            >
              {author || "Anonymous"}
            </p>
            <p className="truncate font-mono text-xs tracking-[0.96px] text-ink-text-2">
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
          <div className="flex items-center gap-4 pt-2 font-mono tracking-[0.96px] text-xs leading-[1.4] text-ink-text-2">
            <span className="flex items-center gap-1.5" title="Likes">
              <Heart size={14} strokeWidth={1.5} aria-hidden="true" />
              <span className="tabular-nums">{likes ?? "—"}</span>
              <span className="sr-only">likes</span>
            </span>
            <span className="flex items-center gap-1.5" title="Comments">
              <MessageCircle size={14} strokeWidth={1.5} aria-hidden="true" />
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
