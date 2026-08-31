import { Postcard, Container } from "../components";
import { useSelector, useDispatch } from "react-redux";
import postservice from "../services/Post.service";
import { useEffect, useState } from "react";
import { allPosts, myposts } from "../redux/postSlice";
import { Button } from "../components/index";
import { Link } from "react-router-dom";

function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const userPosts = useSelector((state) => state.post.mypost);
  const [poststatus, setPostStatus] = useState("active");
  const filteredPosts = userPosts.filter((post) => post.status === poststatus);

  const dispatch = useDispatch();

  useEffect(() => {
    if (authStatus) {
      postservice
        .getPosts()
        .then((response) => {
          const posts = response.rows;
          // Store all posts
          dispatch(allPosts(posts));

          // Filter current user's posts from the fresh API response
          const currentuserPosts = posts.filter(
            (post) => post.userID === userData.$id,
          );
          dispatch(myposts(currentuserPosts));
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
        });
    }
  }, [authStatus, userData?.$id, dispatch]);

  // inactive post

  // Only show posts created by the logged-in user

  // Not logged in
  if (!authStatus) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                🔒
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Login to read posts
              </h1>

              <p className="mt-3 text-gray-500">
                Sign in to your account to access your posts and start creating
                content.
              </p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // Logged in but no posts
  if (userPosts.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                ✍️
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                No posts yet
              </h1>

              <p className="mt-3 text-gray-500">
                You haven't created any posts yet. Start writing and share
                something with the world.
              </p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                Your Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your Posts
              </h1>

              <p className="mt-2 text-gray-500">
                Manage and read the content you've created.
              </p>
              <div className="mt-5 inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-sm">
                <Button
                  type="button"
                  bgColor={
                    poststatus === "active"
                      ? "bg-indigo-600"
                      : "bg-transparent hover:bg-white"
                  }
                  textColor={
                    poststatus === "active" ? "text-white" : "text-gray-600"
                  }
                  className="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200"
                  onClick={() => setPostStatus("active")}
                >
                  Active
                </Button>

                <Button
                  type="button"
                  bgColor={
                    poststatus === "inactive"
                      ? "bg-indigo-600"
                      : "bg-transparent hover:bg-white"
                  }
                  textColor={
                    poststatus === "inactive" ? "text-white" : "text-gray-600"
                  }
                  className="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200"
                  onClick={() => setPostStatus("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Post Count */}
            <div className="w-fit rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPosts.map((post) => (
              <Postcard key={post.$id} {...post} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}

export default Home;
