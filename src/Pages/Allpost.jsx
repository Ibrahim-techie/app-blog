import { useSelector, useDispatch } from "react-redux";
import { Postcard, Container, Loader } from "../components";
import { useEffect, useState, useRef, useCallback } from "react";
import { addPosts, allPosts } from "../redux/postSlice";
import postservice from "../services/Post.service";
import GooeySearchBar from "../components/search";

function AllPost() {
  const [lastId, setLastId] = useState(null);
  const [hasmore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const loaderRef = useRef(null);
  const [search, setSearch] = useState("");
  const [searchresults, setSearchResults] = useState([]);
  const [searchLastId, setSearchLastId] = useState(null);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const posts = useSelector((state) => state.post.all);

  const handleSearch = (value) => {
    setSearch(value);
    setSearchPending(Boolean(value.trim()));
    setSearchResults([]);
    setSearchLastId(null);
    setSearchHasMore(true);
  };

  // load more.. fucntion after mounting
  const loadmore = useCallback(async () => {
    if (loading || !hasmore) return;

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
  }, [dispatch, lastId, loading, hasmore]);

  const loadMoreSearch = useCallback(async () => {
    if (searchPending || searchLoading || !searchHasMore || searchresults.length === 0) return;

    setSearchLoading(true);

    try {
      const response = await postservice.searchRows({
        searchTerm: search,
        lastId: searchLastId,
        limit: 12,
      });

      if (response) {
        setSearchResults((prev) => [...prev, ...response.rows]);

        if (response.rows.length < 12) {
          setSearchHasMore(false);
          return;
        }

        const lastPost = response.rows[response.rows.length - 1];

        if (lastPost) {
          setSearchLastId(lastPost.$id);
        }
      }
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchLastId, searchHasMore, searchLoading, searchPending, searchresults.length, search]);

  // Pagination main logic

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (!entry.isIntersecting) {
        return;
      }

      if (search.trim()) {
        loadMoreSearch();
      } else {
        loadmore();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadmore, search, loadMoreSearch]);

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
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {};
  }, [dispatch]);

  // becouncing search method

  useEffect(() => {
    // Don't search when the input is empty
    const term = search.trim();

    if (!term) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      // New search = new pagination session
      setSearchResults([]);
      setSearchLastId(null);
      setSearchHasMore(true);

      //fetch call
      postservice
        .searchRows({
          searchTerm: search,
          lastId: null,
          limit: 12,
        })
        .then((response) => {
          if (cancelled) return;
          setSearchResults(response.rows);

          if (response.rows.length < 12) {
            setSearchHasMore(false);
            return;
          }

          const lastId = response.rows[response.rows.length - 1].$id;
          if (lastId) {
            setSearchLastId(lastId);
          }
        })
        .catch((error) => {
          console.error("Search error:", error);
        })
        .finally(() => {
          if (!cancelled) setSearchPending(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  // CHANGE 2: replace your return loading ? ... : ... with this

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />

              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Explore
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Discover Posts
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Search through articles, discover new ideas, and find something
              worth reading.
            </p>
          </div>

          {/* Search Box */}
          {/* <div className="mb-8"> */}
          {/* <div className="relative mx-auto max-w-3xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  />
                </svg>
              </div>

              <Input
                type="text"
                label="Search"
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts by title..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-base shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />
            </div> */}

          {/* <GooeySearchBar
              type="text"
              label="Search"
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts by title..."
            /> */}

          {/* Search info */}
          {/* {search && (
              <div className="mx-auto mt-3 max-w-3xl px-1 text-sm text-slate-500 dark:text-slate-400">
                Searching for{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{search}"
                </span>
              </div>
            )}
          </div> */}

          {/* Search Box */}
          <div className="mb-8 ">
            <GooeySearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search posts by title..."
            />

            {/* Search info */}
            {search && (
              <div className="mx-auto mt-3 max-w-3xl px-1 text-sm text-slate-500 dark:text-slate-400">
                Searching for{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{search}"
                </span>
              </div>
            )}
          </div>

          {/* Posts */}
          {searchPending || (!search.trim() && loading && posts.length === 0) ? (
            <Loader text={search.trim() ? "Searching posts" : "Loading posts"} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : search.trim() && searchresults.length === 0 && !searchLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                🔎
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                No posts found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                We couldn't find any posts matching your search. Try a different
                keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(search.trim() ? searchresults : posts)?.map((post) => (
                <div
                  key={post.$id}
                  className="group transition-transform duration-300 hover:-translate-y-1"
                >
                  <Postcard {...post} />
                </div>
              ))}
            </div>
          )}

          {/* Infinite scroll loader */}
          <div
            ref={loaderRef}
            className="flex min-h-24 items-center justify-center"
          >
            {!searchPending && (search.trim() ? searchLoading : loading && posts.length > 0) && (
              <Loader compact text="Loading more posts" className="my-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" />
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}

export default AllPost;
