import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import fileservice from "../../services/storage.service";
import useUpdateProfile from "../../customHooks/useUpdateProfile";

const NAME_MAX = 128; // Appwrite's limit on an account name
const BIO_MAX = 200;
const AVATAR_MAX_BYTES = 10 * 1024 * 1024; // before compression

const fieldClass =
  "w-full rounded-[3px] border border-ink-border bg-ink-bg px-3 py-2 text-sm text-ink-text outline-none transition-colors focus:border-ink-border-strong";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-text/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-lg rounded-[3px] border border-ink-border bg-ink-surface p-6 sm:p-8"
      >
        <h2
          id="edit-profile-title"
          className="text-2xl font-extrabold tracking-[-0.6px] text-ink-text"
        >
          Edit profile
        </h2>

        <fieldset disabled={isSaving} className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-[4px] border border-ink-border bg-ink-surface-2">
              {shownAvatar && (
                <img src={shownAvatar} alt="" className="size-full object-cover" />
              )}
            </div>
            <div>
              <label className="inline-block cursor-pointer rounded-[4px] border border-ink-border px-3 py-1.5 text-sm text-ink-text transition-colors hover:bg-ink-surface-2">
                {currentAvatarId || avatarFile ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={pickAvatar}
                  className="sr-only"
                />
              </label>
              {avatarError && (
                <p role="alert" className="mt-1.5 text-xs text-ink-error">
                  {avatarError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.3px] text-ink-muted uppercase"
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
              <p role="alert" className="mt-1.5 text-xs text-ink-error">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="profile-bio"
                className="font-mono text-[10px] tracking-[0.3px] text-ink-muted uppercase"
              >
                Bio
              </label>
              <span className="text-xs tabular-nums text-ink-muted">
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
            className="inline-flex h-10 items-center rounded-[3px] border border-ink-border bg-ink-surface px-4 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || (!isDirty && !avatarFile)}
            className="inline-flex h-10 items-center rounded-[3px] border border-ink-border-strong bg-ink-primary px-4 text-xs font-extrabold text-ink-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileDialog;
