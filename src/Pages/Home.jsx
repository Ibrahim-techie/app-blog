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
    <div className="flex flex-col gap-10 px-5 py-8 sm:p-10">
      <HomeHero />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <FeaturedArticles />
        <CommunityPanel />
      </div>

      {isSignedIn && <YourPosts userId={userId} />}
    </div>
  );
}

export default Home;
