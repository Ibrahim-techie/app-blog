import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import { Button, Container, Loader, Comments } from "../components";
import fileservice from "../services/storage.service";
import { postPath, slugify } from "../utils/postUrl";
import LikeButton from "../components/likes/LikeButton";
import DeletePostDialog from "../components/post/DeletePostDialog";
import useDeletePost from "../customHooks/useDeletePost";
import useRealtimePosts from "../customHooks/useRealtimePost";
const NOT_FOUND = "This post could not be found.";

function Post() {
  const [showcnfDlt, setShowCnfDlt] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  // :id finds the post. :slug is only the readable part of the URL, and is
  // missing entirely on old /post/:id links. as it was not practical set up
  const { id, slug } = useParams();
  const navigate = useNavigate();
  //fetch post
  useRealtimePosts(id);
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
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Container>
          <Loader text="Loading post" />
        </Container>
      </main>
    );
  }

  // A hidden draft gets the same message as a missing post, so the page
  // doesn't reveal that a draft with this id exists.
  if (error || isHidden) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div role="alert" className="text-center">
            {/* Appwrite's own wording ("Row with the requested ID ... could
                not be found") means nothing to a reader, so only show a
                message for failures we haven't got friendlier words for. */}
            <p className="mb-4 text-gray-700">
              {error && error.code !== 404
                ? "We couldn't load this post. Please try refreshing the page."
                : NOT_FOUND}
            </p>
            <Link to="/all-posts" className="font-semibold text-indigo-600">
              Back to all posts
            </Link>
          </div>
        </Container>
      </main>
    );
  }
  if (!post) {
    return null;
  }
  return (
    <main className="min-h-screen bg-[#f7f7f5] py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:py-10">
      <Container>
        <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] dark:border-gray-800 dark:bg-gray-900">
          {/* ================= HERO IMAGE ================= */}
          <div className="group relative overflow-hidden">
            <img
              src={fileservice.filePreview(post.featuredImage)}
              alt={post.title}
              className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-[1.02] sm:h-[400px] md:h-[500px]"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Author actions */}
            {isUserAuthor && (
              <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button
                    bgColor="bg-white/95"
                    className="!text-gray-900 shadow-lg backdrop-blur-md transition hover:!bg-white"
                  >
                    Edit
                  </Button>
                </Link>

                <Button
                  bgColor="bg-red-500"
                  className="shadow-lg transition hover:bg-red-600"
                  onClick={() => setShowCnfDlt(true)}
                >
                  Delete
                </Button>
              </div>
            )}

            {/* Bottom image information */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                <span>
                  {isUserAuthor ? "Published by you" : "Published post"}
                </span>
              </div>

              <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
            </div>
          </div>

          {/* ================= ARTICLE CONTENT ================= */}
          <div className="px-6 py-8 sm:px-10 sm:py-12 md:px-14">
            {/* Article metadata */}
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 pb-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <span>Article</span>

              <span className="h-1 w-1 rounded-full bg-gray-400" />

              <span>{isUserAuthor ? "Your post" : "Community post"}</span>
            </div>

            {/* Blog body */}
            <div
              className="
              browser-css
              prose
              prose-lg
              prose-gray
              max-w-none
              leading-8
              dark:prose-invert

              prose-headings:font-bold
              prose-headings:tracking-tight

              prose-h2:mt-10
              prose-h2:text-2xl

              prose-h3:mt-8
              prose-h3:text-xl

              prose-p:text-gray-700
              dark:prose-p:text-gray-300

              prose-a:text-indigo-600
              prose-a:no-underline
              hover:prose-a:underline
              dark:prose-a:text-indigo-400

              prose-blockquote:border-indigo-500
              prose-blockquote:bg-gray-50
              prose-blockquote:rounded-r-xl
              prose-blockquote:px-5
              dark:prose-blockquote:bg-gray-800/50

              prose-img:rounded-2xl
              prose-img:shadow-md
            "
            >
              {HTMLReactParser(post.content)}
            </div>

            {/* ================= ACTION BAR ================= */}
            <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
              <LikeButton postId={post.$id} />

              <span className="text-sm text-gray-400">
                Share your thoughts below
              </span>
            </div>
          </div>
        </article>

        {/* ================= COMMENTS ================= */}
        <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <Comments postId={post.$id} />
        </section>
      </Container>

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
    </main>
  );
}

export default Post;
