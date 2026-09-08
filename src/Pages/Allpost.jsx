import { useSelector, useDispatch } from "react-redux";
import { Postcard, Container, Loader } from "../components";
import { useEffect, useState } from "react";
import { addPosts, allPosts } from "../redux/postSlice";
import postservice from "../services/Post.service";

function AllPost() {
  const [lastId, setLastId] = useState(null);
  const [hasmore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post.all);

  useEffect(() => {
    postservice
      .getcursoRows({ lastId: null, limit: 12 })
      .then((response) => {
        console.log(response.rows.length + "+");

        dispatch(allPosts(response.rows));
        if (response.rows.length < 12) {
          setHasMore(false);
          return;
        }
        const lastPost = response.rows[response.rows.length - 1];

        if (lastPost) {
          setLastId(lastPost.$id);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      }
    );
      
    return () => {};
  }, [dispatch]);

  // load more.. fucntion after mounting

 const loadmore = async () => {
  if (loading) return;

  setLoading(true);

  try {
    const response = await postservice.getcursoRows({
      lastId: lastId,
      limit: 12,
    });

    if (response) {
      dispatch(addPosts(response.rows));

      if (response.rows.length < 12) {
        setHasMore(false);
        return;
      }

      const lastPost = response.rows[response.rows.length - 1];

      if (lastPost) {
        setLastId(lastPost.$id);
      }
    }
  } catch (error) {
    console.error("Error fetching more posts:", error);
  } finally {
    setLoading(false);
  }
};

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
        {hasmore && lastId && (
  <div className="mt-8 flex justify-center">
    <button
      onClick={loadmore}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Loading..." : "Load More"}
    </button>
  </div>
)}
      </Container>
    </div>
  );
}

export default AllPost;
