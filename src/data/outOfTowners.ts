/**
 * Out-of-Towner Hall of Fame: data model + helpers.
 *
 * Visitors add themselves with a name, party year, and hometown. Hometowns are
 * geocoded via Nominatim (OpenStreetMap, no API key), Illinois entries are
 * rejected, and distance from Chicago is computed with haversine.
 *
 * Visitors live in Supabase (see @/lib/supabase); every entry is visible
 * to everyone.
 */

export interface OutOfTowner {
  id: string;
  name: string;
  year: number;
  /** Hometown as the visitor typed it. */
  hometown: string;
  /** Resolved "City, State, Country" from geocoding. */
  resolved: string;
  lat: number;
  lng: number;
  /** Great-circle miles from Chicago. */
  miles: number;
  addedAt: string;
}

/** Party years. The series started in 2022 (2026 was billed the 5th annual). */
export const PARTY_YEARS = [2022, 2023, 2024, 2025, 2026, 2027];

/** Rough downtown Chicago, the party's home turf. */
export const CHICAGO = { lat: 41.8781, lng: -87.6298 };

export function haversineMiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const milesToChicago = (lat: number, lng: number) =>
  haversineMiles(lat, lng, CHICAGO.lat, CHICAGO.lng);

/** Rough Illinois bounding box, used as a fallback when geocoder address data is thin. */
const ILLINOIS_BBOX = { minLat: 36.97, maxLat: 42.51, minLng: -91.51, maxLng: -87.02 };

export function inIllinoisBbox(lat: number, lng: number): boolean {
  return (
    lat >= ILLINOIS_BBOX.minLat &&
    lat <= ILLINOIS_BBOX.maxLat &&
    lng >= ILLINOIS_BBOX.minLng &&
    lng <= ILLINOIS_BBOX.maxLng
  );
}

export interface GeocodedHometown {
  lat: number;
  lng: number;
  /** "City, State, Country" style display name. */
  displayName: string;
  state?: string;
  countryCode?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function shortDisplayName(r: NominatimResult): string {
  const a = r.address;
  const city = a?.city ?? a?.town ?? a?.village ?? a?.municipality;
  const parts = [city, a?.state, a?.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : r.display_name;
}

/**
 * Geocode a hometown string. Throws on network failure; returns null when
 * nothing is found. `isIllinois` is best-effort from the geocoder's address
 * data, so callers should also check the bounding box.
 */
export async function geocodeHometown(
  query: string,
): Promise<(GeocodedHometown & { isIllinois: boolean }) | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("geocode failed");
  const data = (await res.json()) as NominatimResult[];
  if (!data || data.length === 0) return null;
  const r = data[0];
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lon);
  const state = r.address?.state ?? "";
  const isIllinois =
    /illinois/i.test(state) || inIllinoisBbox(lat, lng);
  return {
    lat,
    lng,
    displayName: shortDisplayName(r),
    state: state || undefined,
    countryCode: r.address?.country_code,
    isIllinois,
  };
}

/** Quick text pre-check so obvious Illinois entries fail fast with attitude. */
export function looksLikeIllinois(input: string): boolean {
  return /\billinois\b/i.test(input) || /,\s*il\b/i.test(input);
}


export function isDuplicate(
  visitors: OutOfTowner[],
  name: string,
  hometown: string,
  year: number,
): boolean {
  const n = name.trim().toLowerCase();
  const h = hometown.trim().toLowerCase();
  return visitors.some(
    (v) =>
      v.name.trim().toLowerCase() === n &&
      v.hometown.trim().toLowerCase() === h &&
      v.year === year,
  );
}

/** Awards for the furthest-traveled leaderboard. */
export const AWARDS = [
  { emoji: "🏆", title: "The Long Haul" },
  { emoji: "🥈", title: "Cross-Country Royalty" },
  { emoji: "🥉", title: "Certified Road Warrior" },
] as const;

export const fmtMiles = (m: number) =>
  `${Math.round(m).toLocaleString("en-US")} mi`;
