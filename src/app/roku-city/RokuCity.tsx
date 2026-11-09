"use client";

import { useState } from "react";
import Link from "next/link";

type TimeOfDay = "day" | "dusk" | "night";

interface Spot {
  id: string;
  name: string;
  kind: "Landmark" | "Past venue" | "Future venue";
  note: string;
  detail: string;
  href?: string;
}

const SPOTS: Spot[] = [
  {
    id: "willis",
    name: "Willis Tower",
    kind: "Landmark",
    note: "The tall one with the antennas.",
    detail:
      "Still Sears Tower to everyone who grew up here. The antennas are the tell. On a clear night you can see it from every bar on the shortlist.",
  },
  {
    id: "hancock",
    name: "John Hancock Center",
    kind: "Landmark",
    note: "The tapered tower with the X braces.",
    detail:
      "The X bracing on the sides is the giveaway. It sits at the north end of Michigan Avenue, watching over the lakefront.",
  },
  {
    id: "marina",
    name: "Marina City",
    kind: "Landmark",
    note: "The corncob towers on the river.",
    detail:
      "Two round towers that look like corncobs, parked right on the Chicago River. If you know, you know.",
  },
  {
    id: "bean",
    name: "Cloud Gate, the Bean",
    kind: "Landmark",
    note: "The shiny bean in Millennium Park.",
    detail:
      "Millennium Park, downtown. Everyone takes the same photo under it. The Bean reflects the whole skyline back at you.",
  },
  {
    id: "ferris",
    name: "Navy Pier Ferris Wheel",
    kind: "Landmark",
    note: "The wheel that never stops turning.",
    detail:
      "Out on Navy Pier, over the lake. It turns all night in this scene, just like the real one on a summer Friday.",
  },
  {
    id: "wrigley",
    name: "Wrigley Field",
    kind: "Landmark",
    note: "The Friendly Confines, up Clark from Sluggers.",
    detail:
      "Home of the Cubs, in Wrigleyville. Sluggers, our 2024 venue, is right down Clark Street from the ballpark.",
  },
  {
    id: "theatre",
    name: "Chicago Theatre",
    kind: "Landmark",
    note: "The vertical CHICAGO sign on State Street.",
    detail:
      "The marquee on State Street in the Loop. If the sign is lit, something good is happening downtown.",
  },
  {
    id: "fountain",
    name: "Buckingham Fountain",
    kind: "Landmark",
    note: "The big fountain in Grant Park.",
    detail:
      "Grant Park, facing the lake. One of the largest fountains in the world, and the postcard shot of downtown.",
  },
  {
    id: "river",
    name: "Chicago River",
    kind: "Landmark",
    note: "The river that runs through downtown.",
    detail:
      "The riverwalk, the bridges, the tour boats. Watch the little boat cross the scene. It never docks, it just keeps going.",
  },
  {
    id: "ltrain",
    name: "The L",
    kind: "Landmark",
    note: "The elevated train, rattling past the skyline.",
    detail:
      "The Brown and Purple lines run right through Lincoln Park and Wrigleyville. If you hear it, you are close to a bar.",
  },
  {
    id: "kincades",
    name: "Kincade's",
    kind: "Past venue",
    note: "2023, Lincoln Park, 950 W Armitage Ave.",
    detail:
      "Where it all started. The 2023 party at Kincade's in Lincoln Park. First stop on the Arbor Trail, and the first story everyone still tells.",
    href: "/history",
  },
  {
    id: "sluggers",
    name: "Sluggers",
    kind: "Past venue",
    note: "2024, Wrigleyville, 3540 N Clark St.",
    detail:
      "The 2024 party, with the batting cages and the back bar. A short walk from Wrigley Field, and it smells like 2024 in the best way.",
    href: "/history",
  },
  {
    id: "easybar",
    name: "Easy Bar",
    kind: "Past venue",
    note: "2025, Wicker Park, 1944 W Chicago Ave.",
    detail:
      "The 2025 party, with the live band. Easy Bar proved the party could leave Lincoln Park and still feel like Arbor Day.",
    href: "/history",
  },
  {
    id: "fieldhouse",
    name: "Field House",
    kind: "Past venue",
    note: "2026, Lincoln Park, 2455 N Clark St.",
    detail:
      "The 2026 party, the full buyout. The bartender still remembers. Peak civilization, according to the trail.",
    href: "/history",
  },
  {
    id: "tba",
    name: "The 2027 Venue",
    kind: "Future venue",
    note: "2027, to be announced. The lights are not on yet.",
    detail:
      "Friday, April 30, 2027, 9pm to midnight. The venue is still to be announced, so this storefront stays dark until the hosts flip the switch.",
  },
];

const VENUES = SPOTS.filter((s) => s.kind !== "Landmark");

