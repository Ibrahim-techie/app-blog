import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, Menu, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * The INK header: search, notifications (disabled), theme switch and the
 * account controls.
 *
 * Searching hands off to Explore (`/all-posts?q=…`), which already owns
 * debounced title search with infinite scroll — this box is a shortcut to
 * it, not a second search implementation.
 */
function TopBar({ onOpenMenu }) {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [term, setTerm] = useState("");

  // ⌘K / Ctrl+K jumps to the search box from anywhere.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/all-posts?q=${encodeURIComponent(query)}` : "/all-posts");
    setTerm("");
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-ink-border bg-ink-bg px-4 sm:px-10 lg:h-24">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-text hover:bg-ink-surface-2 lg:hidden"
      >
        <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <form
        role="search"
        onSubmit={submit}
        className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-ink-border bg-ink-surface px-4 focus-within:border-ink-border-strong lg:w-[492px] lg:flex-none"
      >
        <Search
          size={17}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0 text-ink-muted"
        />
        <input
          ref={inputRef}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search articles by title..."
          aria-label="Search articles"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs tracking-[0.96px] text-ink-text outline-none placeholder:text-ink-text-2 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="hidden shrink-0 font-mono text-xs leading-[1.4] tracking-[0.96px] text-ink-text-2 sm:block">
          {IS_MAC ? "⌘ K" : "Ctrl K"}
        </kbd>
      </form>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* In the design, but the app has no notifications yet — shown
            disabled rather than left out or wired to nothing. */}
        <button
          type="button"
          disabled
          aria-label="Notifications (coming soon)"
          title="Notifications are coming soon"
          className="hidden size-9 cursor-not-allowed items-center justify-center rounded-lg text-ink-muted sm:inline-flex"
        >
          <Bell size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <ThemeToggle />
        <span aria-hidden="true" className="mx-1 hidden h-7 w-px bg-ink-border sm:block" />
        {authStatus ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg border border-ink-border bg-ink-surface px-3 text-xs font-semibold text-ink-text transition-colors hover:bg-ink-surface-2 sm:px-4"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="hidden h-9 items-center rounded-lg bg-ink-primary px-4 text-xs font-semibold text-ink-on-primary transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
