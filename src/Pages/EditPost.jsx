import { useParams, useNavigate } from "react-router-dom";
import { Postform, Container } from "../components";
import postservice from "../services/Post.service";
import { useState, useEffect } from "react";

function EditPost() {
  const [post, setPost] = useState(null);
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
      });
  }, [slug, navigate]);

  return post ? (
    <div className="py-8">
      <Container>
        <Postform post={post} />
      </Container>
    </div>
  ) : null;
}

export default EditPost;
