"use client";

import { useEffect, useMemo, useState } from "react";
import VisitorMap from "./VisitorMap";
import {
  Button,
  EmptyNote,
  ErrorNote,
  Field,
  FootNote,
  PageShell,
  Section,
  Stat,
  formPanel,
  inputClass,
} from "@/components/ui";
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
    <PageShell
      title="Out-of-Towner Hall of Fame"
      tagline={
        <>
          They came. They saw. They raised a glass. These legends traveled from
          beyond Illinois to celebrate trees with us, and earned their pin.
        </>
      }
    >
      <div className="mb-6 flex w-full flex-wrap justify-center gap-2.75" aria-label="Hall of fame stats">
        <Stat value={stats.count} label="legends inducted" />
        <Stat value={Math.round(stats.miles).toLocaleString("en-US")} label="total miles traveled" />
        <Stat value={stats.places} label="hometowns represented" />
      </div>

      <section className="mb-4 w-full" aria-label="Hometown map">
        <VisitorMap visitors={visitors} />
      </section>

      <Section label="Furthest traveled" title="Furthest traveled" sub="The current long-haul champions.">
        {loading ? (
          <EmptyNote>Polishing the trophies&hellip;</EmptyNote>
        ) : ranked.length === 0 ? (
          <EmptyNote>No champions yet. The leaderboard is wide open.</EmptyNote>
        ) : (
          <ol className="flex w-full flex-col gap-2.5">
            {ranked.slice(0, 5).map((v, i) => {
              const award = AWARDS[i];
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-xl bg-cream px-4 py-3.25 text-forest shadow-row"
                >
                  <span className="min-w-9 text-xl font-black text-amber-dark">#{i + 1}</span>
                  <span className="flex min-w-0 flex-1 basis-40 flex-col">
                    <b className="text-base">{v.name}</b>
                    <span className="truncate text-sm opacity-65">
                      {v.resolved} &middot; &#8217;{String(v.year).slice(2)}
                    </span>
                  </span>
                  <span className="font-black whitespace-nowrap tabular-nums">{fmtMiles(v.miles)}</span>
                  {award && (
                    <span
                      className="rounded-full bg-forest px-2.75 py-1.25 text-xs font-bold whitespace-nowrap text-amber max-sm:ml-12.5"
                      title={award.title}
                    >
                      {award.emoji} {award.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Section>

      <Section
        label="Add yourself"
        title="Claim your spot"
        sub="Came from out of town? Add your name, the year, and your hometown. Illinois need not apply."
      >
        <form className={`${formPanel} max-w-104`} onSubmit={handleSubmit}>
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoComplete="name"
              className={inputClass}
            />
          </Field>
          <Field label="Year you came">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            >
              {PARTY_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hometown">
            <input
              type="text"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              placeholder="City, State (or Country)"
              maxLength={80}
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <Button type="submit" disabled={status === "geocoding"}>
            {status === "geocoding" ? "Finding your hometown…" : "Add me to the wall"}
          </Button>
          {error && <ErrorNote>{error}</ErrorNote>}
        </form>

        {status === "confirm" && pending && (
          <div
            className="mt-4 w-full max-w-104 rounded-2xl bg-cream px-5 py-4.5 text-center text-forest"
            role="dialog"
            aria-label="Confirm your entry"
          >
            <p className="mb-3.5">
              We found <b>{pending.displayName}</b>,{" "}
              <b>{fmtMiles(pending.miles)}</b> from Chicago. Look right?
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button type="button" onClick={confirmEntry} disabled={saving}>
                {saving ? "Adding you..." : "Yep, that's me"}
              </Button>
              <Button
                type="button"
                variant="ghostOnCream"
                onClick={() => {
                  setPending(null);
                  setStatus("idle");
                }}
              >
                Nope, try again
              </Button>
            </div>
          </div>
        )}
        <FootNote className="mt-3.5 max-w-104">
          Entries are shared with everyone. Illinois need not apply.
        </FootNote>
      </Section>

      <Section label="All visitors" title="Every legend">
        {loading ? (
          <EmptyNote>Polishing the trophies&hellip;</EmptyNote>
        ) : newest.length === 0 ? (
          <EmptyNote>
            The wall is bare and the map is blank. Fix that: add yourself
            above.
          </EmptyNote>
        ) : (
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2.75">
            {newest.map((v) => (
              <article
                key={v.id}
                className="flex flex-col gap-0.5 rounded-xl border border-cream/16 bg-cream/7 px-4 py-3.5"
              >
                <b className="text-base text-cream">{v.name}</b>
                <span className="text-sm font-bold text-leaf">{v.resolved}</span>
                <span className="text-xs tabular-nums opacity-60">
                  &#8217;{String(v.year).slice(2)} &middot; {fmtMiles(v.miles)}
                </span>
              </article>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
