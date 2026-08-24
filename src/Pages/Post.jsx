import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import HTMLReactParser from "html-react-parser/lib/index";
import { useNavigate, Link, useParams } from "react-router-dom";
import postservice from "../services/Post.service";
import { Button, Container } from "../components";
import fileservice from "../services/storage.service";

function Post() {
  const [post, setPost] = useState({});

  const userData = useSelector((state) => state.auth.userData);
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [showcnfDlt, setshowcnfDlt] = useState(false);
  const navigate = useNavigate();

  //main authStatus and post logic this logic decide whether to show edit and delete button to user basically if the user is Author of the current post

  const isUserAuthor =
    post && post.userID ? post.userID === userData?.$id : false;

  useEffect(() => {
    if (slug) {
      setLoading(true);

      postservice
        .getPost(slug)
        .then((post) => {
          if (post) {
            setPost(post);
          } else {
            navigate("/");
          }
        })
        .catch((error) => console.log("Error Getting Post", error))
        .finally(() => setLoading(false));
    } else {
      navigate("/");
    }

    setLoading(false);
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Container>
          <h1 className="text-xl font-semibold">Loading post...</h1>
        </Container>
      </div>
    );
  }

  // deleting func

  const deletePost = async () => {
    try {
      const status = await fileservice.fileDelete(post.featuredImage);
      if (status) {
        const delstatus = await postservice.deletePost(slug);
        if (delstatus) {
          setshowcnfDlt(false);
          navigate("/");
        }
      } else {
        console.log("Error While Deleting Image");
      }
    } catch (error) {
      console.log("Error while Deleting Post", error);
    }
  };
  return post ? (
    <div className="py-8">
      <Container>
        <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2">
          <img
            src={fileservice.filePreview(post.featuredImage)}
            alt={post.title}
            className="rounded-xl"
          />

          {isUserAuthor && (
            <div className="absolute right-6 top-6">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-green-500" className="mr-3">
                  Edit
                </Button>
              </Link>
              <Button bgColor="bg-red-500" onClick={() => setshowcnfDlt(true)}>
                Delete
              </Button>
            </div>
          )}
          <div className="w-full mb-6">
            <h1 className="text-2xl font-bold">{post.title}</h1>
          </div>
          <div className="browser-css">{HTMLReactParser(post.content)}</div>
        </div>
        {showcnfDlt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  bgColor="bg-gray-300"
                  onClick={() => setshowcnfDlt(false)}
                >
                  Cancel
                </Button>
                <Button
                  bgColor="bg-red-500"
                  onClick={() => {
                    deletePost();
                    setshowcnfDlt(false);
                  }}
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  ) : null;
}

export default Post;
