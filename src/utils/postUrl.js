const MAX_SLUG_LENGTH = 80;

// Turns a title into the readable part of a post URL:
//   "Hello, World!"  -> "hello-world"
//   "Café au lait"   -> "cafe-au-lait"
//   "हिंदी पोस्ट"      -> "हिंदी-पोस्ट"
// The slug is decoration only. Posts are always looked up by their id, so two
// posts with the same title can share a slug without clashing.
export function slugify(title) {
  const slug = String(title ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip Latin accents: é -> e
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-") // anything that isn't a letter or digit becomes "-"
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, ""); // no leading or trailing "-"

  // A title made only of emoji or punctuation leaves nothing behind.
  return slug || "post";
}

// The one place that decides what a post's URL looks like.
export function postPath(post) {
  return `/post/${encodeURIComponent(slugify(post.title))}/${encodeURIComponent(post.$id)}`;
}
