/**
 * Get a picked photo ready for the photo wall: check it, and shrink big
 * phone photos to a web-sized JPEG before upload. Smaller files keep the
 * Supabase storage and bandwidth bill at zero, load faster on the wall,
 * and re-encoding drops EXIF data (including GPS location) from the photo.
 */

/** Longest edge, in pixels, of what we store. Plenty for a wall card or a full-screen view. */
const MAX_EDGE = 2000;
/** Originals at or under this size and edge length are uploaded untouched. */
const KEEP_ORIGINAL_BYTES = 1.5 * 1024 * 1024;
/** Hard cap on what someone can pick. Anything bigger is almost certainly not a photo. */
export const MAX_PICK_MB = 30;
/** Hard cap on what we actually upload. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Formats every browser can display, so they can go up as-is. */
const WEB_SAFE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface PreparedPhoto {
  blob: Blob;
  contentType: string;
  ext: string;
}

/** A user-facing problem with the picked file. The message is safe to show. */
export class PhotoProblem extends Error {}

function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

/** Some browsers leave `type` blank for HEIC files, so fall back to the name. */
function looksLikeImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name);
}

function asIs(file: File): PreparedPhoto {
  return { blob: file, contentType: file.type, ext: extFor(file.type) };
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!looksLikeImage(file)) {
    throw new PhotoProblem("That file is not an image. The wall only hangs photos.");
  }
  if (file.size > MAX_PICK_MB * 1024 * 1024) {
    throw new PhotoProblem(`Keep it under ${MAX_PICK_MB}MB.`);
  }
  const webSafe = WEB_SAFE.includes(file.type);

  // GIFs may be animated; re-encoding would freeze them.
  if (file.type === "image/gif") {
    if (file.size > MAX_UPLOAD_BYTES) throw new PhotoProblem("Keep GIFs under 10MB.");
    return asIs(file);
  }

  let bitmap: ImageBitmap;
  try {
    // Respects the EXIF rotation, so sideways phone photos come out upright.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (webSafe && file.size <= MAX_UPLOAD_BYTES) return asIs(file);
    throw new PhotoProblem(
      "This browser can't read that photo. iPhone HEIC photos are the usual culprit: export it as a JPEG and try again.",
    );
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  if (webSafe && longest <= MAX_EDGE && file.size <= KEEP_ORIGINAL_BYTES) {
    bitmap.close();
    return asIs(file);
  }

  const scale = Math.min(1, MAX_EDGE / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    if (webSafe && file.size <= MAX_UPLOAD_BYTES) return asIs(file);
    throw new PhotoProblem("That photo is too big to upload. Try a smaller one.");
  }
  // JPEG has no transparency; give see-through PNGs a white backing instead of black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob || blob.size > MAX_UPLOAD_BYTES) {
    throw new PhotoProblem("That photo is too big to upload. Try a smaller one.");
  }
  return { blob, contentType: "image/jpeg", ext: "jpg" };
}
