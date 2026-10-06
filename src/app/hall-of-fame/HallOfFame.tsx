"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VisitorMap from "./VisitorMap";
import SiteNav from "@/components/SiteNav";
import {
  AWARDS,
  PARTY_YEARS,
  fmtMiles,
  geocodeHometown,
  isDuplicate,
  looksLikeIllinois,
  milesToChicago,
  type OutOfTowner,
} from "@/data/outOfTowners";
import {
  createVisitor as createVisitorRemote,
  fetchVisitors,
  type VisitorRow,
} from "@/lib/supabase";

const ILLINOIS_REJECT =
  "Whoa there, local. Illinois doesn't count. This hall is for travelers. (We love you anyway. You just don't get a pin.)";

interface PendingEntry {
  name: string;
  year: number;
  hometown: string;
  displayName: string;
  lat: number;
  lng: number;
  miles: number;
}

type Status = "idle" | "geocoding" | "confirm";

function toVisitor(row: VisitorRow): OutOfTowner {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    hometown: row.hometown,
    resolved: row.resolved,
    lat: row.lat,
    lng: row.lng,
    miles: row.miles,
    addedAt: row.created_at,
  };
}

export default function HallOfFame() {
  const [visitors, setVisitors] = useState<OutOfTowner[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [year, setYear] = useState(2027);
  const [hometown, setHometown] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingEntry | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVisitors()
      .then((rows) => {
        if (!cancelled) {
          setVisitors(rows.map(toVisitor));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ranked = useMemo(
    () => [...visitors].sort((a, b) => b.miles - a.miles),
    [visitors],
  );
  const newest = useMemo(
    () =>
      [...visitors].sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [visitors],
  );
  const stats = useMemo(() => {
    const places = new Set(visitors.map((v) => v.resolved));
    return {
      count: visitors.length,
      miles: visitors.reduce((s, v) => s + v.miles, 0),
      places: places.size,
    };
  }, [visitors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanName = name.trim();
    const cleanTown = hometown.trim();
    if (!cleanName || !cleanTown) {
      setError("Name and hometown are both required. The wall demands it.");
      return;
    }
    if (looksLikeIllinois(cleanTown)) {
      setError(ILLINOIS_REJECT);
      return;
    }
    if (isDuplicate(visitors, cleanName, cleanTown, year)) {
      setError(
        "Already in the hall. One induction per person, per hometown, per year.",
      );
      return;
    }
    setStatus("geocoding");
    try {
      const geo = await geocodeHometown(cleanTown);
      if (!geo) {
        setError(
          `We couldn't find "${cleanTown}" on the map. Try "City, State" (or "City, Country").`,
        );
        setStatus("idle");
        return;
      }
      if (geo.isIllinois) {
        setError(ILLINOIS_REJECT);
        setStatus("idle");
        return;
      }
      setPending({
        name: cleanName,
        year,
        hometown: cleanTown,
        displayName: geo.displayName,
        lat: geo.lat,
        lng: geo.lng,
        miles: milesToChicago(geo.lat, geo.lng),
      });
      setStatus("confirm");
    } catch {
      setError("The map service hiccuped. Give it another shot.");
      setStatus("idle");
    }
  }

  async function confirmEntry() {
    if (!pending || saving) return;
    setSaving(true);
    try {
      const row = await createVisitorRemote({
        name: pending.name,
        year: pending.year,
        hometown: pending.hometown,
        resolved: pending.displayName,
        lat: pending.lat,
        lng: pending.lng,
        miles: pending.miles,
      });
      setVisitors((prev) => [toVisitor(row), ...prev]);
    } catch {
      setError(
        "The wall would not take your entry. You may already be on it for that year."
      );
      setStatus("idle");
      setSaving(false);
      return;
    }
    setPending(null);
    setName("");
    setHometown("");
    setYear(2027);
    setStatus("idle");
    setSaving(false);
  }

  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">
          <Link href="/">&larr; arborday.beer</Link>
        </p>
        <h1>Out-of-Towner Hall of Fame</h1>
        <p className="history-tagline">
          They came. They saw. They raised a glass. These legends traveled from
          beyond Illinois to celebrate trees with us, and earned their pin.
        </p>
      </header>

      <div className="hof-stats" aria-label="Hall of fame stats">
        <div className="hof-stat">
          <b>{stats.count}</b>
          <span>legends inducted</span>
        </div>
        <div className="hof-stat">
          <b>{Math.round(stats.miles).toLocaleString("en-US")}</b>
          <span>total miles traveled</span>
        </div>
        <div className="hof-stat">
          <b>{stats.places}</b>
          <span>hometowns represented</span>
        </div>
      </div>

      <section className="history-map-section" aria-label="Hometown map">
        <VisitorMap visitors={visitors} />
      </section>

      <section className="hof-section" aria-label="Furthest traveled">
        <h2>Furthest traveled</h2>
        <p className="hof-sub">The current long-haul champions.</p>
        {loading ? (
          <p className="hof-empty">Polishing the trophies&hellip;</p>
        ) : ranked.length === 0 ? (
          <p className="hof-empty">
            No champions yet. The leaderboard is wide open.
          </p>
        ) : (
          <ol className="hof-board">
            {ranked.slice(0, 5).map((v, i) => {
              const award = AWARDS[i];
              return (
                <li key={v.id} className="hof-row">
                  <span className="hof-rank">#{i + 1}</span>
                  <span className="hof-who">
                    <b>{v.name}</b>
                    <span>
                      {v.resolved} &middot; &#8217;{String(v.year).slice(2)}
                    </span>
                  </span>
                  <span className="hof-miles">{fmtMiles(v.miles)}</span>
                  {award && (
                    <span className="hof-award" title={award.title}>
                      {award.emoji} {award.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="hof-section" aria-label="Add yourself">
        <h2>Claim your spot</h2>
        <p className="hof-sub">
          Came from out of town? Add your name, the year, and your hometown.
          Illinois need not apply.
        </p>
        <form className="hof-form" onSubmit={handleSubmit}>
          <label className="hof-field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoComplete="name"
            />
          </label>
          <label className="hof-field">
            <span>Year you came</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {PARTY_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="hof-field">
            <span>Hometown</span>
            <input
              type="text"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              placeholder="City, State (or Country)"
              maxLength={80}
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="hof-btn"
            disabled={status === "geocoding"}
          >
            {status === "geocoding" ? "Finding your hometown…" : "Add me to the wall"}
          </button>
          {error && (
            <p className="hof-error" role="alert">
              {error}
            </p>
          )}
        </form>

        {status === "confirm" && pending && (
          <div className="hof-confirm" role="dialog" aria-label="Confirm your entry">
            <p>
              We found <b>{pending.displayName}</b>,{" "}
              <b>{fmtMiles(pending.miles)}</b> from Chicago. Look right?
            </p>
            <div className="hof-confirm-actions">
              <button
                type="button"
                className="hof-btn"
                onClick={confirmEntry}
                disabled={saving}
              >
                {saving ? "Adding you..." : "Yep, that&apos;s me"}
              </button>
              <button
                type="button"
                className="hof-btn hof-btn-ghost"
                onClick={() => {
                  setPending(null);
                  setStatus("idle");
                }}
              >
                Nope, try again
              </button>
            </div>
          </div>
        )}
        <p className="hof-note">
          Entries are shared with everyone. Illinois need not apply.
        </p>
      </section>

      <section className="hof-section" aria-label="All visitors">
        <h2>Every legend</h2>
        {loading ? (
          <p className="hof-empty">Polishing the trophies&hellip;</p>
        ) : newest.length === 0 ? (
          <p className="hof-empty">
            The wall is bare and the map is blank. Fix that: add yourself
            above.
          </p>
        ) : (
          <div className="hof-grid">
            {newest.map((v) => (
              <article key={v.id} className="hof-card">
                <b>{v.name}</b>
                <span className="hof-card-town">{v.resolved}</span>
                <span className="hof-card-meta">
                  &#8217;{String(v.year).slice(2)} &middot; {fmtMiles(v.miles)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="history-footer">
        <Link href="/">&larr; Back to the countdown</Link>
      </footer>
    </main>
  );
}
