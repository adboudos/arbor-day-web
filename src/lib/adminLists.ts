/**
 * Editable admin lists: browser-local persistence for the contender lists.
 *
 * The static data in src/data/admin.ts is the seed. Edits save to
 * localStorage on this device only, so a host editing on their phone does
 * not change what the other hosts see. A shared Supabase table can replace
 * this storage layer later; the useEditableList hook in
 * src/app/admin/EditableLists.tsx is the seam.
 */

export interface EditableNameItem {
  id: string;
  name: string;
  detail?: string;
}

export interface EditableContender {
  id: string;
  name: string;
  location: string;
  deal: string[];
  caveats: string[];
}

const STORAGE_KEY = "arbor-admin-lists-v1";

export function slugId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  return `${prefix}-${rand}`;
}

export function toNameItems(
  seed: { name: string; detail?: string }[],
): EditableNameItem[] {
  return seed.map((s) => ({ id: slugId(s.name), name: s.name, detail: s.detail }));
}

export function toContenders(
  seed: {
    name: string;
    location: string;
    deal: string[];
    caveats: string[];
  }[],
): EditableContender[] {
  return seed.map((s) => ({
    id: slugId(s.name),
    name: s.name,
    location: s.location,
    deal: [...s.deal],
    caveats: [...s.caveats],
  }));
}

function readStore(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Corrupted store: fall through to the seed.
  }
  return {};
}

function writeStore(store: Record<string, unknown>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable: edits stay in memory for the session.
  }
}

/** Stored items for one list, or null when nothing was saved yet. */
export function loadList<T>(listId: string): T[] | null {
  const value = readStore()[listId];
  return Array.isArray(value) ? (value as T[]) : null;
}

export function saveList<T>(listId: string, items: T[]): void {
  const store = readStore();
  store[listId] = items;
  writeStore(store);
}

export function clearList(listId: string): void {
  const store = readStore();
  delete store[listId];
  writeStore(store);
}
