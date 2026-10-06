import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import commentService from "../../services/comment.service";
import { relativeTime, exactTime } from "../../utils/relativeTime";
import UserAvatar from "../UserAvatar";

const MAX_LENGTH = 1000;

function CommentItem({ comment, postId }) {
  const currentUserId = useSelector((state) => state.auth.userData?.$id);
  const myAvatarId = useSelector((state) => state.auth.userData?.prefs?.avatarId);
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
    <article className="flex gap-3.5">
      {/* Other people's photos live in their private account prefs, so only
          your own comments can show one — the rest use initials. */}
      <UserAvatar
        name={comment.userName}
        avatarId={isOwner ? myAvatarId : null}
        size={36}
        className="rounded-full bg-ink-surface-2 text-xs text-ink-text-2"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
            <p className="truncate text-sm font-semibold text-ink-text">
              {comment.userName || "Anonymous"}
              {isOwner && (
                <span className="ml-2 rounded-full border border-ink-border px-2 py-0.5 font-mono text-[11px] tracking-[0.96px] text-ink-text-2">
                  You
                </span>
              )}
            </p>
            <p
              className="font-mono tracking-[0.96px] text-xs text-ink-text-2"
              title={exactTime(comment.$createdAt)}
            >
              · {relativeTime(comment.$createdAt)}
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
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ink-surface-2 hover:text-ink-text"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-ink-border bg-ink-surface py-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-text transition-colors hover:bg-ink-surface-2"
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-error transition-colors hover:bg-ink-surface-2"
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
              className="w-full resize-y rounded-lg border border-ink-border bg-ink-surface px-3 py-2 text-sm text-ink-text outline-none transition-colors focus:border-ink-border-strong disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="mr-auto font-mono tracking-[0.96px] text-xs text-ink-text-2">
                {draft.length}/{MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
                className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-ink-text-2 transition-colors hover:bg-ink-surface-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={updateMutation.isPending}
                className="inline-flex h-8 items-center rounded-lg bg-ink-primary px-4 text-xs font-semibold text-ink-on-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-wrap break-words font-serif text-[17px] leading-[1.6] text-ink-text-2">
            {comment.content}
          </p>
        )}

        {confirmingDelete && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-ink-error/50 bg-ink-surface px-3 py-2">
            <p className="text-sm font-semibold text-ink-error">
              Delete this comment?
            </p>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-ink-text-2 transition-colors hover:bg-ink-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  deleteMutation.mutate();
                }}
                className="inline-flex h-8 items-center rounded-lg bg-ink-error px-3 text-xs font-semibold text-ink-on-primary"
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
