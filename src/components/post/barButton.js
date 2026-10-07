// The post action row (Like · Comment · Bookmark · Share). On phones each
// action is a bordered pill (icon + count) or a round icon button, so the row
// never wraps or runs off screen; from `sm` up it's the plain text row of the
// INK desktop design.
const BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-ink-border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:rounded-none sm:border-0 sm:text-xs";

/** Icon + count on phones, icon + label + count from sm. */
export const BAR_PILL = `${BASE} px-3.5 sm:px-0`;

/** Icon alone on phones, icon + label from sm. */
export const BAR_ICON = `${BASE} w-10 sm:w-auto`;

export const barTone = (active) =>
  active ? "text-ink-text" : "text-ink-text-2 hover:text-ink-text";
