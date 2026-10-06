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
 * The INK sidebar. A fixed 240px column on desktop; below `lg` it becomes a
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
        // sidebar is — so the writing prompt never moves while infinite
        // scroll grows the page. Every section keeps its full height; when
        // the window is shorter than the sidebar, the sidebar itself scrolls
        // (thin scrollbar, so that's discoverable).
        // Below lg: the same column as a fixed drawer.
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col gap-10 overflow-y-auto border-r border-ink-border bg-ink-sidebar px-6 py-8 transition-transform duration-200 [scrollbar-color:var(--ink-border-strong)_transparent] [scrollbar-width:thin] lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:self-start lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/"
          onClick={onClose}
          className="flex shrink-0 items-center self-start rounded-lg"
          aria-label="INK home"
        >
          <InkLogo />
        </Link>

        <nav className="flex shrink-0 flex-col gap-2">
          {NAV_ITEMS.filter((item) => !item.auth || authStatus).map(
            ({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex h-12 items-center gap-4 rounded-lg px-4 text-sm text-ink-text transition-colors ${
                    isActive
                      ? "bg-ink-surface-2 font-semibold"
                      : "hover:bg-ink-surface-2"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute top-4 left-0 h-4 w-0.5 bg-ink-text"
                      />
                    )}
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    {label}
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex shrink-0 flex-col gap-5 border-t border-ink-border pt-8">
          <p className="text-xs font-semibold uppercase text-ink-text-2">
            Your curiosities
          </p>
          {/* The design stacks five chips; with all eight categories they
              wrap instead, so the writing prompt stays reachable. */}
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category.key;
              return (
                <Link
                  key={category.key}
                  to={`/all-posts?category=${category.key}`}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-ink-border-strong bg-ink-surface-2 text-ink-text"
                      : "border-ink-border bg-ink-sidebar text-ink-text-2 hover:bg-ink-surface-2 hover:text-ink-text"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
          <Link
            to="/all-posts"
            onClick={onClose}
            className="flex items-center gap-1 self-start text-sm text-ink-text hover:underline"
          >
            All topics
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>

        <div aria-hidden="true" className="min-h-0 flex-1" />

        <div className="flex shrink-0 flex-col gap-6">
          <Link
            to="/add-post"
            onClick={onClose}
            className="flex flex-col gap-4 rounded-lg bg-ink-surface-2 p-6 transition-colors hover:bg-ink-sage-hover"
          >
            <PenLine size={20} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xl font-semibold leading-[1.25] text-ink-text">
              Your next idea starts here.
            </span>
            <span className="font-serif text-[17px] leading-[1.6] text-ink-text-2">
              A blank page. A fresh perspective. Make it yours.
            </span>
          </Link>

          <p className="text-xs leading-[1.6] text-ink-text-2">
            © {new Date().getFullYear()} INK
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
