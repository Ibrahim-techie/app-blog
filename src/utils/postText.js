// Article bodies are stored as editor HTML. These turn one into the plain
// text a card needs, without rendering it.

function plainText(html) {
  if (!html) return "";
  return (
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** The opening of the article, cut on a word boundary. */
export function excerpt(html, maxLength = 140) {
  const text = plainText(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, text.lastIndexOf(" ", maxLength)).trim()}…`;
}

/** Whole minutes at ~200 words a minute, never less than one. */
export function readingMinutes(html) {
  const words = plainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "OCT 01", or "OCT 01 2025" when it isn't this year — the card byline style. */
export function cardDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      ...(sameYear ? {} : { year: "numeric" }),
    })
    .replace(",", "")
    .toUpperCase();
}
