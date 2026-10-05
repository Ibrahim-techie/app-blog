import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Postcard, Loader } from "../index";
import { FeedError } from "../feed/FeedStates";
import postservice from "../../services/Post.service";
import { excerpt, readingMinutes } from "../../utils/postText";

/**
 * The three newest published articles. There is no editorial "featured" flag
 * in the data, so the selection is honestly "newest first" — the note under
 * the grid says so.
 */
function FeaturedArticles() {
  const featured = useQuery({
    // Under ["posts"] so publishing or deleting a post refreshes it.
    queryKey: ["posts", "featured"],
    queryFn: () => postservice.getFeaturedPosts(3),
    staleTime: 60_000,
  });

  return (
    <section aria-labelledby="featured-title" className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pb-2">
        <h2
          id="featured-title"
          className="text-[24px] font-bold tracking-[-0.6px] text-ink-text sm:text-[30px]"
        >
          FEATURED ARTICLES
        </h2>
        <Link
          to="/all-posts"
          className="flex shrink-0 items-center gap-2 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-text-2 hover:text-ink-text"
        >
          View all
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>

      {featured.isPending ? (
        <Loader text="Loading articles" compact />
      ) : featured.isError ? (
        <FeedError
          message={
            featured.error?.message ?? "We couldn't load the latest articles."
          }
          onRetry={() => featured.refetch()}
          isRetrying={featured.isFetching}
        />
      ) : featured.data.length === 0 ? (
        <p className="rounded-[2px] border border-dashed border-ink-border bg-ink-surface px-6 py-12 text-center text-sm text-ink-text-2">
          Nothing has been published yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.data.map(({ content, ...post }) => (
            <Postcard
              key={post.$id}
              {...post}
              excerpt={excerpt(content)}
              readingMinutes={readingMinutes(content)}
              showSave
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2 pt-1 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
        <p>INDEPENDENT VOICES. FRESH PERSPECTIVES.</p>
        <p>NEWEST PUBLISHED FIRST</p>
      </div>
    </section>
  );
}

export default FeaturedArticles;
