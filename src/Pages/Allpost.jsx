import { useSelector } from "react-redux";
import { Postcard, Container } from "../components";

function AllPost() {
  const posts = useSelector((state) => state.post.all);
  // const [posts, setPosts] = useState([]);

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

export default AllPost;
