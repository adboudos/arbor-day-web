"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  EmptyNote,
  ErrorNote,
  FootNote,
  PageShell,
  Section,
  Stat,
  formPanel,
  inputClass,
} from "@/components/ui";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  MAX_LENGTH,
  MIN_LENGTH,
  loadVotes,
  saveVotes,
  score,
  type BoardItem,
  type IdeaCategory,
  type VoteMap,
} from "@/data/ideas";
import {
  castVote as castVoteRemote,
  createIdea as createIdeaRemote,
  fetchIdeas,
  type IdeaRow,
} from "@/lib/supabase";

type Filter = "all" | IdeaCategory;
type Sort = "top" | "newest";

const badgeClass: Record<IdeaCategory, string> = {
  feedback: "bg-leaf text-forest",
  idea: "bg-amber text-forest",
  request: "bg-clay text-[#fdf6ec]",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toBoardItem(row: IdeaRow): BoardItem {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    createdAt: row.created_at,
    ups: row.ups,
    downs: row.downs,
  };
}

export default function IdeasBoard() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [votes, setVotes] = useState<VoteMap>(() => loadVotes());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("idea");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("top");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchIdeas()
      .then((rows) => {
        if (!cancelled) {
          setItems(rows.map(toBoardItem));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("The board would not load. Check your connection and refresh.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<IdeaCategory, number> = {
      feedback: 0,
      idea: 0,
      request: 0,
    };
    for (const item of items) c[item.category] += 1;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const filtered =
      filter === "all" ? items : items.filter((i) => i.category === filter);
    const sorted = [...filtered];
    if (sort === "top") {
      sorted.sort((a, b) => score(b) - score(a) || b.createdAt.localeCompare(a.createdAt));
    } else {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [items, filter, sort]);

  const stats = useMemo(() => {
    const totalUps = items.reduce((s, i) => s + i.ups, 0);
    let leading: string = "-";
    if (items.length > 0) {
      const top = CATEGORY_ORDER.reduce((a, b) =>
        counts[a] >= counts[b] ? a : b,
      );
      leading = CATEGORIES[top].label;
    }
    return { posts: items.length, totalUps, leading };
  }, [items, counts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = text.trim();
    if (clean.length < MIN_LENGTH) {
      setError("Give it at least a few characters. The box has standards.");
      return;
    }
    try {
      const row = await createIdeaRemote(clean.slice(0, MAX_LENGTH), category);
      setItems((prev) => [toBoardItem(row), ...prev]);
      setText("");
    } catch {
      setError("The box jammed. Give it another shot.");
    }
  }

  /** One vote per device per post. Tapping the same arrow again removes the vote; tapping the other arrow switches it. */
  async function vote(dir: 1 | -1, id: string) {
    const current = votes[id];
    let upDelta = 0;
    let downDelta = 0;
    if (current === dir) {
      if (dir === 1) upDelta = -1;
      else downDelta = -1;
    } else {
      if (current === 1) upDelta -= 1;
      if (current === -1) downDelta -= 1;
      if (dir === 1) upDelta += 1;
      else downDelta += 1;
    }
    const nextVotes: VoteMap = { ...votes };
    if (current === dir) delete nextVotes[id];
    else nextVotes[id] = dir;
    // Optimistic UI; the RPC adjusts the shared counts atomically.
    setVotes(nextVotes);
    saveVotes(nextVotes);
    setItems((prev) =>
      prev.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              ups: Math.max(0, item.ups + upDelta),
              downs: Math.max(0, item.downs + downDelta),
            },
      ),
    );
    try {
      await castVoteRemote(id, upDelta, downDelta);
    } catch {
      // Roll back the optimistic update on failure.
      setVotes(votes);
      saveVotes(votes);
      setItems((prev) =>
        prev.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                ups: Math.max(0, item.ups - upDelta),
                downs: Math.max(0, item.downs - downDelta),
              },
        ),
      );
    }
  }

  function voteButton(item: BoardItem, dir: 1 | -1) {
    const active = votes[item.id] === dir;
    return (
      <button
        type="button"
        aria-label={`${dir === 1 ? "Upvote" : "Downvote"}: ${item.text.slice(0, 60)}`}
        aria-pressed={active}
        className={`flex h-7 w-9 cursor-pointer items-center justify-center rounded-full border text-xs leading-none text-forest ${
          active ? "border-amber bg-amber font-black" : "border-forest/20 bg-forest/8"
        }`}
        onClick={() => vote(dir, item.id)}
      >
        {dir === 1 ? "▲" : "▼"}
      </button>
    );
  }

  const emptyForFilter =
    filter === "all"
      ? "The suggestion box is empty. Suspiciously quiet."
      : `No ${CATEGORIES[filter].label.toLowerCase()} yet. Be the first. The box is right up there.`;

  return (
    <PageShell
      title="Ideas & Requests"
      tagline="The party is a group project. Tell us what to keep, what to fix, and what to try, then vote the best to the top."
    >
      <div className="mb-2 flex w-full flex-wrap justify-center gap-2.75" aria-label="Board stats">
        <Stat value={stats.posts} label="posts" />
        <Stat value={stats.totalUps.toLocaleString("en-US")} label="upvotes cast" />
        <Stat value={stats.leading} label="leading category" />
      </div>

      <Section
        label="Submit an idea"
        title="Drop it in the box"
        sub="One box. Three flavors. Keep it short, keep it fun."
      >
        <form className={`${formPanel} max-w-120`} onSubmit={handleSubmit}>
          <div className="flex gap-2" role="radiogroup" aria-label="Category">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                title={CATEGORIES[c].tagline}
                className={`flex-1 cursor-pointer rounded-full border px-2 py-2.25 text-sm font-bold ${
                  category === c ? "border-amber bg-amber text-forest" : "border-cream/30 bg-forest/60 text-cream"
                }`}
                onClick={() => setCategory(c)}
              >
                {CATEGORIES[c].label}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1.25">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="e.g. Bring back the seed packets. The 2024 ones actually sprouted."
              aria-label="Your feedback, idea, or request"
              className={`${inputClass} min-h-18 resize-y`}
            />
            <span className="self-end text-xs tabular-nums opacity-55">
              {text.length}/{MAX_LENGTH}
            </span>
          </label>
          <Button type="submit">Post it</Button>
          {error && <ErrorNote>{error}</ErrorNote>}
        </form>
      </Section>

      <Section
        label="The board"
        title="The board"
        sub="Ranked by the people. Democracy, but for a bar party."
      >
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3.25">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {(["all", ...CATEGORY_ORDER] as Filter[]).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.75 text-sm font-bold ${
                    active ? "border-cream bg-cream text-forest" : "border-cream/22 bg-cream/7 text-cream"
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : CATEGORIES[f].label}
                  <span
                    className={`rounded-full px-2 py-px text-xs tabular-nums ${
                      active ? "bg-forest/12" : "bg-forest/25"
                    }`}
                  >
                    {f === "all" ? items.length : counts[f]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2" role="group" aria-label="Sort order">
            {(
              [
                ["top", "Top"],
                ["newest", "Newest"],
              ] as [Sort, string][]
            ).map(([s, label]) => (
              <button
                key={s}
                type="button"
                aria-pressed={sort === s}
                className={`cursor-pointer rounded-full border px-3.5 py-1.75 text-sm font-bold ${
                  sort === s ? "border-amber bg-amber text-forest" : "border-cream/30 bg-transparent text-cream"
                }`}
                onClick={() => setSort(s)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <EmptyNote className="my-6">Shaking the box awake&hellip;</EmptyNote>
        ) : loadError ? (
          <EmptyNote className="my-6" role="alert">{loadError}</EmptyNote>
        ) : visible.length === 0 ? (
          <EmptyNote className="my-6">{emptyForFilter}</EmptyNote>
        ) : (
          <ol className="flex w-full flex-col gap-2.5">
            {visible.map((item) => {
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-xl bg-cream px-4 py-3.5 text-forest shadow-row"
                >
                  <div className="flex min-w-10.5 flex-col items-center gap-0.5">
                    {voteButton(item, 1)}
                    <span className="text-base font-black tabular-nums" aria-label={`Score ${score(item)}`}>
                      {score(item)}
                    </span>
                    {voteButton(item, -1)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.25">
                    <span
                      className={`self-start rounded-full px-2.5 py-0.75 text-xs font-black tracking-[.12em] uppercase ${badgeClass[item.category]}`}
                    >
                      {CATEGORIES[item.category].label}
                    </span>
                    <p className="text-base leading-[1.45] wrap-anywhere">{item.text}</p>
                    <span className="text-xs tabular-nums opacity-60">
                      {item.ups} up · {item.downs} down · {formatDate(item.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <FootNote className="mt-5">
          Posts and votes are shared with everyone. Your own votes are remembered on this device.
        </FootNote>
      </Section>
    </PageShell>
  );
}