const SKIES: Record<TimeOfDay, string> = {
  day: "linear-gradient(to bottom, #7ec8e3 0%, #bfe8f2 45%, #fde9b8 100%)",
  dusk: "linear-gradient(to bottom, #2b2350 0%, #7b3f6e 45%, #f28c4a 78%, #f2b632 100%)",
  night: "linear-gradient(to bottom, #0b1226 0%, #16244d 55%, #1d3a5f 100%)",
};

const SKY_LABEL: Record<TimeOfDay, string> = {
  day: "Day",
  dusk: "Dusk, party time",
  night: "Night",
};

export default function RokuCity() {
  const [time, setTime] = useState<TimeOfDay>("dusk");
  const [paused, setPaused] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("willis");
  const selected = SPOTS.find((s) => s.id === selectedId) ?? SPOTS[0];
  const motion = paused ? "[animation-play-state:paused]" : "";

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-cream/16 shadow-card"
        style={{ background: SKIES[time] }}
      >
        <div className="relative flex min-h-[26rem] flex-col justify-end sm:min-h-[30rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <div className="rounded-xl bg-forest/70 px-4 py-3 text-left backdrop-blur">
              <p className="text-xs font-black tracking-[.25em] text-amber uppercase">
                Roku City, Chicago
              </p>
              <p className="mt-0.5 text-lg leading-tight font-black text-cream">
                Arbor Day, after dark
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="min-h-11 rounded-full bg-cream px-4 text-sm font-black text-forest"
              >
                {paused ? "Play motion" : "Pause motion"}
              </button>
              <p className="rounded-full bg-forest/70 px-3 py-1 text-xs font-bold text-cream backdrop-blur">
                {SKY_LABEL[time]}
              </p>
            </div>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              className={`absolute top-8 left-0 h-8 w-24 rounded-full bg-white/70 blur-[2px] motion-safe:animate-drift ${motion}`}
            />
            <span
              className={`absolute top-20 left-0 h-6 w-16 rounded-full bg-white/50 blur-[2px] motion-safe:animate-drift ${motion}`}
              style={{ animationDelay: "-30s", animationDuration: "90s" }}
            />
            <span
              className={`absolute top-14 left-0 h-5 w-20 rounded-full bg-white/40 blur-[2px] motion-safe:animate-drift ${motion}`}
              style={{ animationDelay: "-55s", animationDuration: "80s" }}
            />
            {time !== "day" && (
              <>
                <span className="absolute top-10 right-10 size-10 rounded-full bg-amber shadow-[0_0_40px_10px_rgba(242,182,50,0.5)]" />
                <span className={`absolute top-24 left-[12%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`} />
                <span
                  className={`absolute top-16 left-[38%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`}
                  style={{ animationDelay: "-1s" }}
                />
                <span
                  className={`absolute top-28 left-[62%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`}
                  style={{ animationDelay: "-2s" }}
                />
                <span
                  className={`absolute top-12 left-[82%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`}
                  style={{ animationDelay: "-0.5s" }}
                />
              </>
            )}
            {time === "day" && (
              <span className="absolute top-8 right-8 size-12 rounded-full bg-amber shadow-[0_0_50px_14px_rgba(242,182,50,0.6)]" />
            )}
          </div>

          <svg
            viewBox="0 0 1200 420"
            className="relative mt-24 w-full"
            role="group"
            aria-label="Animated Chicago skyline, Roku City style, with the Willis Tower, the Hancock Center, Marina City, the Bean, the Navy Pier Ferris Wheel, and the past Arbor Day venues as lit storefronts. Tap a building to learn about it."
          >
            <g>
              <rect x="40" y="220" width="70" height="200" fill="#1d3a5f" opacity="0.85" />
              <rect x="130" y="180" width="60" height="240" fill="#24486e" opacity="0.85" />
              <polygon points="230,420 230,150 260,120 290,150 290,420" fill="#1d3a5f" opacity="0.9" />
              <rect x="320" y="240" width="80" height="180" fill="#24486e" opacity="0.85" />
              <rect x="430" y="200" width="65" height="220" fill="#1d3a5f" opacity="0.85" />
              <rect x="520" y="260" width="90" height="160" fill="#24486e" opacity="0.85" />
              <rect x="640" y="210" width="70" height="210" fill="#1d3a5f" opacity="0.85" />
              <rect x="730" y="170" width="60" height="250" fill="#24486e" opacity="0.85" />
              <rect x="820" y="230" width="85" height="190" fill="#1d3a5f" opacity="0.85" />
              <rect x="930" y="190" width="65" height="230" fill="#24486e" opacity="0.85" />
              <rect x="1020" y="250" width="80" height="170" fill="#1d3a5f" opacity="0.85" />
              <rect x="1120" y="210" width="60" height="210" fill="#24486e" opacity="0.85" />
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Willis Tower"
              onClick={() => setSelectedId("willis")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("willis"); else if (e.key === " ") { e.preventDefault(); setSelectedId("willis"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <rect x="205" y="60" width="16" height="60" fill="#0e2317" />
              <rect x="228" y="40" width="16" height="80" fill="#0e2317" />
              <rect x="190" y="120" width="90" height="300" fill="#0e2317" />
              <rect x="190" y="120" width="30" height="300" fill="#14301f" />
              <rect x="250" y="120" width="30" height="300" fill="#14301f" />
              {time !== "day" && (
                <g fill="#f2b632">
                  <rect x="200" y="140" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} />
                  <rect x="230" y="170" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-1s" }} />
                  <rect x="260" y="200" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-2s" }} />
                  <rect x="210" y="240" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-0.5s" }} />
                </g>
              )}
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="John Hancock Center"
              onClick={() => setSelectedId("hancock")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("hancock"); else if (e.key === " ") { e.preventDefault(); setSelectedId("hancock"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <polygon points="360,420 380,140 430,140 450,420" fill="#14301f" />
              <line x1="380" y1="140" x2="450" y2="420" stroke="#8fcf6a" strokeWidth="3" />
              <line x1="430" y1="140" x2="360" y2="420" stroke="#8fcf6a" strokeWidth="3" />
              <line x1="370" y1="280" x2="440" y2="280" stroke="#8fcf6a" strokeWidth="2" />
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Marina City"
              onClick={() => setSelectedId("marina")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("marina"); else if (e.key === " ") { e.preventDefault(); setSelectedId("marina"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <rect x="560" y="180" width="52" height="240" rx="26" fill="#14301f" />
              <rect x="624" y="200" width="52" height="220" rx="26" fill="#0e2317" />
              {[200, 230, 260, 290, 320, 350].map((y) => (
                <line key={y} x1="562" y1={y} x2="610" y2={y} stroke="#f6f0dc" strokeWidth="2" opacity="0.5" />
              ))}
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Chicago Theatre"
              onClick={() => setSelectedId("theatre")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("theatre"); else if (e.key === " ") { e.preventDefault(); setSelectedId("theatre"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <rect x="700" y="260" width="70" height="160" fill="#0e2317" />
              <rect x="728" y="180" width="14" height="90" fill="#a8741a" />
              <text x="735" y="200" fill="#f2b632" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(90 735 200)">
                CHICAGO
              </text>
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Navy Pier Ferris Wheel"
              onClick={() => setSelectedId("ferris")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("ferris"); else if (e.key === " ") { e.preventDefault(); setSelectedId("ferris"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <g
                className={`motion-safe:animate-spin-slow ${motion}`}
                style={{ transformOrigin: "1010px 300px" }}
              >
                <circle cx="1010" cy="300" r="70" fill="none" stroke="#f6f0dc" strokeWidth="4" />
                <circle cx="1010" cy="300" r="8" fill="#f2b632" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                  const rad = (a * Math.PI) / 180;
                  return (
                    <line
                      key={a}
                      x1="1010"
                      y1="300"
                      x2={1010 + 70 * Math.cos(rad)}
                      y2={300 + 70 * Math.sin(rad)}
                      stroke="#f6f0dc"
                      strokeWidth="2"
                    />
                  );
                })}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                  const rad = (a * Math.PI) / 180;
                  return (
                    <circle
                      key={a}
                      cx={1010 + 70 * Math.cos(rad)}
                      cy={300 + 70 * Math.sin(rad)}
                      r="6"
                      fill="#f2b632"
                    />
                  );
                })}
              </g>
              <line x1="980" y1="420" x2="1010" y2="370" stroke="#0e2317" strokeWidth="6" />
              <line x1="1040" y1="420" x2="1010" y2="370" stroke="#0e2317" strokeWidth="6" />
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Cloud Gate, the Bean"
              onClick={() => setSelectedId("bean")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("bean"); else if (e.key === " ") { e.preventDefault(); setSelectedId("bean"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <ellipse cx="880" cy="390" rx="55" ry="28" fill="#cfe3ee" stroke="#f6f0dc" strokeWidth="2" />
              <ellipse cx="865" cy="382" rx="18" ry="8" fill="#ffffff" opacity="0.8" />
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Buckingham Fountain"
              onClick={() => setSelectedId("fountain")}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedId("fountain"); else if (e.key === " ") { e.preventDefault(); setSelectedId("fountain"); }
              }}
              className="cursor-pointer focus-visible:outline-3 focus-visible:outline-amber"
            >
              <ellipse cx="120" cy="400" rx="48" ry="12" fill="#7ec8e3" />
              <path d="M100 400 Q120 360 140 400" fill="none" stroke="#bfe8f2" strokeWidth="3" />
              <path d="M112 400 Q120 372 128 400" fill="none" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[58%] left-0 z-10 w-full"
          >
            <div className={`motion-safe:animate-train ${motion}`}>
              <div className="flex w-56 gap-1">
                {["#8fcf6a", "#f2b632", "#ff785a", "#8fcf6a"].map((c, i) => (
                  <div key={i} className="h-8 w-14 rounded-md border-2 border-forest" style={{ background: c }}>
                    <div className="mx-1 mt-1 flex gap-1">
                      <span className="h-2 w-3 rounded-sm bg-cream" />
                      <span className="h-2 w-3 rounded-sm bg-cream" />
                      <span className="h-2 w-3 rounded-sm bg-cream" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1 h-1 w-full bg-forest/80" />
          </div>

          <div className="relative z-20 border-t-4 border-forest bg-forest-deep/95 px-3 pt-3 pb-4">
            <p className="mb-2 text-center text-xs font-black tracking-[.25em] text-amber uppercase">
              Past venues, lit up for the night
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {VENUES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  aria-pressed={selectedId === v.id}
                  className={`min-h-16 rounded-xl border px-3 py-2.5 text-left ${
                    selectedId === v.id
                      ? "border-amber bg-amber text-forest"
                      : "border-cream/25 bg-cream/10 text-cream"
                  }`}
                >
                  <span className="block text-sm leading-tight font-black">{v.name}</span>
                  <span className="mt-0.5 block text-xs leading-tight opacity-80">{v.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="pointer-events-none relative z-20 h-10 overflow-hidden bg-[#1d4e6b]">
            <div className={`motion-safe:animate-boat ${motion}`}>
              <div className="flex h-10 w-32 items-end gap-1">
                <span className="block h-4 w-28 rounded-t-lg bg-cream" />
                <span className="block h-7 w-2 bg-forest" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-1 h-px bg-white/30" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Time of day">
        {(["day", "dusk", "night"] as TimeOfDay[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTime(t)}
            aria-pressed={time === t}
            className={`min-h-11 rounded-full border px-4 text-sm font-black ${
              time === t ? "border-amber bg-amber text-forest" : "border-cream/30 bg-transparent text-cream"
            }`}
          >
            {SKY_LABEL[t]}
          </button>
        ))}
      </div>

      <article className="w-full rounded-2xl border border-cream/16 bg-cream/6 p-5 text-left">
        <p className="text-xs font-black tracking-[.25em] text-amber uppercase">{selected.kind}</p>
        <h2 className="mt-1 text-2xl font-black text-cream">{selected.name}</h2>
        <p className="mt-1 text-base font-bold opacity-80">{selected.note}</p>
        <p className="mt-2 text-base leading-relaxed opacity-90">{selected.detail}</p>
        {selected.href && (
          <p className="mt-3">
            <Link href={selected.href} className="font-bold text-leaf underline underline-offset-2 hover:text-amber">
              See it on Past Parties
            </Link>
          </p>
        )}
      </article>

      <section aria-label="Spot them all" className="w-full">
        <h2 className="text-center text-2xl font-black text-cream">Spot them all</h2>
        <p className="mt-1 text-center text-base opacity-75">
          Tap a building, a storefront, or a name below. Ten landmarks, five venues, one city.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SPOTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              aria-pressed={selectedId === s.id}
              className={`min-h-11 rounded-xl border px-4 py-3 text-left ${
                selectedId === s.id ? "border-amber bg-amber/20 text-cream" : "border-cream/16 bg-cream/6 text-cream"
              }`}
            >
              <span className="block text-base font-black">{s.name}</span>
              <span className="block text-sm opacity-70">
                {s.kind} · {s.note}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Use it at the party" className="w-full rounded-2xl border border-cream/16 bg-cream/6 p-5">
        <h2 className="text-xl font-black text-cream">Use it at the party</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-base leading-relaxed">
          <li>Project it on the venue TV, or leave it running on a laptop at the bar.</li>
          <li>Set it to dusk at 9pm, then night as the party goes on.</li>
          <li>Pause the motion if anyone finds it distracting, the skyline still looks good frozen.</li>
          <li>Tap a storefront to tell the story of that year, then tap the next one.</li>
        </ul>
        <p className="mt-3 text-base">
          <Link href="/arbor-trail" className="font-bold text-leaf underline underline-offset-2 hover:text-amber">
            Play the Arbor Trail
          </Link>
          {" · "}
          <Link href="/history" className="font-bold text-leaf underline underline-offset-2 hover:text-amber">
            Past Parties
          </Link>
        </p>
      </section>
    </div>
  );
}
