import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserAvatar from "../UserAvatar";
import useAuthorProfile from "../../customHooks/useAuthorProfile";

/**
 * "Written by" under the article, with the author's public photo and bio.
 * View Profile only appears on your own posts — there is no profile page for
 * other users yet.
 */
function AuthorCard({ post }) {
  const me = useSelector((state) => state.auth.userData);
  const isMine = Boolean(me?.$id && me.$id === post.userID);
  const author = useAuthorProfile(post.userID);

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-ink-border bg-ink-surface-2 p-6 sm:flex-row sm:items-center">
      <UserAvatar
        name={post.author}
        avatarId={author?.avatarId}
        size={56}
        className="rounded-full bg-ink-surface text-sm text-ink-text"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2">
          WRITTEN BY
        </p>
        <p className="text-xl font-semibold leading-[1.25] tracking-[-0.4px] text-ink-text">
          {post.author || "Anonymous"}
        </p>
        {author?.bio && (
          <p className="whitespace-pre-line text-sm leading-[1.6] text-ink-text-2">
            {author.bio}
          </p>
        )}
      </div>
      {isMine && (
        <Link
          to="/profile"
          className="inline-flex h-11 w-fit shrink-0 items-center rounded-lg border border-ink-border bg-ink-surface px-5 text-xs font-semibold text-ink-text transition-colors hover:bg-ink-bg"
        >
          View Profile
        </Link>
      )}
    </section>
  );
}

export default AuthorCard;
