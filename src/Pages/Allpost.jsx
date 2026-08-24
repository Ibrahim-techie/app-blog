import { Postcard, Container } from "../components";
import postservice from "../services/Post.service";
import { useState, useEffect } from "react";

function Allpost() {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    const response = await postservice.getPost();
    if (response) {
      setPosts(response.rows);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.map((post) => (
            <div key={post.$id} className="p-2 w-1/4">
              <Postcard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Allpost;
