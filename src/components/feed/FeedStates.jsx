import { Link } from "react-router-dom";
import { FileText, LoaderCircle, Search } from "lucide-react";

// The loading / empty / error / end pieces every post feed shows, drawn once
// in INK styling. Presentational only — each page owns its query and decides
// which state applies.

/** Error with Retry. Errors aren't in the designs, so this follows StateCard. */
export function FeedError({ message, onRetry, isRetrying }) {
  return (
    <div
      role="alert"
      className="rounded-[2px] border border-ink-error/50 bg-ink-surface px-6 py-14 text-center"
    >
      <h2 className="text-lg font-extrabold text-ink-error">
        Something went wrong
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-text-2">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex h-10 items-center rounded-[3px] border border-ink-border-strong bg-ink-primary px-5 text-xs font-extrabold text-ink-on-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? "Retrying…" : "Retry"}
        </button>
      )}
    </div>
  );
}

/** The large centred empty panel from the Bookmarks "Empty" frame. */
export function FeedEmpty({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[2px] border border-ink-border bg-ink-surface p-10 text-center">
      <div className="flex max-w-[520px] flex-col gap-3">
        <h2 className="text-[30px] font-bold leading-tight tracking-[-0.6px] text-ink-text">
          {title}
        </h2>
        {children && (
          <p className="text-base leading-[1.6] text-ink-text-2">{children}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex h-9 items-center rounded-full bg-ink-primary px-4 text-sm text-ink-on-primary"
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
      className="flex max-w-[360px] flex-col gap-2.5 rounded-[2px] border border-ink-border bg-ink-surface-2 p-4"
    >
      <p className="flex items-center gap-2 text-[13px] font-bold text-ink-text-2">
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
          <span className="h-[5px] w-full bg-ink-border" />
          <span className="h-[5px] w-[120px] bg-ink-border" />
        </div>
      )}
      {children && (
        <p className="text-[11px] leading-[1.5] text-ink-muted">{children}</p>
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
      <span className="font-mono text-[11px] tracking-[0.33px] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

export function FeedEnd() {
  return (
    <div className="flex items-center justify-center gap-4 py-10">
      <span className="h-px w-12 bg-ink-border" />
      <p className="font-mono text-[10px] tracking-[0.3px] text-ink-muted">
        YOU&apos;VE REACHED THE END
      </p>
      <span className="h-px w-12 bg-ink-border" />
    </div>
  );
}

/** The four-up card grid used by Explore, Profile and Bookmarks. */
export function PostGrid({ children }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
}

/** Page hero: 84px statement + supporting copy (Explore, Bookmarks). */
export function PageHero({ title, children, eyebrow }) {
  return (
    <div className="flex flex-col gap-6 pt-4 pb-2">
      {eyebrow && (
        <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[48px] font-extrabold leading-[0.98] tracking-[-2.4px] text-ink-text sm:text-[84px] sm:tracking-[-5.04px]">
        {title}
      </h1>
      {children && (
        <p className="max-w-[900px] text-[15px] leading-[1.6] tracking-[-0.04px] text-ink-text-2">
          {children}
        </p>
      )}
    </div>
  );
}

/** "ALL POSTS ……… 77 ARTICLES" — a section title with mono metadata. */
export function SectionHeading({ id, title, meta }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-2">
      <h2
        id={id}
        className="text-[24px] font-bold tracking-[-0.6px] text-ink-text sm:text-[30px]"
      >
        {title}
      </h2>
      {meta && (
        <p className="shrink-0 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
          {meta}
        </p>
      )}
    </div>
  );
}

/** The mono footer line under a feed. */
export function EditorialNote({ left, right }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 pt-1 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
      <p>{left}</p>
      {right && <p>{right}</p>}
    </div>
  );
}
