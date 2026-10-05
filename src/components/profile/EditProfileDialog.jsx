import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import fileservice from "../../services/storage.service";
import useUpdateProfile from "../../customHooks/useUpdateProfile";

const NAME_MAX = 128; // Appwrite's limit on an account name
const BIO_MAX = 200;
const AVATAR_MAX_BYTES = 10 * 1024 * 1024; // before compression

const fieldClass =
  "w-full rounded-[4px] border border-writr-border bg-writr-surface px-3 py-2 text-sm text-writr-text outline-none transition-colors focus:border-writr-green dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-gray-400";

/** Modal form for the signed-in user's name, bio and avatar. */
function EditProfileDialog({ user, onClose }) {
  const update = useUpdateProfile();
  const isSaving = update.isPending;
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { name: user?.name ?? "", bio: user?.prefs?.bio ?? "" },
  });
  const bioLength = useWatch({ control, name: "bio" })?.length ?? 0;

  // A local preview of the picked file; revoke it so the blob isn't leaked.
  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );
  useEffect(
    () => () => previewUrl && URL.revokeObjectURL(previewUrl),
    [previewUrl],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSaving, onClose]);

  const pickAvatar = (event) => {
    const file = event.target.files?.[0];
    setAvatarError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file.");
    } else if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError("Choose an image under 10 MB.");
    } else {
      setAvatarFile(file);
    }
  };

  const onSubmit = ({ name, bio }) =>
    update.mutate(
      { name: name.trim(), bio: bio.trim(), avatarFile },
      { onSuccess: onClose },
    );

  const currentAvatarId = user?.prefs?.avatarId;
  const shownAvatar =
    previewUrl ??
    (currentAvatarId ? fileservice.filePreview(currentAvatarId) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-writr-text/40 px-4 dark:bg-black/60">
      <form
        onSubmit={handleSubmit(onSubmit)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-lg rounded-[6px] border border-writr-border bg-writr-surface p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2
          id="edit-profile-title"
          className="font-serif text-2xl text-writr-text dark:text-white"
        >
          Edit profile
        </h2>

        <fieldset disabled={isSaving} className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-[4px] border border-writr-border bg-writr-surface-2 dark:border-gray-700 dark:bg-gray-800">
              {shownAvatar && (
                <img src={shownAvatar} alt="" className="size-full object-cover" />
              )}
            </div>
            <div>
              <label className="inline-block cursor-pointer rounded-[4px] border border-writr-border px-3 py-1.5 text-sm text-writr-text transition-colors hover:bg-writr-surface-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                {currentAvatarId || avatarFile ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={pickAvatar}
                  className="sr-only"
                />
              </label>
              {avatarError && (
                <p role="alert" className="mt-1.5 text-xs text-red-700 dark:text-red-400">
                  {avatarError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-writr-muted dark:text-gray-400"
            >
              Name
            </label>
            <input
              id="profile-name"
              autoFocus
              className={fieldClass}
              {...register("name", {
                validate: (value) =>
                  value.trim().length > 0 || "Your name can't be empty.",
                maxLength: {
                  value: NAME_MAX,
                  message: `Keep it under ${NAME_MAX} characters.`,
                },
              })}
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-xs text-red-700 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="profile-bio"
                className="text-xs font-medium uppercase tracking-[0.15em] text-writr-muted dark:text-gray-400"
              >
                Bio
              </label>
              <span className="text-xs tabular-nums text-writr-muted dark:text-gray-500">
                {bioLength}/{BIO_MAX}
              </span>
            </div>
            <textarea
              id="profile-bio"
              rows={4}
              maxLength={BIO_MAX}
              placeholder="A sentence or two about you"
              className={`${fieldClass} resize-none`}
              {...register("bio")}
            />
          </div>
        </fieldset>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[4px] border border-writr-border px-4 py-2 text-sm text-writr-text transition-colors hover:bg-writr-surface-2 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || (!isDirty && !avatarFile)}
            className="rounded-[4px] bg-writr-green px-4 py-2 text-sm font-medium text-writr-surface transition-colors hover:bg-writr-text disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileDialog;
