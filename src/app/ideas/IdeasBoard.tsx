"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./ideas.module.css";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  MAX_LENGTH,
  MIN_LENGTH,
  loadItems,
  loadVotes,
  makeId,
  saveItems,
  saveVotes,
  score,
  type BoardItem,
  type IdeaCategory,
  type VoteMap,
} from "@/data/ideas";

type Filter = "all" | IdeaCategory;
type Sort = "top" | "newest";

const badgeClass: Record<IdeaCategory, string> = {
  feedback: styles.badgeFeedback,
  idea: styles.badgeIdea,
  request: styles.badgeRequest,
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

export default function IdeasBoard() {
  const [items, setItems] = useState<BoardItem[]>(() => loadItems());
  const [votes, setVotes] = useState<VoteMap>(() => loadVotes());
  const [text, setText] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("idea");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("top");
  const [error, setError] = useState<string | null>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = text.trim();
    if (clean.length < MIN_LENGTH) {
      setError("Give it at least a few characters. The box has standards.");
      return;
    }
    const item: BoardItem = {
      id: makeId(),
      text: clean.slice(0, MAX_LENGTH),
      category,
      createdAt: new Date().toISOString(),
      ups: 0,
      downs: 0,
    };
    const next = [item, ...items];
    setItems(next);
    saveItems(next);
    setText("");
  }

  /** One vote per device per post. Tapping the same arrow again removes the vote; tapping the other arrow switches it. */
  function vote(dir: 1 | -1, id: string) {
    const current = votes[id];
    const nextVotes: VoteMap = { ...votes };
    const nextItems = items.map((item) => {
      if (item.id !== id) return item;
      let ups = item.ups;
      let downs = item.downs;
      if (current === dir) {
        delete nextVotes[id];
        if (dir === 1) ups -= 1;
        else downs -= 1;
      } else {
        if (current === 1) ups -= 1;
        if (current === -1) downs -= 1;
        if (dir === 1) ups += 1;
        else downs += 1;
        nextVotes[id] = dir;
      }
      return { ...item, ups: Math.max(0, ups), downs: Math.max(0, downs) };
    });
    setItems(nextItems);
    setVotes(nextVotes);
    saveItems(nextItems);
    saveVotes(nextVotes);
  }

  const emptyForFilter =
    filter === "all"
      ? "The suggestion box is empty. Suspiciously quiet."
      : `No ${CATEGORIES[filter].label.toLowerCase()} yet. Be the first. The box is right up there.`;

  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">
          <Link href="/">&larr; arborday.beer</Link>
        </p>
        <h1>Ideas &amp; Requests</h1>
        <p className="history-tagline">
          The party is a group project. Tell us what to keep, what to fix, and
          what to try, then vote the best to the top.
        </p>
      </header>

      <div className={styles.stats} aria-label="Board stats">
        <div className={styles.stat}>
          <b>{stats.posts}</b>
          <span>posts</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.totalUps.toLocaleString("en-US")}</b>
          <span>upvotes cast</span>
        </div>
        <div className={styles.stat}>
          <b>{stats.leading}</b>
          <span>leading category</span>
        </div>
      </div>

      <section className={styles.section} aria-label="Submit an idea">
        <h2>Drop it in the box</h2>
        <p className={styles.sub}>
          One box. Three flavors. Keep it short, keep it fun.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.seg} role="radiogroup" aria-label="Category">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                title={CATEGORIES[c].tagline}
                className={`${styles.segBtn} ${category === c ? styles.segBtnActive : ""}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORIES[c].label}
              </button>
            ))}
          </div>
          <label className={styles.field}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="e.g. Bring back the seed packets. The 2024 ones actually sprouted."
              aria-label="Your feedback, idea, or request"
            />
            <span className={styles.count}>
              {text.length}/{MAX_LENGTH}
            </span>
          </label>
          <button type="submit" className={styles.submit}>
            Post it
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <section className={styles.section} aria-label="The board">
        <h2>The board</h2>
        <p className={styles.sub}>
          Ranked by the people. Democracy, but for a bar party.
        </p>
        <div className={styles.controls}>
          <div className={styles.tabs} role="tablist" aria-label="Filter by category">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={`${styles.tab} ${filter === "all" ? styles.tabActive : ""}`}
              onClick={() => setFilter("all")}
            >
              All
              <span className={styles.countBadge}>{items.length}</span>
            </button>
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={filter === c}
                className={`${styles.tab} ${filter === c ? styles.tabActive : ""}`}
                onClick={() => setFilter(c)}
              >
                {CATEGORIES[c].label}
                <span className={styles.countBadge}>{counts[c]}</span>
              </button>
            ))}
          </div>
          <div className={styles.sort} role="group" aria-label="Sort order">
            <button
              type="button"
              aria-pressed={sort === "top"}
              className={`${styles.sortBtn} ${sort === "top" ? styles.sortBtnActive : ""}`}
              onClick={() => setSort("top")}
            >
              Top
            </button>
            <button
              type="button"
              aria-pressed={sort === "newest"}
              className={`${styles.sortBtn} ${sort === "newest" ? styles.sortBtnActive : ""}`}
              onClick={() => setSort("newest")}
            >
              Newest
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>{emptyForFilter}</p>
        ) : (
          <ol className={styles.board}>
            {visible.map((item) => {
              const myVote = votes[item.id];
              return (
                <li key={item.id} className={styles.card}>
                  <div className={styles.voteCol}>
                    <button
                      type="button"
                      aria-label={`Upvote: ${item.text.slice(0, 60)}`}
                      aria-pressed={myVote === 1}
                      className={`${styles.voteBtn} ${myVote === 1 ? styles.voteBtnActive : ""}`}
                      onClick={() => vote(1, item.id)}
                    >
                      ▲
                    </button>
                    <span className={styles.score} aria-label={`Score ${score(item)}`}>
                      {score(item)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Downvote: ${item.text.slice(0, 60)}`}
                      aria-pressed={myVote === -1}
                      className={`${styles.voteBtn} ${myVote === -1 ? styles.voteBtnActive : ""}`}
                      onClick={() => vote(-1, item.id)}
                    >
                      ▼
                    </button>
                  </div>
                  <div className={styles.body}>
                    <span className={`${styles.badge} ${badgeClass[item.category]}`}>
                      {CATEGORIES[item.category].label}
                    </span>
                    <p>{item.text}</p>
                    <span className={styles.meta}>
                      {item.ups} up · {item.downs} down · {formatDate(item.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className={styles.note}>Votes are saved on this device for now.</p>
      </section>

      <footer className="history-footer">
        <Link href="/">&larr; Back to the countdown</Link>
      </footer>
    </main>
  );
}
