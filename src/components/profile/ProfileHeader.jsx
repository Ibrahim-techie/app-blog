import { SquarePen } from "lucide-react";
import UserAvatar from "../UserAvatar";
import coverImage from "../../assets/home-cover.jpg";

const compact = new Intl.NumberFormat("en", { notation: "compact" });

/**
 * Cover, portrait, name, bio, Edit Profile and the real statistics, laid out
 * as in the INK Profile design. Presentational only.
 *
 * The design's "Followers / Following" don't exist in this app, so the two
 * slots show likes and comments received instead — both counted from
 * Appwrite. Credentials, location and social links have no data and are left
 * out rather than faked.
 */
function ProfileHeader({ user, onEdit, stats, statsPending, statsError, onRetry }) {
  const bio = user?.prefs?.bio;

  const items = [
    { label: "Posts", value: stats?.posts },
    { label: "Likes received", value: stats?.likes },
    { label: "Comments received", value: stats?.comments },
  ];

  return (
    <section className="relative">
      <div className="h-40 overflow-hidden rounded-[2px] bg-ink-surface-2 sm:h-56">
        <img src={coverImage} alt="" className="size-full object-cover" />
      </div>

      <div className="absolute left-6 top-28 flex rounded-full bg-ink-bg p-1 sm:left-8 sm:top-44">
        <UserAvatar
          name={user?.name}
          avatarId={user?.prefs?.avatarId}
          size={96}
          className="rounded-full bg-ink-sage text-[30px] text-ink-avatar-text"
        />
      </div>

      <div className="flex flex-col gap-8 pt-20 pb-8 lg:flex-row lg:items-start lg:gap-14 lg:pt-16">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="break-words text-[36px] font-extrabold leading-[1.05] tracking-[-1.44px] text-ink-text sm:text-[44px] sm:tracking-[-1.76px]">
            {user?.name || "Unnamed writer"}
          </h1>
          {bio ? (
            <p className="max-w-[650px] whitespace-pre-line text-[15px] leading-[1.6] text-ink-text-2">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-ink-muted">
              No bio yet — add one with Edit Profile.
            </p>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-9 lg:w-[345px] lg:items-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-11 items-center gap-2.5 self-start rounded-[3px] border border-ink-border-strong bg-ink-primary px-5 text-xs font-extrabold text-ink-on-primary lg:self-end"
          >
            <SquarePen size={16} strokeWidth={1.75} aria-hidden="true" />
            Edit Profile
          </button>

          <dl
            aria-label="Profile statistics"
            className="flex w-full justify-between border-t border-ink-border pt-5"
          >
            {items.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <dd className="order-1 font-mono text-2xl font-medium text-ink-text tabular-nums">
                  {statsPending || statsError || item.value === undefined
                    ? "—"
                    : compact.format(item.value)}
                </dd>
                <dt className="order-2 font-mono text-[10px] text-ink-muted">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>
          {statsError && (
            <p role="alert" className="-mt-6 text-xs text-ink-error">
              Couldn&apos;t load your statistics.{" "}
              <button
                type="button"
                onClick={onRetry}
                className="font-extrabold underline underline-offset-4"
              >
                Retry
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;
