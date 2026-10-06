/**
 * Supabase backend for the Arbor Day site.
 *
 * Tables: editions, photos, ideas, hall_of_fame, photo_wall
 * (schemas in ~/workspace/arbor-day-supabase/schema.sql and migrate-v2.sql).
 * Timeline photos live in the public `history-photos` bucket;
 * guest uploads go to the public `photo-wall` bucket.
 *
 * Reads and writes use the publishable key; row level security allows
 * public selects plus inserts on the community tables. Votes go through
 * the cast_vote RPC so counts update atomically.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function checkEnv(): void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

/* ---------------- timeline (server) ---------------- */

export interface TimelinePhoto {
  src: string;
  alt: string;
}

export interface Edition {
  id: string;
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
  id: string;
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
  checkEnv();
  const url =
    `${SUPABASE_URL}/rest/v1/editions` +
    `?select=*,photos(storage_path,alt,position)` +
    `&order=year.asc&photos.order=position.asc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY as string },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Supabase editions fetch failed with status ${res.status}.`);
  }
  const rows = (await res.json()) as EditionRow[];
  return rows.map((row) => ({
    id: row.id,
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

/* ---------------- shared REST helpers (client) ---------------- */

/**
 * Both headers are needed. The database API accepts `apikey` alone, but the
 * Storage API rejects any request without `Authorization`.
 */
function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY as string,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

async function sb(path: string, init?: RequestInit): Promise<Response> {
  checkEnv();
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase ${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return res;
}

/* ---------------- ideas board ---------------- */

export interface IdeaRow {
  id: string;
  text: string;
  category: "feedback" | "idea" | "request";
  ups: number;
  downs: number;
  created_at: string;
}

export async function fetchIdeas(): Promise<IdeaRow[]> {
  const res = await sb("/rest/v1/ideas?select=*&order=created_at.desc");
  return (await res.json()) as IdeaRow[];
}

export async function createIdea(
  text: string,
  category: string,
): Promise<IdeaRow> {
  const res = await sb("/rest/v1/ideas", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ text, category }),
  });
  const rows = (await res.json()) as IdeaRow[];
  return rows[0];
}

/** Adjust a post's vote counts atomically. Deltas must each be -1, 0, or 1. */
export async function castVote(
  ideaId: string,
  upDelta: number,
  downDelta: number,
): Promise<void> {
  await sb("/rest/v1/rpc/cast_vote", {
    method: "POST",
    body: JSON.stringify({
      p_idea_id: ideaId,
      p_up_delta: upDelta,
      p_down_delta: downDelta,
    }),
  });
}

/* ---------------- hall of fame ---------------- */

export interface VisitorRow {
  id: string;
  name: string;
  year: number;
  hometown: string;
  resolved: string;
  lat: number;
  lng: number;
  miles: number;
  created_at: string;
}

export async function fetchVisitors(): Promise<VisitorRow[]> {
  const res = await sb("/rest/v1/hall_of_fame?select=*&order=created_at.desc");
  return (await res.json()) as VisitorRow[];
}

export async function createVisitor(v: {
  name: string;
  year: number;
  hometown: string;
  resolved: string;
  lat: number;
  lng: number;
  miles: number;
}): Promise<VisitorRow> {
  const res = await sb("/rest/v1/hall_of_fame", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(v),
  });
  const rows = (await res.json()) as VisitorRow[];
  return rows[0];
}

/* ---------------- photo wall ---------------- */

export interface PhotoWallRow {
  id: string;
  edition_id: string | null;
  storage_path: string;
  caption: string;
  uploader_name: string;
  approved: boolean;
  created_at: string;
  editions?: { year: number } | null;
}

export function photoWallUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/photo-wall/${storagePath}`;
}

export async function fetchPhotoWall(): Promise<PhotoWallRow[]> {
  const res = await sb(
    "/rest/v1/photo_wall?approved=eq.true&select=*,editions(year)&order=created_at.desc",
  );
  return (await res.json()) as PhotoWallRow[];
}

/** Upload a prepared image to the photo-wall bucket. Returns the storage path. */
export async function uploadPhotoWallFile(photo: {
  blob: Blob;
  contentType: string;
  ext: string;
}): Promise<string> {
  checkEnv();
  const path = `${crypto.randomUUID()}.${photo.ext}`;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/photo-wall/${path}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": photo.contentType,
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: photo.blob,
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Photo upload failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return path;
}

export async function createPhotoWallEntry(e: {
  edition_id: string | null;
  storage_path: string;
  caption: string;
  uploader_name: string;
}): Promise<void> {
  // Auto-approved: the hosts delete anything that does not fit.
  await sb("/rest/v1/photo_wall", {
    method: "POST",
    body: JSON.stringify({ ...e, approved: true }),
  });
}
