import { useParams, useNavigate } from "react-router-dom";
import { Postform, Container, Loader } from "../components";
import postservice from "../services/Post.service";
import { useState, useEffect } from "react";

function EditPost() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams();
  useEffect(() => {
    postservice
      .getPost(slug)
      .then((response) => {
        if (response) {
          setPost(response);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
        setError(true);
      });
  }, [slug, navigate]);

  return post ? (
    <div className="py-8">
      <Container>
        <Postform post={post} />
      </Container>
    </div>
  ) : (
    <div className="min-h-[70vh] bg-gray-50 dark:bg-gray-950">
      <Container>
        {error ? (
          <p role="alert" className="py-16 text-center text-slate-600 dark:text-slate-300">Unable to load this post. Please refresh to try again.</p>
        ) : (
          <Loader text="Preparing your editor" />
        )}
      </Container>
    </div>
  );
}

export default EditPost;
