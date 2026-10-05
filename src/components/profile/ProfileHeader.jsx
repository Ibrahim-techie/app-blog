import { Pencil } from "lucide-react";
import fileservice from "../../services/storage.service";

/** Avatar, name, bio and the Edit Profile button. Presentational only. */
function ProfileHeader({ user, onEdit }) {
  const avatarId = user?.prefs?.avatarId;
  const bio = user?.prefs?.bio;

  return (
    <section className="flex flex-col gap-6 border-b border-writr-border pb-10 sm:flex-row sm:items-start dark:border-gray-800">
      <div className="size-24 shrink-0 overflow-hidden rounded-[6px] border border-writr-border bg-writr-surface-2 dark:border-gray-700 dark:bg-gray-800">
        {avatarId ? (
          <img
            src={fileservice.filePreview(avatarId)}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center font-serif text-4xl text-writr-green dark:text-gray-200"
          >
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-writr-muted dark:text-gray-500">
          Profile
        </p>
        <h1 className="mt-2 break-words font-serif text-4xl leading-tight text-writr-text sm:text-5xl dark:text-white">
          {user?.name || "Unnamed writer"}
        </h1>
        {bio ? (
          <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-7 text-writr-text-2 dark:text-gray-300">
            {bio}
          </p>
        ) : (
          <p className="mt-4 text-sm text-writr-muted dark:text-gray-500">
            No bio yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-[4px] border border-writr-text px-4 py-2 text-sm font-medium text-writr-text transition-colors hover:bg-writr-text hover:text-writr-surface dark:border-gray-300 dark:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-gray-900"
      >
        <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
        Edit Profile
      </button>
    </section>
  );
}

export default ProfileHeader;
