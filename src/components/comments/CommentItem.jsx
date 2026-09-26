import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import commentService from "../../services/comment.service";
import { relativeTime, exactTime } from "../../utils/relativeTime";

const MAX_LENGTH = 1000;

function CommentItem({ comment, postId }) {
  const currentUserId = useSelector((state) => state.auth.userData?.$id);
  const queryClient = useQueryClient();
  const queryKey = ["comments", postId];

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const menuRef = useRef(null);
  const textareaRef = useRef(null);

  const isOwner = Boolean(currentUserId) && comment.userId === currentUserId;
  // Appwrite touches $updatedAt on create too, so allow a second of slack.
  const wasEdited =
    new Date(comment.$updatedAt) - new Date(comment.$createdAt) > 1000;

  // Close the menu on an outside click or Escape — a menu you can only close
  // by clicking the trigger again feels broken.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const updateMutation = useMutation({
    mutationFn: (content) =>
      commentService.updateComment({ commentId: comment.$id, content }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment updated");
    },
    onError: (error) =>
      toast.error("Couldn't update your comment", {
        description: error?.message,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentService.deleteComment(comment.$id),

    // Remove it from the list straight away, then put it back if the server
    // refuses. Waiting for a round trip to hide a deleted comment feels slow.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                total: Math.max(0, (page.total ?? 1) - 1),
                rows: page.rows.filter((row) => row.$id !== comment.$id),
              })),
            }
          : old,
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("Couldn't delete your comment", {
        description: error?.message,
      });
    },
    onSuccess: () => toast.success("Comment deleted"),
    // Re-sync with the server either way, so a rolled-back delete and a
    // successful one both end up showing the truth.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return toast.error("A comment can't be empty");
    if (trimmed === comment.content) return setIsEditing(false);
    updateMutation.mutate(trimmed);
  };

  const cancelEdit = () => {
    setDraft(comment.content);
    setIsEditing(false);
  };

  return (
    <article className="flex gap-3">
      {/* Placeholder avatar — real profile images come later. */}
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white"
      >
        {comment.userName?.charAt(0)?.toUpperCase() || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {comment.userName || "Anonymous"}
              {isOwner && (
                <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  You
                </span>
              )}
            </p>
            <p
              className="text-xs text-gray-400 dark:text-gray-500"
              title={exactTime(comment.$createdAt)}
            >
              {relativeTime(comment.$createdAt)}
              {wasEdited && " · edited"}
            </p>
          </div>

          {isOwner && !isEditing && !confirmingDelete && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Comment actions"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmingDelete(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              disabled={updateMutation.isPending}
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:ring-indigo-900/40"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="mr-auto text-xs text-gray-400">
                {draft.length}/{MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
        )}

        {confirmingDelete && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">
              Delete this comment?
            </p>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  deleteMutation.mutate();
                }}
                className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default CommentItem;
