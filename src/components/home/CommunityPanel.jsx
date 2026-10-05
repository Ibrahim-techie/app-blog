import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowUpRight, Users } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";
import { useCategoryCounts } from "../../customHooks/useSiteStats";

/**
 * The right-hand editorial column: the INK statement, every category with
 * its real published-article count, and a sign-up call for guests.
 */
function CommunityPanel() {
  const authStatus = useSelector((state) => state.auth.status);
  const counts = useCategoryCounts();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-t border-ink-border pt-8 xl:w-[264px] xl:border-t-0 xl:border-l xl:pt-2 xl:pl-6">
      <span aria-hidden="true" className="h-[3px] w-[22px] bg-ink-brand" />
      <p className="text-[32px] font-extrabold leading-[1.02] tracking-[-1.6px] text-ink-text">
        A PLATFORM
        <br />
        FOR REAL
        <br />
        THINKERS.
      </p>
      <p className="text-[15px] leading-[1.65] text-ink-text-2">
        Not just more content. Better conversations. Find your people and share
        what matters.
      </p>

      <nav aria-label="Categories" className="flex flex-col gap-3 font-mono">
        <p className="text-[11px] leading-[1.5] tracking-[0.33px] text-ink-muted">
          EXPLORE YOUR WORLD
        </p>
        {CATEGORIES.map((category) => (
          <Link
            key={category.key}
            to={`/all-posts?category=${category.key}`}
            className="flex h-7 items-center justify-between border-b border-ink-border text-[11px] text-ink-text-2 transition-colors hover:text-ink-text"
          >
            {category.label}
            <span className="text-[10px] text-ink-muted tabular-nums">
              {counts.data ? counts.data[category.key] : "—"} ↗
            </span>
          </Link>
        ))}
      </nav>

      {!authStatus && (
        <Link
          to="/signup"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[3px] border border-ink-border-strong bg-ink-primary px-5 text-xs font-extrabold text-ink-on-primary"
        >
          Join the community
          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}

      <p className="flex items-center gap-2 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
        <Users size={13} strokeWidth={1.75} aria-hidden="true" />
        GOOD COMPANY. GREAT IDEAS.
      </p>
    </aside>
  );
}

export default CommunityPanel;
