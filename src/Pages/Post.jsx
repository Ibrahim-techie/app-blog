import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import postservice from "../services/Post.service";
import { Button, Container, Loader } from "../components";
import fileservice from "../services/storage.service";
import { postPath, slugify } from "../utils/postUrl";
import { useQuery } from "@tanstack/react-query";
const NOT_FOUND = "This post could not be found.";

function Post() {

  const [showcnfDlt, setShowCnfDlt] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const userData = useSelector((state) => state.auth.userData);

  // :id finds the post. :slug is only the readable part of the URL, and is
  // missing entirely on old /post/:id links. as it was not practical set up
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  //fetch post 
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


  
  // // Fetch post
  // useEffect(() => {
  //   if (!id) {
  //     navigate("/");
  //     return;
  //   }

  //   let cancelled = false;

  //   async function loadPost() {
  //     setLoading(true);
  //     setError("");
  //     setPost(null);

  //     try {
  //       // List results omit content, so load the complete article by its ID.
  //       const currentPost = await postservice.getPost(id);
  //       if (!currentPost || typeof currentPost.content !== "string") {
  //         throw new Error("The post content is unavailable.");
  //       }
  //       if (!cancelled) setPost(currentPost);
  //     } catch (error) {
  //       if (!cancelled) {
  //         setError(
  //           error.code === 404
  //             ? NOT_FOUND
  //             : "We couldn't load this post. Please try refreshing the page.",
  //         );
  //       }
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   }

  //   loadPost();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [id, navigate]);


  // Keep one address per post. An old link, a renamed title, or a hand-typed
  // slug all get replaced with the current /post/:slug/:id. "replace" swaps
  // the history entry, so the Back button doesn't bounce through the old URL.
  useEffect(() => {
    if (!post || isHidden) return;
    if (slug !== slugify(post.title)) {
      navigate(postPath(post), { replace: true });
    }
  }, [post, slug, isHidden, navigate]);

  // Delete post
  const deletePost = async () => {
    if (!post) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await postservice.deletePost(post.$id);
    } catch (error) {
      // Nothing was deleted, so keep the dialog open and say why.
      setDeleteError(
        error?.message || "We couldn't delete this post. Please try again.",
      );
      setDeleting(false);
      return;
    }

    // The post is gone. Its image is now unused; if removing it fails the
    // reader never notices, so log it instead of blocking them.
    if (post.featuredImage) {
      const removed = await fileservice.fileDelete(post.featuredImage);
      if (!removed) console.error("Failed to delete associated image");
    }

    // Drop the row from every cached list right away. Invalidating alone would
    // still render the cached copy on the way back, leaving a card that 404s.
    queryClient.setQueriesData({ queryKey: ["posts"] }, (old) =>
      old?.pages
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.filter((row) => row.$id !== post.$id),
            })),
          }
        : old,
    );
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // "replace" so Back doesn't return to the deleted post's URL.
    navigate("/", { replace: true });
  };

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
            <p className="mb-4 text-gray-700">{error || NOT_FOUND}</p>
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
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <Container>
        <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Featured Image */}
          <div className="relative w-full bg-gray-100">
            <img
              src={fileservice.filePreview(post.featuredImage)}
              alt={post.title}
              className="h-64 w-full object-cover sm:h-80 md:h-105"
            />

            {/* Author Actions */}
            {isUserAuthor && (
              <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button
                    bgColor="bg-white"
                    className="text-gray-800! shadow-lg hover:bg-gray-100!"
                  >
                    Edit
                  </Button>
                </Link>

                <Button
                  bgColor="bg-red-500"
                  className="shadow-lg hover:bg-red-600"
                  onClick={() => setShowCnfDlt(true)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Post Header */}
          <div className="px-6 pb-4 pt-8 sm:px-10 sm:pt-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />

              <span>
                {isUserAuthor ? "Published by you" : "Published post"}
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-6 pb-10 sm:px-10">
            <div className="browser-css prose prose-gray max-w-none">
              {HTMLReactParser(post.content)}
            </div>
          </div>
        </article>
      </Container>

      {/* Delete Confirmation Modal */}
      {showcnfDlt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
              ⚠️
            </div>

            <h2 id="delete-title" className="text-xl font-bold text-gray-900">
               {post.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This action cannot be undone. The post and its associated featured
              image will be permanently deleted.
            </p>

            {deleteError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {deleteError}
              </p>
            )}

            {/* Actions */}
            <div className="mt-7 flex justify-end gap-3">
              <Button
                bgColor="bg-gray-100"
                className="text-gray-700! hover:bg-gray-200!"
                onClick={() => {
                  setShowCnfDlt(false);
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                bgColor="bg-red-500"
                className="hover:bg-red-600"
                onClick={deletePost}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Post;
