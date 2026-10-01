import { useEffect } from "react";
import Button from "../Button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl dark:bg-red-950/50">
          ⚠️
        </div>

        <h2
          id="delete-title"
          className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Delete this post?
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          &quot;{title}&quot;
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          This action cannot be undone. The post and its associated featured
          image will be permanently deleted.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <Button
            bgColor="bg-gray-100"
            className="!text-gray-700 hover:!bg-gray-200 dark:bg-gray-800 dark:!text-gray-200 dark:hover:!bg-gray-700"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            bgColor="bg-red-500"
            className="hover:bg-red-600"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeletePostDialog;
