/**
 * Supabase backend for the Arbor Day site.
 *
 * Tables: editions, photos (schema in ~/workspace/arbor-day-supabase/schema.sql).
 * Timeline photos live in the public `history-photos` storage bucket.
 * Reads use the publishable key; row level security allows public selects.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface TimelinePhoto {
  src: string;
  alt: string;
}

export interface Edition {
  year: number;
  /** e.g. "Friday, April 28, 2023" */
  date: string;
  venue: string;
  neighborhood: string;
  address: string;
  /** Map pin. Absent while the venue is still to be announced. */
  lat?: number;
  lng?: number;
  photos: TimelinePhoto[];
}

interface PhotoRow {
  storage_path: string;
  alt: string;
  position: number;
}

interface EditionRow {
  year: number;
  date: string;
  venue: string;
  neighborhood: string;
  address: string;
  lat: number | null;
  lng: number | null;
  photos: PhotoRow[];
}

export function photoUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/history-photos/${storagePath}`;
}

/**
 * Fetch all editions with their photos, oldest first.
 * Cached for an hour; the database is the single source of truth.
 */
export async function fetchEditions(): Promise<Edition[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them in Vercel under Project Settings, Environment Variables.",
    );
  }
  const url =
    `${SUPABASE_URL}/rest/v1/editions` +
    `?select=*,photos(storage_path,alt,position)` +
    `&order=year.asc&photos.order=position.asc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Supabase editions fetch failed with status ${res.status}.`);
  }
  const rows = (await res.json()) as EditionRow[];
  return rows.map((row) => ({
    year: row.year,
    date: row.date,
    venue: row.venue,
    neighborhood: row.neighborhood ?? "",
    address: row.address ?? "",
    ...(row.lat != null && row.lng != null
      ? { lat: row.lat, lng: row.lng }
      : {}),
    photos: (row.photos ?? []).map((p) => ({
      src: photoUrl(p.storage_path),
      alt: p.alt ?? "",
    })),
  }));
}
