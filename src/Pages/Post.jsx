import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import commentService from "../services/comment.service";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Loader, Comments } from "../components";
import fileservice from "../services/storage.service";
import UserAvatar from "../components/UserAvatar";
import { categoryLabel } from "../constants/categories";
import { readingMinutes } from "../utils/postText";
import { postPath, slugify } from "../utils/postUrl";
import PostActionBar from "../components/post/PostActionBar";
import ReadingSidebar from "../components/post/ReadingSidebar";
import DeletePostDialog from "../components/post/DeletePostDialog";
import useDeletePost from "../customHooks/useDeletePost";
import useRealtimePosts from "../customHooks/useRealtimePost";
const NOT_FOUND = "This post could not be found.";

// "OCT 05, 2026" — the post design's long date.
const longDate = (iso) =>
  new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();

function Post() {
  const [showcnfDlt, setShowCnfDlt] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  // :id finds the post. :slug is only the readable part of the URL, and is
  // missing entirely on old /post/:id links. as it was not practical set up
  const { id, slug } = useParams();
  const navigate = useNavigate();
  //fetch post
  useRealtimePosts(id); // channel created
  const {
    data: post,
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postservice.getPost(id),
    enabled: !!id,
    staleTime: 60_000,
    retry: false,
  });

  // The "Comment · 18" count in the action bar. Under ["comments", id], so
  // adding, deleting or a realtime comment event refreshes it too.
  const { data: commentCount } = useQuery({
    queryKey: ["comments", id, "count"],
    queryFn: () => commentService.getCommentCount(id),
    enabled: !!id,
    staleTime: 60_000,
  });

  // Check whether current user is the author !!
  const isUserAuthor = post?.userID && post.userID === userData?.$id;

  // Inactive posts are drafts: only their author should see them. This is a
  // UI guard; the real lock is the read permission set in Post.service.js.
  const isHidden = post && post.status !== "active" && !isUserAuthor;

  // Keep one address per post. An old link, a renamed title, or a hand-typed
  // slug all get replaced with the current /post/:slug/:id. "replace" swaps
  // the history entry, so the Back button doesn't bounce through the old URL.
  useEffect(() => {
    if (!post || isHidden) return;
    if (slug !== slugify(post.title)) {
      navigate(postPath(post), { replace: true });
    }
  }, [post, slug, isHidden, navigate]);

  const {
    deletePost,
    isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeletePost(post ?? {});

  // Loading state
  if (loading) {
    return <Loader text="Loading post" />;
  }

  // A hidden draft gets the same message as a missing post, so the page
  // doesn't reveal that a draft with this id exists.
  if (error || isHidden) {
    return (
      <div role="alert" className="px-5 py-16 text-center sm:px-10">
        {/* Appwrite's own wording ("Row with the requested ID ... could
            not be found") means nothing to a reader, so only show a
            message for failures we haven't got friendlier words for. */}
        <p className="mb-4 text-ink-text-2">
          {error && error.code !== 404
            ? "We couldn't load this post. Please try refreshing the page."
            : NOT_FOUND}
        </p>
        <Link
          to="/all-posts"
          className="text-sm font-extrabold text-ink-brand underline underline-offset-4"
        >
          Back to all posts
        </Link>
      </div>
    );
  }
  if (!post) {
    return null;
  }

  const label = categoryLabel(post.category);
  const minutes = readingMinutes(post.content);
  const authorAvatar = isUserAuthor ? userData?.prefs?.avatarId : null;

  return (
    <div className="px-5 py-8 sm:p-10">
      <div className="flex flex-col gap-10 xl:flex-row xl:items-start">
        <article className="flex w-full min-w-0 max-w-[800px] flex-col gap-7">
          {/* ================= HEADER ================= */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/all-posts"
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-text-2 hover:text-ink-text"
            >
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
              Back to Explore
            </Link>

            {/* Author actions */}
            {isUserAuthor && (
              <div className="flex gap-2">
                <Link
                  to={`/edit-post/${post.$id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-[3px] border border-ink-border bg-ink-surface px-4 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong"
                >
                  <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCnfDlt(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-[3px] border border-ink-error/60 px-4 text-xs font-extrabold text-ink-error transition-colors hover:bg-ink-error/10"
                >
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 pt-3">
            <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-brand">
              {label ? (
                <Link
                  to={`/all-posts?category=${post.category}`}
                  className="hover:underline"
                >
                  {label.toUpperCase()}
                </Link>
              ) : (
                "ARTICLE"
              )}
              {` · ${longDate(post.$createdAt)} · ${minutes} MIN READ`}
              {isUserAuthor && post.status !== "active" && (
                <span className="text-ink-muted"> · DRAFT — ONLY YOU CAN SEE THIS</span>
              )}
            </p>
            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-[-1.6px] text-ink-text sm:text-[64px] sm:tracking-[-3.2px]">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={post.author}
                avatarId={authorAvatar}
                size={44}
                className="rounded-full bg-ink-sage text-base text-ink-avatar-text"
              />
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-extrabold text-ink-text">
                  {post.author || "Anonymous"}
                </p>
                {isUserAuthor && (
                  <p className="text-xs text-ink-text-2">Your post</p>
                )}
              </div>
            </div>
            <div className="hidden flex-col items-end gap-1 font-mono text-[10px] text-ink-muted sm:flex">
              <p>PUBLISHED {longDate(post.$createdAt)}</p>
              <p>{minutes} MIN READ</p>
            </div>
          </div>

          {/* ================= COVER ================= */}
          {post.featuredImage && (
            <figure className="h-[240px] overflow-hidden rounded-[2px] bg-ink-surface-2 sm:h-[360px]">
              <img
                src={fileservice.filePreview(post.featuredImage)}
                alt=""
                className="size-full object-cover"
              />
            </figure>
          )}

          <PostActionBar post={post} commentCount={commentCount} />

          {/* ================= ARTICLE CONTENT ================= */}
          <div className="ink-prose py-3 sm:px-10">
            {HTMLReactParser(post.content)}
          </div>

          {label && (
            <div className="sm:px-10">
              <Link
                to={`/all-posts?category=${post.category}`}
                className="inline-flex h-[27px] items-center rounded-[2px] border border-ink-border px-3 font-mono text-[10px] tracking-[0.3px] text-ink-text-2 hover:border-ink-border-strong"
              >
                {label.toUpperCase()}
              </Link>
            </div>
          )}

          <PostActionBar post={post} commentCount={commentCount} />

          {/* ================= COMMENTS ================= */}
          <Comments postId={post.$id} />
        </article>

        <ReadingSidebar post={post} />
      </div>

      <DeletePostDialog
        open={showcnfDlt}
        title={post.title}
        error={deleteError}
        isDeleting={isDeleting}
        onCancel={() => {
          setShowCnfDlt(false);
          clearDeleteError();
        }}
        onConfirm={deletePost}
      />
    </div>
  );
}

export default Post;
