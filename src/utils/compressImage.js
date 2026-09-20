const MAX_DIMENSION = 1600; // plenty for a full-width hero image
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 300 * 1024;

// Re-encoding these would destroy them: a GIF loses its animation, an SVG
// loses the fact that it's vector art.
const SKIP_TYPES = ["image/gif", "image/svg+xml"];

/**
 * Shrink a user-selected image before it is uploaded.
 *
 * Phone cameras produce 4000px, multi-megabyte photos, and this app shows them
 * in ~300px cards. Appwrite's on-the-fly resizing is a paid feature, so the
 * work happens here instead — which also keeps storage small permanently.
 *
 * Always returns something uploadable: if anything goes wrong, or if the
 * re-encode isn't actually smaller, the original file is returned untouched.
 */
export async function compressImage(file) {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (SKIP_TYPES.includes(file.type)) return file;

  let bitmap;
  try {
    // "from-image" applies EXIF rotation, so phone photos don't come out sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_DIMENSION / longestSide);

    // Already small in both bytes and pixels — leave it alone.
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    // JPEG has no transparency; without this, transparent PNGs turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );

    // A small or already-optimised image can grow when re-encoded.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed, uploading the original:", error);
    return file;
  } finally {
    bitmap?.close();
  }
}
