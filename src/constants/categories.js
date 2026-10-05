/**
 * The one list of article categories.
 *
 * `key` is what Appwrite stores — the articles.category enum column accepts
 * exactly these values, so adding a category means updating that enum too.
 * `label` is display-only and can be renamed freely.
 */
export const CATEGORIES = [
  { key: "development", label: "Development" },
  { key: "technology", label: "Technology" },
  { key: "career", label: "Career" },
  { key: "productivity", label: "Productivity" },
  { key: "design", label: "Design" },
  { key: "life", label: "Life" },
  { key: "college", label: "College" },
  { key: "business", label: "Business" },
];

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

/** Display label for a stored key, or null for posts with no category. */
export const categoryLabel = (key) => LABELS[key] ?? null;

export const isCategory = (key) => Boolean(LABELS[key]);
