import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser/lib/index";
import { useNavigate, Link, useParams } from "react-router-dom";
import postservice from "../services/Post.service";
import { Button, Container } from "../components";
import fileservice from "../services/storage.service";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showcnfDlt, setShowCnfDlt] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const allposts = useSelector((state) => state.post.all);
  const userData = useSelector((state) => state.auth.userData);

  const { slug } = useParams();
  const navigate = useNavigate();

  // Check whether current user is the author
  const isUserAuthor = post?.userID && post.userID === userData?.$id;

  // Fetch post
  useEffect(() => {
    if (!slug) {
      navigate("/");
      return;
    }

    setLoading(true);
    const currentPost = allposts.find((post) => post.$id === slug);

    if (currentPost) {
      setLoading(false);
      setPost(currentPost);
    } else {
      setLoading(false);
      navigate("/");
    }
  }, [slug, navigate, allposts]);

  // Delete post
  const deletePost = async () => {
    if (!post) return;

    try {
      setDeleting(true);

      // Delete post from database
      const postDeleted = await postservice.deletePost(slug);

      if (!postDeleted) {
        console.error("Failed to delete post");
        return;
      }

      // Delete associated image
      if (post.featuredImage) {
        const fileDeleted = await fileservice.fileDelete(post.featuredImage);

        if (!fileDeleted) {
          console.error("Failed to delete associated image");
        }
      }

      // Close modal and navigate
      setShowCnfDlt(false);
      navigate("/");
    } catch (error) {
      console.error("Error while deleting post:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

              <p className="text-sm font-medium text-gray-500">
                Loading post...
              </p>
            </div>
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

            {/* Actions */}
            <div className="mt-7 flex justify-end gap-3">
              <Button
                bgColor="bg-gray-100"
                className="text-gray-700! hover:bg-gray-200!"
                onClick={() => setShowCnfDlt(false)}
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
