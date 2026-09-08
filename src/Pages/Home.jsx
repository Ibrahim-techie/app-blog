import { Postcard, Container } from "../components";
import { useSelector, useDispatch } from "react-redux";
import postservice from "../services/Post.service";
import { useEffect, useState } from "react";
import { allPosts, myposts } from "../redux/postSlice";
import { Button } from "../components/index";

function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const userPosts = useSelector((state) => state.post.mypost);

  const [poststatus, setPostStatus] = useState("active");

  const dispatch = useDispatch();

  const filteredPosts =
    poststatus === "all"
      ? userPosts
      : userPosts.filter((post) => post.status === poststatus);

  useEffect(() => {
    if (authStatus) {
      postservice
        .getPosts(userData.$id)
        .then((response) => {
         
          dispatch(myposts(response.rows));
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
        });
    }
  }, [authStatus, userData?.$id, dispatch]);

  // ---------------- NOT LOGGED IN ----------------

  if (!authStatus) {
    return (
      <main className="min-h-[70vh] bg-gray-50 dark:bg-gray-950">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm dark:bg-indigo-950">
                🔒
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Login to read posts
              </h1>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Sign in to your account to access your posts and start creating
                content.
              </p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // ---------------- NO POSTS ----------------

  if (userPosts.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50 dark:bg-gray-950">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm dark:bg-indigo-950">
                ✍️
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                No posts yet
              </h1>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                You haven't created any posts yet. Start writing and share
                something with the world.
              </p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // ---------------- DASHBOARD ----------------

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          {/* Dashboard Header */}
          <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              {/* Heading */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>

                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Your Dashboard
                  </p>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Your Posts
                </h1>

                <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">
                  Manage, organize and read the content you've created.
                </p>
              </div>

              {/* Post Count */}
              <div className="w-fit rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Showing
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {filteredPosts.length}{" "}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {filteredPosts.length === 1 ? "Post" : "Posts"}
                  </span>
                </p>
              </div>
            </div>

            {/* Status Filter */}
            <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <Button
                  type="button"
                  bgColor={
                    poststatus === "active"
                      ? "bg-indigo-600"
                      : "bg-transparent hover:bg-white dark:hover:bg-gray-700"
                  }
                  textColor={
                    poststatus === "active"
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                  onClick={() => setPostStatus("active")}
                >
                  Active
                </Button>

                <Button
                  type="button"
                  bgColor={
                    poststatus === "inactive"
                      ? "bg-indigo-600"
                      : "bg-transparent hover:bg-white dark:hover:bg-gray-700"
                  }
                  textColor={
                    poststatus === "inactive"
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                  onClick={() => setPostStatus("inactive")}
                >
                  Inactive
                </Button>

                <Button
                  type="button"
                  bgColor={
                    poststatus === "all"
                      ? "bg-indigo-600"
                      : "bg-transparent hover:bg-white dark:hover:bg-gray-700"
                  }
                  textColor={
                    poststatus === "all"
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                  onClick={() => setPostStatus("all")}
                >
                  All
                </Button>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPosts.map((post) => (
                <Postcard key={post.$id} {...post} />
              ))}
            </div>
          ) : (
            /* No posts for selected filter */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                📝
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                No {poststatus} posts
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You don't have any {poststatus} posts at the moment.
              </p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}

export default Home;
