import { useState, useRef, useEffect } from "react";
import { Postcard, Container, Loader } from "../components";
import postservice from "../services/Post.service";
import GooeySearchBar from "../components/search";
import usePaginatedList from "../customHooks/usePaginatedList";
import useDebouncedValue from "../customHooks/useDebouncedValue";

const PAGE_SIZE = 12;

function AllPost() {
  const [search, setSearch] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);
  const trimmed = debouncedSearch.trim();
  const isSearching = search.trim().length > 0;
  const isPending = isSearching && search !== debouncedSearch;
  const loaderRef = useRef(null);

  const feed = usePaginatedList({
    fetchPage: async(cursor) =>
      postservice
        .getcursoRows({ lastId: cursor, limit: PAGE_SIZE })
        .then((res) => res.rows),
    resetKey: "feed",
    pageSize: PAGE_SIZE,
  });

  
  const searchList = usePaginatedList({
    fetchPage:async (cursor) => {
      if (trimmed.length < 3) return Promise.resolve([]);
      return postservice
        .searchRows({ searchTerm: trimmed, lastId: cursor, limit: PAGE_SIZE })
        .then((res) => res.rows);
    },
    resetKey: `${trimmed}:${retryCount}`,
    pageSize: PAGE_SIZE,
  });

  const active = isSearching ? searchList : feed;

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) activeRef.current.loadMore();
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container>
        <section className="px-4 py-10 sm:px-6 lg:px-0">
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

          <div className="mb-8">
            <GooeySearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search posts by title..."
            />
            {isSearching && (
              <div className="mx-auto mt-3 max-w-3xl px-1 text-sm text-slate-500 dark:text-slate-400">
                Searching for{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{search}"
                </span>
              </div>
            )}
          </div>

          {isPending ||
          (isSearching && active.loading && active.data.length === 0) ? (
            <Loader
              text="Searching posts"
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ) : active.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {active.error}
              </p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : isSearching && active.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                🔎
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                No posts found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                We couldn't find any posts matching your search.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {active.data.map((post) => (
                  <div
                    key={post.$id}
                    className="group transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Postcard {...post} />
                  </div>
                ))}
              </div>
              <div ref={loaderRef} className="h-10" />
            </>
          )}
        </section>
      </Container>
    </main>
  );
}

export default AllPost;
