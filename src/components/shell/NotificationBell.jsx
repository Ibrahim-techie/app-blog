import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle } from "lucide-react";
import AuthorAvatar from "../AuthorAvatar";
import useAuthorProfile from "../../customHooks/useAuthorProfile";
import useNotifications from "../../customHooks/useNotifications";
import { postPath } from "../../utils/postUrl";
import { relativeTime } from "../../utils/relativeTime";

const badgeText = (count) => (count > 9 ? "9+" : String(count));

function NotificationItem({ notification, onOpen }) {
  const actor = useAuthorProfile(notification.actorId);
  const name = actor?.name || "Someone";
  const isLike = notification.type === "like";
  const TypeIcon = isLike ? Heart : MessageCircle;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-surface-2 ${
          notification.read ? "" : "bg-ink-accent-soft"
        }`}
      >
        <span className="relative shrink-0">
          <AuthorAvatar
            userId={notification.actorId}
            name={actor?.name}
            size={36}
            className="rounded-lg bg-ink-sage text-xs text-ink-avatar-text"
          />
          <span className="absolute -right-1 -bottom-1 inline-flex size-[18px] items-center justify-center rounded-full border border-ink-border bg-ink-surface text-ink-text-2">
            <TypeIcon size={10} strokeWidth={2} aria-hidden="true" />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-snug text-ink-text-2">
            <span className="font-semibold text-ink-text">{name}</span>{" "}
            {isLike ? "liked" : "commented on"}{" "}
            <span className="font-semibold text-ink-text">
              {notification.postTitle || "your post"}
            </span>
          </span>
          {notification.excerpt && (
            <span className="mt-1 line-clamp-2 block font-serif text-sm text-ink-text-2">
              “{notification.excerpt}”
            </span>
          )}
          <span className="mt-1 block font-mono text-[11px] tracking-[0.96px] text-ink-muted uppercase">
            {relativeTime(notification.$createdAt)}
          </span>
        </span>

        {!notification.read && (
          <span
            aria-label="Unread"
            className="mt-1.5 size-2 shrink-0 rounded-full bg-ink-accent"
          />
        )}
      </button>
    </li>
  );
}

/**
 * The header bell: an unread badge that updates live, and a panel listing
 * who liked or commented on the user's posts. Opening one marks it read and
 * goes to the post.
 *
 * A dropdown from sm up; a full-width sheet under the header on phones.
 */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const {
    unreadCount,
    notifications,
    isPending,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markRead,
    markAllRead,
    isMarkingAll,
  } = useNotifications({ open });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) =>
      ref.current?.contains(event.target) || setOpen(false);
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openNotification = (notification) => {
    if (!notification.read) markRead(notification.$id);
    setOpen(false);
    navigate(postPath({ $id: notification.postId, title: notification.postTitle }));
  };

  const label = unreadCount
    ? `Notifications, ${unreadCount} unread`
    : "Notifications";

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Notifications"
        className={`relative inline-flex size-10 items-center justify-center rounded-lg text-ink-text transition-colors hover:bg-ink-surface-2 sm:size-9 ${
          open ? "bg-ink-surface-2" : ""
        }`}
      >
        <Bell size={22} strokeWidth={1.5} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-primary px-1 font-mono text-[10px] leading-none font-semibold text-ink-on-primary"
          >
            {badgeText(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-0 top-16 z-30 flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden border-b border-ink-border bg-ink-surface sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:max-h-[480px] sm:w-[380px] sm:rounded-lg sm:border"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-border px-4 py-3">
            <p className="text-sm font-semibold text-ink-text">
              Notifications
            </p>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={unreadCount === 0 || isMarkingAll}
              className="text-xs font-semibold text-ink-text-2 transition-colors hover:text-ink-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingAll ? "Marking…" : "Mark all as read"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isPending ? (
              <p className="px-4 py-8 text-center text-sm text-ink-text-2">
                Loading…
              </p>
            ) : isError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-ink-text-2">
                  Couldn't load notifications.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-xs font-semibold text-ink-text underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <Bell
                  size={26}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-ink-muted"
                />
                <p className="mt-3 text-sm font-semibold text-ink-text">
                  No notifications yet
                </p>
                <p className="mt-1 text-sm text-ink-text-2">
                  You'll see it here when someone likes or comments on your
                  posts.
                </p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-ink-border">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.$id}
                      notification={notification}
                      onOpen={openNotification}
                    />
                  ))}
                </ul>
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full border-t border-ink-border py-3 text-xs font-semibold text-ink-text-2 transition-colors hover:bg-ink-surface-2 hover:text-ink-text disabled:opacity-60"
                  >
                    {isFetchingNextPage ? "Loading…" : "Show older"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
