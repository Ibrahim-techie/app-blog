import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";
import { useCategoryCounts } from "../../customHooks/useSiteStats";

/**
 * The community band: the INK statement with a call to action, and every
 * category with its real published-article count.
 */
function CommunityPanel() {
  const authStatus = useSelector((state) => state.auth.status);
  const counts = useCategoryCounts();

  // Guests are invited to sign up; a signed-in reader is already in, so the
  // same slot invites them to write instead.
  const action = authStatus
    ? { to: "/add-post", label: "Write a post" }
    : { to: "/signup", label: "Join the community" };

  return (
    <section className="flex flex-col gap-10 rounded-lg bg-ink-surface p-6 sm:p-8 lg:flex-row lg:gap-16">
      <div className="flex flex-1 flex-col items-start gap-6">
        <h2 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.64px] text-ink-text sm:text-[32px]">
          A platform for real thinkers.
        </h2>
        <p className="max-w-[480px] font-serif text-[17px] leading-[1.6] text-ink-text-2">
          Not just more content. Better conversations. Find your people and
          share what matters.
        </p>
        <Link
          to={action.to}
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-ink-primary px-6 text-sm font-semibold text-ink-on-primary transition-opacity hover:opacity-90"
        >
          {action.label}
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <p className="text-xs leading-[1.5] text-ink-text-2">
          Good company. Great ideas.
        </p>
      </div>

      <nav aria-label="Categories" className="flex flex-1 flex-col gap-4">
        <p className="text-xs font-semibold uppercase text-ink-text-2">
          Explore your world
        </p>
        <div className="flex flex-col">
          {CATEGORIES.map((category) => (
            <Link
              key={category.key}
              to={`/all-posts?category=${category.key}`}
              className="flex h-12 items-center justify-between border-b border-ink-border text-sm text-ink-text transition-colors hover:text-ink-text-2"
            >
              {category.label}
              <span className="text-xs text-ink-text-2 tabular-nums">
                {counts.data ? counts.data[category.key] : "—"} ↗
              </span>
            </Link>
          ))}
        </div>
        <Link
          to="/all-posts"
          className="flex items-center gap-1 self-start text-xs text-ink-text hover:underline"
        >
          All topics
          <ArrowUpRight size={12} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </nav>
    </section>
  );
}

export default CommunityPanel;
