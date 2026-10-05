import { useEffect } from "react";

/** Confirmation modal for deleting a post. Presentational — no data logic. */
function DeletePostDialog({
  open,
  title,
  error,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  // Escape should close it. A modal you can only leave with the mouse is a
  // dead end for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isDeleting, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-text/50 px-4">
      <div
        className="w-full max-w-md rounded-[3px] border border-ink-border bg-ink-surface p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <p className="font-mono text-[10px] tracking-[0.3px] text-ink-error">
          PERMANENT ACTION
        </p>
        <h2
          id="delete-title"
          className="mt-2 text-2xl font-extrabold tracking-[-0.6px] text-ink-text"
        >
          Delete this post?
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-text">
          &quot;{title}&quot;
        </p>

        <p className="mt-2 text-sm leading-6 text-ink-text-2">
          This action cannot be undone. The post and its associated featured
          image will be permanently deleted.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-[3px] border border-ink-error/50 px-4 py-3 text-sm text-ink-error"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex h-10 items-center rounded-[3px] border border-ink-border bg-ink-surface px-4 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-10 items-center rounded-[3px] bg-ink-error px-4 text-xs font-extrabold text-ink-on-primary disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePostDialog;
