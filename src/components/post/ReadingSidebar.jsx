import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Postcard } from "../index";
import UserAvatar from "../UserAvatar";
import postservice from "../../services/Post.service";
import useCardMeta from "../../customHooks/useCardMeta";

/**
 * The Post page's right column: About the author, then Related articles.
 *
 * A bio and photo live in each user's private account prefs, so they can only
 * be shown on your own posts; for anyone else the panel shows the name only,
 * and there is no other-user profile page to link to.
 */
function ReadingSidebar({ post }) {
  const me = useSelector((state) => state.auth.userData);
  const isMine = Boolean(me?.$id && me.$id === post.userID);

  const related = useQuery({
    // Under ["posts"] so publishing or deleting a post refreshes it.
    queryKey: ["posts", "related", post.$id, post.category ?? null],
    queryFn: () =>
      postservice.getRelatedPosts({
        postId: post.$id,
        category: post.category,
      }),
    staleTime: 5 * 60_000,
  });

  // One request for all three cards' bookmark state, instead of one each.
  useCardMeta((related.data ?? []).map((row) => row.$id));

  return (
    <aside className="flex w-full shrink-0 flex-col gap-10 border-t border-ink-border pt-10 xl:w-[315px] xl:border-t-0 xl:border-l xl:pt-[86px] xl:pl-6">
      <section className="flex flex-col gap-5">
        <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
          ABOUT THE AUTHOR
        </p>
        <div className="flex items-center gap-3">
          <UserAvatar
            name={post.author}
            avatarId={isMine ? me.prefs?.avatarId : null}
            size={48}
            className="rounded-full bg-ink-sage text-base text-ink-avatar-text"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-lg font-extrabold text-ink-text">
              {post.author || "Anonymous"}
            </p>
            {isMine && <p className="text-xs text-ink-text-2">That&apos;s you</p>}
          </div>
        </div>
        {isMine && me.prefs?.bio && (
          <p className="text-[13px] leading-[1.65] text-ink-text-2">{me.prefs.bio}</p>
        )}
        {isMine && (
          <Link
            to="/profile"
            className="inline-flex h-11 w-fit items-center rounded-[3px] border border-ink-border bg-ink-surface px-5 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong"
          >
            View Profile
          </Link>
        )}
      </section>

      {related.data?.length > 0 && (
        <section className="flex flex-col gap-5">
          <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
            RELATED ARTICLES
          </p>
          {related.data.map((row) => (
            <Postcard key={row.$id} {...row} variant="compact" showSave />
          ))}
        </section>
      )}
    </aside>
  );
}

export default ReadingSidebar;
