/**
 * Ideas & Requests board: data model + helpers.
 *
 * Open board: anyone can post feedback, ideas, or requests about past,
 * present, or future Arbor Days. Posts rank by net score
 * (upvotes minus downvotes); each device gets one vote per post.
 *
 * Persistence is device-local (localStorage) for now. `loadItems` /
 * `saveItems` / `loadVotes` / `saveVotes` are the seam: swap them for API
 * calls when a backend exists and the board becomes truly shared.
 */

export type IdeaCategory = "feedback" | "idea" | "request";

export const CATEGORIES: Record<
  IdeaCategory,
  { label: string; tagline: string }
> = {
  feedback: { label: "Feedback", tagline: "What worked, what didn't." },
  idea: { label: "Idea", tagline: "Something new to try." },
  request: { label: "Request", tagline: "Something you want." },
};

export const CATEGORY_ORDER: IdeaCategory[] = ["feedback", "idea", "request"];

export interface BoardItem {
  id: string;
  text: string;
  category: IdeaCategory;
  createdAt: string;
  ups: number;
  downs: number;
}

/** Hard cap on post length. */
export const MAX_LENGTH = 280;
/** Minimum meaningful post length. */
export const MIN_LENGTH = 3;

const ITEMS_KEY = "arbor-ideas-items";
const VOTES_KEY = "arbor-ideas-votes";

/** Curated seed posts live here. Quinn can backfill real greatest hits. */
export const seedItems: BoardItem[] = [];

/** Net score: upvotes minus downvotes. */
export const score = (item: BoardItem): number => item.ups - item.downs;

function isBoardItem(v: unknown): v is BoardItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    (o.category === "feedback" || o.category === "idea" || o.category === "request") &&
    typeof o.createdAt === "string" &&
    typeof o.ups === "number" &&
    typeof o.downs === "number"
  );
}

export function loadItems(): BoardItem[] {
  if (typeof window === "undefined") return [...seedItems];
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return [...seedItems];
    const parsed = JSON.parse(raw) as unknown[];
    return [...seedItems, ...parsed.filter(isBoardItem)];
  } catch {
    return [...seedItems];
  }
}

export function saveItems(items: BoardItem[]): void {
  if (typeof window === "undefined") return;
  const seedIds = new Set(seedItems.map((i) => i.id));
  const local = items.filter((i) => !seedIds.has(i.id));
  try {
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(local));
  } catch {
    // Storage full or unavailable. The in-memory board still works for the session.
  }
}

export type VoteMap = Record<string, 1 | -1>;

function isVoteMap(v: unknown): v is VoteMap {
  if (typeof v !== "object" || v === null) return false;
  return Object.values(v as Record<string, unknown>).every(
    (x) => x === 1 || x === -1,
  );
}

export function loadVotes(): VoteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return isVoteMap(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveVotes(votes: VoteMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch {
    // Storage full or unavailable. The in-memory vote still applies for the session.
  }
}

export function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}
