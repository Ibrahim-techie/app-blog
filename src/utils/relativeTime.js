const UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 minutes ago", "last week" — falls back to a date once it's over a year old. */
export function relativeTime(isoDate) {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return "";

  const seconds = (then.getTime() - Date.now()) / 1000;
  const elapsed = Math.abs(seconds);

  if (elapsed < 45) return "just now";

  for (const [unit, unitSeconds] of UNITS) {
    if (elapsed >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }

  return "just now";
}

/** Full timestamp for the title attribute, so hovering shows the exact time. */
export function exactTime(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}
