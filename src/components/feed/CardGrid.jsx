import { Postcard } from "../index";
import useCardMeta from "../../customHooks/useCardMeta";
import { PostGrid } from "./FeedStates";

/**
 * One loaded page of cards. Each page fetches its own counts and bookmark
 * state (useCardMeta), so loading page 4 never refetches pages 1–3.
 * `display: contents` lets the cards sit directly in the parent grid.
 */
function CardPage({ posts, showSave, leadWide }) {
  const ids = posts.map((post) => post.$id);
  const meta = useCardMeta(ids);

  return (
    <div className="contents">
      {posts.map((post, index) => (
        <Postcard
          key={post.$id}
          {...post}
          variant={leadWide && index === 0 ? "wide" : "grid"}
          showSave={showSave}
          // null = still loading (shows "—"); a number once counted.
          likes={meta.data ? meta.data.likes[post.$id] ?? 0 : null}
          comments={meta.data ? meta.data.comments[post.$id] ?? 0 : null}
        />
      ))}
    </div>
  );
}

/**
 * The INK three-up grid for an infinite feed, given its loaded pages. The
 * very first card spans two columns, as in the v2 designs.
 */
function CardGrid({ pages, showSave = true, wideFirst = true }) {
  return (
    <PostGrid>
      {pages.map((posts, index) =>
        posts.length ? (
          <CardPage
            key={posts[0].$id + index}
            posts={posts}
            showSave={showSave}
            leadWide={wideFirst && index === 0}
          />
        ) : null,
      )}
    </PostGrid>
  );
}

export default CardGrid;
