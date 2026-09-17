import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Postform, Container, Loader } from "../components";
import postservice from "../services/Post.service";
import { useState, useEffect } from "react";
import { postPath } from "../utils/postUrl";

const NOT_FOUND = "This post could not be found.";

function EditPost() {
  const { id } = useParams();
  const userId = useSelector((state) => state.auth.userData?.$id);

  // Each result remembers which id it belongs to. If the URL switches to a
  // different post, the old result is ignored instead of being edited by mistake.
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Ignore a slow response that arrives after the user has moved on.
    let cancelled = false;

    postservice
      .getPost(id)
      .then((post) => {
        if (!cancelled) setResult({ id, post });
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
        if (cancelled) return;
        setResult({
          id,
          error:
            error.code === 404
              ? NOT_FOUND
              : "Unable to load this post. Please refresh to try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const current = result?.id === id ? result : null;
  const post = current?.post;

  // Hiding the Edit button isn't enough: anyone can type /edit-post/<id>.
  // The server-side lock is the update permission set in Post.service.js.
  if (post && post.userID === userId) {
    return (
      <div className="py-8">
        <Container>
          {/* key resets the form if you jump straight to editing another post */}
          <Postform key={post.$id} post={post} />
        </Container>
      </div>
    );
  }

  // Someone else's draft looks exactly like a missing post.
  const isPublic = post?.status === "active";
  const message =
    current?.error ||
    (post && (isPublic ? "You can only edit your own posts." : NOT_FOUND));

  return (
    <div className="min-h-[70vh] bg-gray-50 dark:bg-gray-950">
      <Container>
        {message ? (
          <div role="alert" className="py-16 text-center">
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
            <Link
              to={isPublic ? postPath(post) : "/"}
              className="mt-4 inline-block font-semibold text-indigo-600 dark:text-indigo-400"
            >
              {isPublic ? "Back to the post" : "Back to your dashboard"}
            </Link>
          </div>
        ) : (
          <Loader text="Preparing your editor" />
        )}
      </Container>
    </div>
  );
}

export default EditPost;
