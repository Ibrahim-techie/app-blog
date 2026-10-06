import { useSelector } from "react-redux";
import HomeHero from "../components/home/HomeHero";
import FeaturedArticles from "../components/home/FeaturedArticles";
import CommunityPanel from "../components/home/CommunityPanel";
import YourPosts from "../components/home/YourPosts";

/**
 * Home: the INK editorial page for everyone, plus — for a signed-in author —
 * the existing "Your Posts" dashboard with its tabs, search and drafts.
 */
function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const userId = useSelector((state) => state.auth.userData?.$id);
  const isSignedIn = authStatus && Boolean(userId);

  return (
    <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-16 px-5 py-8 sm:p-12 lg:gap-24">
      <HomeHero />
      <FeaturedArticles />
      <CommunityPanel />

      {isSignedIn && <YourPosts userId={userId} />}

      <footer className="flex justify-between gap-4 border-t border-ink-border pt-8 text-xs text-ink-text-2">
        <p>© {new Date().getFullYear()} INK</p>
        <p>Independent voices. Fresh perspectives.</p>
      </footer>
    </div>
  );
}

export default Home;
