import { Link } from "react-router-dom";
import { Bookmark, FileText, LoaderCircle, Search } from "lucide-react";

// The loading / empty / error / end pieces every post feed shows, drawn once
// in INK styling. Presentational only — each page owns its query and decides
// which state applies.

/** Error with Retry. Errors aren't in the designs, so this follows StateCard. */
export function FeedError({ message, onRetry, isRetrying }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-ink-error/50 bg-ink-surface px-6 py-14 text-center"
    >
      <h2 className="text-lg font-semibold text-ink-error">
        Something went wrong
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-text-2">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex h-10 items-center rounded-lg border border-ink-border-strong bg-ink-primary px-5 text-xs font-semibold text-ink-on-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? "Retrying…" : "Retry"}
        </button>
      )}
    </div>
  );
}

const EMPTY_ICONS = { bookmark: Bookmark, posts: FileText, search: Search };

/** The large centred empty panel from the Bookmarks "Empty" frame. */
export function FeedEmpty({ title, children, action, icon }) {
  const Icon = EMPTY_ICONS[icon];
  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-ink-border bg-ink-surface px-6 py-20 text-center">
      {Icon && (
        <Icon
          size={40}
          strokeWidth={1.25}
          aria-hidden="true"
          className="text-ink-text"
        />
      )}
      <div className="flex max-w-[520px] flex-col gap-3">
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.56px] text-ink-text sm:text-[32px]">
          {title}
        </h2>
        {children && (
          <p className="font-serif text-[17px] leading-[1.6] text-ink-text-2">
            {children}
          </p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex h-9 items-center rounded-full bg-ink-primary px-4 text-sm font-medium text-ink-on-primary transition-opacity hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

const STATE_ICONS = { loading: LoaderCircle, search: Search, empty: FileText };

/**
 * The compact state tiles from the Explore "interaction states" strip:
 * loading (with skeleton lines), no search results, no posts.
 */
export function StateCard({ kind, title, children }) {
  const Icon = STATE_ICONS[kind] ?? FileText;
  return (
    <div
      role={kind === "loading" ? "status" : undefined}
      className="flex max-w-[360px] flex-col gap-3 rounded-lg border border-ink-border bg-ink-surface-2 p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-text">
        <Icon
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className={kind === "loading" ? "animate-spin" : ""}
        />
        {title}
      </p>
      {kind === "loading" && (
        <div aria-hidden="true" className="flex flex-col gap-1.5">
          <span className="h-[5px] w-full rounded-full bg-ink-border" />
          <span className="h-[5px] w-[120px] rounded-full bg-ink-border" />
        </div>
      )}
      {children && (
        <p className="text-sm leading-[1.5] text-ink-text-2">{children}</p>
      )}
    </div>
  );
}

/** "Loading more stories…" under a grid while the next page arrives. */
export function FeedLoadingMore({ label = "Loading more stories…" }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12" role="status">
      <LoaderCircle
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="animate-spin text-ink-muted"
      />
      <span className="font-mono text-xs tracking-[0.96px] text-ink-text-2">
        {label}
      </span>
    </div>
  );
}

export function FeedEnd() {
  return (
    <div className="flex items-center justify-center gap-4 py-10">
      <span className="h-px w-12 bg-ink-border" />
      <p className="font-mono text-xs tracking-[0.96px] text-ink-text-2">
        YOU&apos;VE REACHED THE END
      </p>
      <span className="h-px w-12 bg-ink-border" />
    </div>
  );
}

/** The three-up card grid used by Explore, Profile and Bookmarks. */
export function PostGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

/** Page hero: the large statement + serif supporting copy (Explore, Bookmarks). */
export function PageHero({ title, children, eyebrow }) {
  return (
    <div className="flex flex-col gap-5 pt-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase text-ink-text-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[44px] font-semibold leading-none tracking-[-1.32px] text-ink-text sm:text-[72px] sm:tracking-[-2.16px]">
        {title}
      </h1>
      {children && (
        <p className="max-w-[720px] font-serif text-[17px] leading-[1.6] text-ink-text-2">
          {children}
        </p>
      )}
    </div>
  );
}

/** "All posts ……… LATEST WRITING / 08" — a section title with mono metadata. */
export function SectionHeading({ id, title, meta }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-2">
      <h2
        id={id}
        className="text-2xl font-semibold leading-[1.1] tracking-[-0.64px] text-ink-text sm:text-[32px]"
      >
        {title}
      </h2>
      {meta && (
        <p className="shrink-0 font-mono text-xs leading-[1.4] tracking-[0.96px] text-ink-text-2">
          {meta}
        </p>
      )}
    </div>
  );
}

/** The mono footer line under a feed. */
export function EditorialNote({ left, right }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 pt-2 font-mono text-xs leading-[1.4] tracking-[0.96px] text-ink-text-2">
      <p>{left}</p>
      {right && <p>{right}</p>}
    </div>
  );
}
