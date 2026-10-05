/**
 * Ideas & Requests board: data model + helpers.
 *
 * Open board: anyone can post feedback, ideas, or requests about past,
 * present, or future Arbor Days. Posts rank by net score
 * (upvotes minus downvotes); each device gets one vote per post.
 *
 * Posts and vote counts live in Supabase (see @/lib/supabase). Each
 * device's own votes are remembered in localStorage.
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

const VOTES_KEY = "arbor-ideas-votes";

/** Net score: upvotes minus downvotes. */
export const score = (item: BoardItem): number => item.ups - item.downs;

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

