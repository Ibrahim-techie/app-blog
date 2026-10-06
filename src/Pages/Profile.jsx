import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileDialog from "../components/profile/EditProfileDialog";
import PagedFeed from "../components/feed/PagedFeed";
import { EditorialNote, SectionHeading } from "../components/feed/FeedStates";
import postservice from "../services/Post.service";
import useProfileStats from "../customHooks/useProfileStats";
import useSavedPosts from "../customHooks/useSavedPosts";
import useLikedPosts from "../customHooks/useLikedPosts";

const PAGE_SIZE = 12;

// The design's tabs, minus "Reading History" — the app doesn't record what
// people read, and the profile brief rules it out.
const TABS = [
  { key: "posts", label: "My Posts" },
  { key: "bookmarks", label: "Bookmarks" },
  { key: "liked", label: "Liked" },
  { key: "drafts", label: "Drafts" },
];

// Cursor pagination, same as the other feeds.
const getNextPageParam = (lastPage) =>
  lastPage.rows.length < PAGE_SIZE
    ? undefined
    : lastPage.rows[lastPage.rows.length - 1].$id;

/** The signed-in user's own posts with one status — published or drafts. */
function useOwnPosts(userId, status, key) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    // Under ["posts", "user", userId] so post create/edit/delete refresh it.
    // `key` names the status ("profile" = published, kept from before).
    queryKey: ["posts", "user", userId, key, status],
    queryFn: ({ pageParam }) =>
      postservice.getcursorRows({
        lastId: pageParam,
        limit: PAGE_SIZE,
        userID: userId,
        status,
      }),
    initialPageParam: null,
    getNextPageParam,
    staleTime: 60000,
    enabled: Boolean(userId),
  });
  return {
    pages: data?.pages.map((page) => page.rows) ?? [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}

// Each tab is its own component so only the open tab's query runs.

function MyPostsTab({ userId }) {
  return (
    <PagedFeed
      feed={useOwnPosts(userId, "active", "profile")}
      loadingTitle="Loading your posts"
      empty={{
        icon: "posts",
        title: "Nothing published yet.",
        text: "Posts you publish will appear here. Drafts stay under Drafts until you make them public.",
        action: { to: "/add-post", label: "Write your first post" },
      }}
    />
  );
}

function DraftsTab({ userId }) {
  return (
    <PagedFeed
      feed={useOwnPosts(userId, "inactive", "drafts")}
      loadingTitle="Loading your drafts"
      empty={{
        icon: "posts",
        title: "No drafts.",
        text: "Save a post as a draft and it will wait here — only you can see it.",
        action: { to: "/add-post", label: "Start a draft" },
      }}
    />
  );
}

function BookmarksTab() {
  return (
    <PagedFeed
      feed={useSavedPosts()}
      loadingTitle="Loading your bookmarks"
      empty={{
        icon: "bookmark",
        title: "No saved posts yet.",
        text: "Bookmark articles you want to read later and they'll appear here.",
        action: { to: "/all-posts", label: "Explore Posts" },
      }}
    />
  );
}

function LikedTab() {
  return (
    <PagedFeed
      feed={useLikedPosts()}
      loadingTitle="Loading posts you liked"
      empty={{
        title: "No liked posts yet.",
        text: "Posts you like will collect here.",
        action: { to: "/all-posts", label: "Explore Posts" },
      }}
    />
  );
}

function Profile() {
  const user = useSelector((state) => state.auth.userData);
  const userId = user?.$id;
  const [isEditing, setIsEditing] = useState(false);
  const [params, setParams] = useSearchParams();
  const stats = useProfileStats(userId);

  // The open tab lives in the URL, so it survives a reload and can be linked.
  const tab = TABS.find((item) => item.key === params.get("tab")) ?? TABS[0];
  const selectTab = (key) =>
    setParams(key === "posts" ? {} : { tab: key }, { replace: true });

  return (
    <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-8 px-5 py-8 sm:p-10">
      <div>
        <ProfileHeader
          user={user}
          onEdit={() => setIsEditing(true)}
          stats={stats.data}
          statsPending={stats.isPending}
          statsError={stats.isError}
          onRetry={() => stats.refetch()}
        />

        <nav
          aria-label="Profile sections"
          className="flex h-12 gap-9 overflow-x-auto border-y border-ink-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((item) => {
            const selected = item.key === tab.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => selectTab(item.key)}
                className={`flex h-full shrink-0 items-center border-b-2 px-1 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-ink-text text-ink-text"
                    : "border-transparent text-ink-text-2 hover:text-ink-text"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <section aria-labelledby="profile-tab-title" className="flex flex-col gap-6">
        <SectionHeading
          id="profile-tab-title"
          title={tab.label}
          meta={
            tab.key === "posts" && stats.data
              ? `LATEST WRITING / ${String(stats.data.posts).padStart(2, "0")}`
              : tab.key === "drafts"
                ? "ONLY YOU CAN SEE DRAFTS"
                : null
          }
        />

        {tab.key === "posts" && <MyPostsTab userId={userId} />}
        {tab.key === "drafts" && <DraftsTab userId={userId} />}
        {tab.key === "bookmarks" && <BookmarksTab />}
        {tab.key === "liked" && <LikedTab />}

        <EditorialNote
          left="INDEPENDENT VOICES. FRESH PERSPECTIVES."
          right={`INK / ${(user?.name || "YOU").toUpperCase()}`}
        />
      </section>

      {isEditing && (
        <EditProfileDialog user={user} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}

export default Profile;
