import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import commentService from "../services/comment.service";
import { ArrowLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Loader, Comments } from "../components";
import fileservice from "../services/storage.service";
import AuthorAvatar from "../components/AuthorAvatar";
import { categoryLabel } from "../constants/categories";
import { readingMinutes } from "../utils/postText";
import { postPath, slugify } from "../utils/postUrl";
import PostActionBar from "../components/post/PostActionBar";
import ReadingSidebar from "../components/post/ReadingSidebar";
import AuthorCard from "../components/post/AuthorCard";
import { EditorialNote } from "../components/feed/FeedStates";
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
          className="text-sm font-semibold text-ink-text underline underline-offset-4"
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
  const isDraft = isUserAuthor && post.status !== "active";
  // "Oct 7, 2026" — the phone byline, which carries the date in place of
  // the desktop's mono metadata line.
  const shortDate = new Date(post.$createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-6 py-6 sm:p-10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 xl:flex-row xl:items-stretch">
        <article className="flex w-full min-w-0 max-w-[680px] flex-col gap-6 sm:gap-7">
          {/* ================= HEADER ================= */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-ink-text-2"
            >
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
              <Link to="/all-posts" className="hover:text-ink-text">
                Explore
              </Link>
              {label && (
                <>
                  <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                  <Link
                    to={`/all-posts?category=${post.category}`}
                    className="truncate hover:text-ink-text"
                  >
                    {label}
                  </Link>
                </>
              )}
            </nav>

            {/* Author actions */}
            {isUserAuthor && (
              <div className="flex gap-2">
                <Link
                  to={`/edit-post/${post.$id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-border bg-ink-surface px-4 text-xs font-semibold text-ink-text transition-colors hover:bg-ink-surface-2"
                >
                  <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCnfDlt(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-error/60 px-4 text-xs font-semibold text-ink-error transition-colors hover:bg-ink-error/10"
                >
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-4 sm:gap-5 sm:pt-3">
            {/* Phones: category (and draft) as pills above the title. */}
            {(label || isDraft) && (
              <div className="flex flex-wrap gap-2 sm:hidden">
                {label && (
                  <Link
                    to={`/all-posts?category=${post.category}`}
                    className="inline-flex h-8 items-center rounded-full bg-ink-accent-soft px-3.5 text-sm font-medium text-ink-text"
                  >
                    {label}
                  </Link>
                )}
                {isDraft && (
                  <span className="inline-flex h-8 items-center rounded-full border border-ink-border px-3.5 text-sm text-ink-text-2">
                    Draft · only you can see this
                  </span>
                )}
              </div>
            )}
            <p className="hidden font-mono text-xs leading-[1.5] tracking-[0.96px] text-ink-text-2 sm:block">
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
              {isDraft && (
                <span className="text-ink-muted"> · DRAFT — ONLY YOU CAN SEE THIS</span>
              )}
            </p>
            <h1 className="text-[34px] font-semibold leading-[1.12] tracking-[-1px] text-ink-text sm:text-[56px] sm:leading-[1.1] sm:tracking-[-1.68px]">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-3">
              <AuthorAvatar
                userId={post.userID}
                name={post.author}
                size={44}
                className="rounded-full bg-ink-surface-2 text-sm text-ink-text"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-ink-text">
                  {post.author || "Anonymous"}
                </p>
                <p className="text-xs text-ink-text-2 sm:hidden">
                  <time dateTime={post.$createdAt}>{shortDate}</time> · {minutes} min read
                </p>
                {isUserAuthor && (
                  <p className="hidden text-xs text-ink-text-2 sm:block">Your post</p>
                )}
              </div>
            </div>
            <div className="hidden flex-col items-end gap-1 font-mono tracking-[0.96px] text-xs text-ink-text-2 sm:flex">
              <p>PUBLISHED {longDate(post.$createdAt)}</p>
              <p>{minutes} MIN READ</p>
            </div>
          </div>

          {/* ================= COVER ================= */}
          {post.featuredImage && (
            <figure className="h-[240px] overflow-hidden rounded-lg bg-ink-surface-2 sm:h-[360px]">
              <img
                src={fileservice.filePreview(post.featuredImage)}
                alt=""
                className="size-full object-cover"
              />
            </figure>
          )}

          <PostActionBar post={post} commentCount={commentCount} />

          {/* ================= ARTICLE CONTENT ================= */}
          <div className="ink-prose py-3">
            {HTMLReactParser(post.content)}
          </div>

          {label && (
            <div>
              <Link
                to={`/all-posts?category=${post.category}`}
                className="inline-flex h-7 items-center rounded-full border border-ink-border px-3 font-mono text-xs tracking-[0.96px] text-ink-text-2 transition-colors hover:bg-ink-surface"
              >
                {label.toUpperCase()}
              </Link>
            </div>
          )}

          <PostActionBar post={post} commentCount={commentCount} />

          <AuthorCard post={post} />

          {/* ================= COMMENTS ================= */}
          <Comments postId={post.$id} />

          <EditorialNote
            left="INDEPENDENT VOICES. FRESH PERSPECTIVES."
            right="INK / POST"
          />
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
