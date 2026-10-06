import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserAvatar from "../UserAvatar";

/**
 * "Written by" under the article. As in ReadingSidebar, the bio and photo
 * live in the author's private account prefs, so they only appear on your
 * own posts; anyone else's card shows the name alone.
 */
function AuthorCard({ post }) {
  const me = useSelector((state) => state.auth.userData);
  const isMine = Boolean(me?.$id && me.$id === post.userID);

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-ink-border bg-ink-surface-2 p-6 sm:flex-row sm:items-center">
      <UserAvatar
        name={post.author}
        avatarId={isMine ? me.prefs?.avatarId : null}
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
        {isMine && me.prefs?.bio && (
          <p className="text-sm leading-[1.6] text-ink-text-2">{me.prefs.bio}</p>
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
