import { useEffect } from "react";
import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowUpRight,
  Bookmark,
  Compass,
  House,
  PenLine,
  SquarePen,
  UserRound,
} from "lucide-react";
import InkLogo from "../InkLogo";
import { CATEGORIES } from "../../constants/categories";

// `auth: true` items were hidden from guests in the old header too — they all
// lead to sign-in-only pages.
const NAV_ITEMS = [
  { label: "Home", to: "/", icon: House, end: true },
  { label: "Explore", to: "/all-posts", icon: Compass },
  { label: "Write", to: "/add-post", icon: SquarePen, auth: true },
  { label: "Bookmarks", to: "/saved", icon: Bookmark, auth: true },
  { label: "Profile", to: "/profile", icon: UserRound, auth: true },
];

/**
 * The INK sidebar. A fixed 205px column on desktop; below `lg` it becomes a
 * drawer that `open` slides in and any navigation closes.
 */
function Sidebar({ open, onClose }) {
  const authStatus = useSelector((state) => state.auth.status);
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const activeCategory = pathname === "/all-posts" ? params.get("category") : null;

  // Escape closes the drawer, as it would any overlay.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink-text/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Main"
        // Desktop: pinned to the viewport, as the design's fixed-height
        // "Sidebar content" block is — so the writing prompt never moves while
        // infinite scroll grows the page. Every section keeps its full height;
        // when the window is shorter than the sidebar, the sidebar itself
        // scrolls (thin scrollbar, so that's discoverable).
        // Below lg: the same column as a fixed drawer.
        className={`fixed inset-y-0 left-0 z-50 flex w-[205px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-ink-border bg-ink-sidebar px-5 py-8 transition-transform duration-200 [scrollbar-color:var(--ink-border)_transparent] [scrollbar-width:thin] lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:self-start lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/"
          onClick={onClose}
          className="flex h-[60px] shrink-0 items-start"
          aria-label="INK home"
        >
          <InkLogo />
        </Link>

        <nav className="flex shrink-0 flex-col gap-2 pt-5 pb-8">
          {NAV_ITEMS.filter((item) => !item.auth || authStatus).map(
            ({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex h-12 items-center gap-3.5 rounded-[3px] px-3 text-[13px] transition-colors ${
                    isActive
                      ? "bg-ink-sage font-extrabold text-ink-on-sage"
                      : "font-semibold text-ink-text hover:bg-ink-surface-2"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="h-px shrink-0 bg-ink-border" />

        <div className="flex shrink-0 flex-col gap-6 pl-3 pt-8">
          <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
            YOUR CURIOSITIES
          </p>
          {CATEGORIES.map((category) => (
            <Link
              key={category.key}
              to={`/all-posts?category=${category.key}`}
              onClick={onClose}
              aria-current={activeCategory === category.key ? "page" : undefined}
              className={`text-xs font-semibold transition-colors hover:text-ink-text ${
                activeCategory === category.key
                  ? "text-ink-text underline underline-offset-4"
                  : "text-ink-text-2"
              }`}
            >
              {category.label}
            </Link>
          ))}
          <Link
            to="/all-posts"
            onClick={onClose}
            className="flex items-center gap-2 text-[11px] font-extrabold text-ink-brand hover:underline"
          >
            All topics
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>

        <div aria-hidden="true" className="min-h-0 flex-1" />

        <Link
          to="/add-post"
          onClick={onClose}
          className="flex shrink-0 flex-col gap-4 rounded-[3px] border border-ink-border bg-ink-surface-2 p-5 transition-colors hover:border-ink-border-strong"
        >
          <PenLine size={22} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-base font-extrabold leading-[1.3] text-ink-text">
            Your next idea
            <br />
            starts here.
          </span>
          <span className="text-[11px] leading-[1.6] text-ink-text-2">
            A blank page. A fresh perspective. Make it yours.
          </span>
        </Link>

        <p className="shrink-0 pt-7 font-mono text-[9px] leading-[2.5] text-ink-muted">
          © {new Date().getFullYear()} INK
        </p>
      </aside>
    </>
  );
}

export default Sidebar;
