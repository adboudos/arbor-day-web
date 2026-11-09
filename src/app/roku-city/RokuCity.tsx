"use client";

import { useState } from "react";
import Link from "next/link";

type TimeOfDay = "day" | "dusk" | "night";
type Speed = "slow" | "normal" | "fast";

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
      "Still Sears Tower to everyone who grew up here. The antennas blink at night, and on a clear night you can see it from every bar on the shortlist.",
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
    id: "aon",
    name: "Aon Center",
    kind: "Landmark",
    note: "The tall white slab downtown.",
    detail:
      "The third tallest tower in the city, a clean white rectangle in the middle of the Loop skyline.",
  },
  {
    id: "watertower",
    name: "Chicago Water Tower",
    kind: "Landmark",
    note: "The little stone castle on Michigan Avenue.",
    detail:
      "Built in 1869, it survived the Great Chicago Fire. The smallest landmark in the skyline, and the oldest.",
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
      "The riverwalk, the bridges, and the tour boats. Watch the little boat cross the scene. It never docks, it just keeps going.",
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

const SPEED_SECONDS: Record<Speed, number> = {
  slow: 180,
  normal: 120,
  fast: 60,
};

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="17"
      fontWeight="800"
      fill="#f6f0dc"
      stroke="#0e2317"
      strokeWidth="4"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

function SkylinePanel({
  labelsOn,
  time,
  motion,
  selectedId,
  onSelect,
}: {
  labelsOn: boolean;
  time: TimeOfDay;
  motion: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const lit = time !== "day";
  const groupProps = (id: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": SPOTS.find((s) => s.id === id)?.name ?? id,
    "aria-pressed": selectedId === id,
    onClick: () => onSelect(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter") onSelect(id);
      else if (e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
    className: "cursor-pointer focus-visible:outline-3 focus-visible:outline-amber",
  });

  return (
    <svg
      viewBox="0 0 1400 520"
      className="h-full w-[1400px] shrink-0"
      preserveAspectRatio="xMidYMax slice"
      role="group"
      aria-label="Animated Chicago skyline, Roku City style. Tap a building to learn about it."
    >
      <g opacity="0.55" fill="#1d3a5f">
        <rect x="0" y="300" width="80" height="220" />
        <rect x="100" y="260" width="70" height="260" />
        <rect x="480" y="280" width="90" height="240" />
        <rect x="700" y="250" width="70" height="270" />
        <rect x="900" y="290" width="90" height="230" />
        <rect x="1250" y="270" width="80" height="250" />
      </g>

      <g {...groupProps("watertower")}>
        <rect x="30" y="360" width="56" height="160" fill="#8a7a5a" />
        <polygon points="30,360 58,320 86,360" fill="#6b5d45" />
        <rect x="26" y="330" width="10" height="50" fill="#8a7a5a" />
        <rect x="80" y="330" width="10" height="50" fill="#8a7a5a" />
        {labelsOn && <Label x={58} y={305}>Water Tower</Label>}
      </g>

      <g {...groupProps("aon")}>
        <rect x="130" y="180" width="72" height="340" fill="#e8e4d8" />
        <rect x="130" y="180" width="72" height="340" fill="#0e2317" opacity="0.25" />
        {lit && (
          <g fill="#f2b632">
            <rect x="145" y="200" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} />
            <rect x="175" y="240" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-1s" }} />
          </g>
        )}
        {labelsOn && <Label x={166} y={165}>Aon Center</Label>}
      </g>

      <g {...groupProps("willis")}>
        <rect x="245" y="60" width="14" height="70" fill="#0e2317" />
        <rect x="268" y="40" width="14" height="90" fill="#0e2317" />
        {lit && <circle cx="275" cy="38" r="4" fill="#ff785a" className={`motion-safe:animate-twinkle ${motion}`} />}
        <rect x="230" y="130" width="100" height="390" fill="#0e2317" />
        <rect x="230" y="130" width="33" height="390" fill="#14301f" />
        <rect x="297" y="130" width="33" height="390" fill="#14301f" />
        {lit && (
          <g fill="#f2b632">
            <rect x="240" y="150" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} />
            <rect x="270" y="190" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-1s" }} />
            <rect x="300" y="230" width="8" height="8" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-2s" }} />
          </g>
        )}
        {labelsOn && <Label x={280} y={30}>Willis Tower</Label>}
      </g>

      <g {...groupProps("hancock")}>
        <polygon points="380,520 400,150 460,150 480,520" fill="#14301f" />
        <line x1="400" y1="150" x2="480" y2="520" stroke="#8fcf6a" strokeWidth="3" />
        <line x1="460" y1="150" x2="380" y2="520" stroke="#8fcf6a" strokeWidth="3" />
        <line x1="390" y1="330" x2="470" y2="330" stroke="#8fcf6a" strokeWidth="2" />
        {labelsOn && <Label x={430} y={135}>Hancock</Label>}
      </g>

      <g {...groupProps("marina")}>
        <rect x="520" y="220" width="56" height="300" rx="28" fill="#14301f" />
        <rect x="588" y="240" width="56" height="280" rx="28" fill="#0e2317" />
        {[250, 285, 320, 355, 390, 425].map((y) => (
          <line key={y} x1="522" y1={y} x2="574" y2={y} stroke="#f6f0dc" strokeWidth="2" opacity="0.5" />
        ))}
        {labelsOn && <Label x={582} y={205}>Marina City</Label>}
      </g>

      <g {...groupProps("theatre")}>
        <rect x="690" y="330" width="80" height="190" fill="#0e2317" />
        <rect x="722" y="240" width="16" height="100" fill="#a8741a" />
        <text x="730" y="260" fill="#f2b632" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(90 730 260)">
          CHICAGO
        </text>
        {labelsOn && <Label x={730} y={225}>Chicago Theatre</Label>}
      </g>

      <g {...groupProps("wrigley")}>
        <rect x="800" y="380" width="110" height="140" fill="#0e2317" />
        <rect x="815" y="350" width="80" height="34" fill="#f2b632" />
        <text x="855" y="373" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0e2317">
          WRIGLEY
        </text>
        <line x1="800" y1="380" x2="790" y2="300" stroke="#f6f0dc" strokeWidth="4" />
        <line x1="910" y1="380" x2="920" y2="300" stroke="#f6f0dc" strokeWidth="4" />
        {lit && (
          <>
            <circle cx="790" cy="296" r="6" fill="#f2b632" className={`motion-safe:animate-twinkle ${motion}`} />
            <circle cx="920" cy="296" r="6" fill="#f2b632" className={`motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-1s" }} />
          </>
        )}
        {labelsOn && <Label x={855} y={285}>Wrigley Field</Label>}
      </g>

      <g {...groupProps("ferris")}>
        <g
          className={`motion-safe:animate-spin-slow ${motion}`}
          style={{ transformOrigin: "1090px 380px" }}
        >
          <circle cx="1090" cy="380" r="72" fill="none" stroke="#f6f0dc" strokeWidth="4" />
          <circle cx="1090" cy="380" r="8" fill="#f2b632" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <g key={a}>
                <line
                  x1="1090"
                  y1="380"
                  x2={1090 + 72 * Math.cos(rad)}
                  y2={380 + 72 * Math.sin(rad)}
                  stroke="#f6f0dc"
                  strokeWidth="2"
                />
                <circle cx={1090 + 72 * Math.cos(rad)} cy={380 + 72 * Math.sin(rad)} r="6" fill="#f2b632" />
              </g>
            );
          })}
        </g>
        <line x1="1055" y1="520" x2="1090" y2="450" stroke="#0e2317" strokeWidth="6" />
        <line x1="1125" y1="520" x2="1090" y2="450" stroke="#0e2317" strokeWidth="6" />
        {labelsOn && <Label x={1090} y={290}>Navy Pier Wheel</Label>}
      </g>

      <g {...groupProps("bean")}>
        <ellipse cx="1250" cy="480" rx="58" ry="30" fill="#cfe3ee" stroke="#f6f0dc" strokeWidth="2" />
        <ellipse cx="1235" cy="472" rx="18" ry="8" fill="#ffffff" opacity="0.8" />
        {labelsOn && <Label x={1250} y={435}>The Bean</Label>}
      </g>

      <g {...groupProps("fountain")}>
        <ellipse cx="1350" cy="495" rx="42" ry="10" fill="#7ec8e3" />
        <path d="M1332 495 Q1350 455 1368 495" fill="none" stroke="#bfe8f2" strokeWidth="3" />
        <path d="M1342 495 Q1350 468 1358 495" fill="none" stroke="#ffffff" strokeWidth="2" />
        {labelsOn && <Label x={1350} y={440}>Buckingham Fountain</Label>}
      </g>

      <rect x="0" y="505" width="1400" height="15" fill="#1d4e6b" />
    </svg>
  );
}

export default function RokuCity() {
  const [time, setTime] = useState<TimeOfDay>("dusk");
  const [paused, setPaused] = useState(false);
  const [labelsOn, setLabelsOn] = useState(true);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [showList, setShowList] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = SPOTS.find((s) => s.id === selectedId) ?? null;
  const motion = paused ? "[animation-play-state:paused]" : "";
  const skylineSeconds = SPEED_SECONDS[speed];

  return (
    <main
      className="relative flex h-[calc(100dvh-4.2rem)] min-h-[30rem] w-full flex-col overflow-hidden"
      style={{ background: SKIES[time] }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className={`absolute top-10 left-0 h-8 w-24 rounded-full bg-white/70 blur-[2px] motion-safe:animate-drift ${motion}`} />
        <span
          className={`absolute top-24 left-0 h-6 w-16 rounded-full bg-white/50 blur-[2px] motion-safe:animate-drift ${motion}`}
          style={{ animationDelay: "-30s", animationDuration: "90s" }}
        />
        {time !== "day" && (
          <>
            <span className="absolute top-8 right-8 size-10 rounded-full bg-amber shadow-[0_0_40px_10px_rgba(242,182,50,0.5)]" />
            <span className={`absolute top-24 left-[12%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`} />
            <span className={`absolute top-16 left-[38%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-1s" }} />
            <span className={`absolute top-28 left-[62%] size-1 rounded-full bg-white motion-safe:animate-twinkle ${motion}`} style={{ animationDelay: "-2s" }} />
          </>
        )}
        {time === "day" && (
          <span className="absolute top-8 right-8 size-12 rounded-full bg-amber shadow-[0_0_50px_14px_rgba(242,182,50,0.6)]" />
        )}
        <div className={`absolute top-16 left-0 whitespace-nowrap text-base font-black tracking-[.3em] text-cream/90 motion-safe:animate-drift ${motion}`} style={{ animationDuration: "140s" }}>
          ARBOR DAY &middot; APR 30 2027 &middot; ARBOR DAY &middot; APR 30 2027
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <div className="rounded-xl bg-forest/70 px-3 py-2 backdrop-blur">
          <p className="text-[11px] font-black tracking-[.25em] text-amber uppercase">Roku City, Chicago</p>
          <p className="text-base leading-tight font-black text-cream">Arbor Day, after dark</p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => setLabelsOn((v) => !v)}
            aria-pressed={labelsOn}
            className="min-h-11 rounded-full bg-forest/70 px-4 text-sm font-black text-cream backdrop-blur"
          >
            Labels {labelsOn ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="min-h-11 rounded-full bg-cream px-4 text-sm font-black text-forest"
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={`flex h-full w-max motion-safe:animate-skyline ${motion}`}
          style={{ animationDuration: `${skylineSeconds}s` }}
        >
          <SkylinePanel labelsOn={labelsOn} time={time} motion={motion} selectedId={selectedId ?? ""} onSelect={setSelectedId} />
          <SkylinePanel labelsOn={labelsOn} time={time} motion={motion} selectedId={selectedId ?? ""} onSelect={setSelectedId} />
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute top-[42%] left-0 z-10 w-full">
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

        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full overflow-hidden bg-[#1d4e6b]/90">
          <div className={`motion-safe:animate-boat ${motion}`}>
            <div className="flex h-8 w-32 items-end gap-1">
              <span className="block h-4 w-28 rounded-t-lg bg-cream" />
              <span className="block h-6 w-2 bg-forest" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-t-4 border-forest bg-forest-deep px-3 pt-3 pb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-black tracking-[.25em] text-amber uppercase">Past venues, lit up</p>
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            aria-expanded={showList}
            className="min-h-11 rounded-full border border-cream/30 px-4 text-sm font-black text-cream"
          >
            {showList ? "Hide list" : "Hidden in the skyline"}
          </button>
        </div>
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1" role="group" aria-label="Past venues">
          {VENUES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              aria-pressed={selectedId === v.id}
              className={`min-h-16 w-40 shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left ${
                selectedId === v.id ? "border-amber bg-amber text-forest" : "border-cream/25 bg-cream/10 text-cream"
              }`}
            >
              <span className="block text-sm leading-tight font-black">{v.name}</span>
              <span className="mt-0.5 block text-xs leading-tight opacity-80">{v.note}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Time of day and drift speed">
          {(["day", "dusk", "night"] as TimeOfDay[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              aria-pressed={time === t}
              className={`min-h-11 rounded-full border px-4 text-sm font-black capitalize ${
                time === t ? "border-amber bg-amber text-forest" : "border-cream/30 bg-transparent text-cream"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-cream/25 sm:block" aria-hidden="true" />
          {(["slow", "normal", "fast"] as Speed[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={`min-h-11 rounded-full border px-4 text-sm font-black capitalize ${
                speed === s ? "border-leaf bg-leaf text-forest" : "border-cream/30 bg-transparent text-cream"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {showList && (
        <div className="absolute inset-x-3 bottom-40 z-30 max-h-[55%] overflow-y-auto rounded-2xl border border-cream/20 bg-forest-deep/95 p-4 shadow-card backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-black text-cream">Hidden in the skyline</h2>
            <button
              type="button"
              onClick={() => setShowList(false)}
              className="min-h-11 min-w-11 rounded-full border border-cream/30 text-base font-black text-cream"
              aria-label="Close list"
            >
              X
            </button>
          </div>
          <p className="mb-3 text-sm opacity-75">Tap any name to see its story. Twelve landmarks, five venues, one city.</p>
          <ul className="flex flex-col gap-1">
            {SPOTS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(s.id);
                    setShowList(false);
                  }}
                  className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-base font-bold text-cream hover:bg-cream/10"
                >
                  {s.name} <span className="font-normal opacity-60">, {s.kind.toLowerCase()}, {s.note}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <Link href="/arbor-trail" className="font-bold text-leaf underline underline-offset-2">Play the Arbor Trail</Link>
            {" · "}
            <Link href="/history" className="font-bold text-leaf underline underline-offset-2">Past Parties</Link>
          </p>
        </div>
      )}

      {selected && (
        <div className="absolute inset-x-3 bottom-40 z-30 rounded-2xl border border-cream/20 bg-forest-deep/95 p-4 shadow-card backdrop-blur" role="dialog" aria-label={selected.name}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[.25em] text-amber uppercase">{selected.kind}</p>
              <h2 className="mt-0.5 text-xl font-black text-cream">{selected.name}</h2>
              <p className="mt-0.5 text-sm font-bold opacity-80">{selected.note}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="min-h-11 min-w-11 shrink-0 rounded-full border border-cream/30 text-base font-black text-cream"
              aria-label="Close"
            >
              X
            </button>
          </div>
          <p className="mt-2 text-base leading-relaxed opacity-90">{selected.detail}</p>
          {selected.href && (
            <p className="mt-2">
              <Link href={selected.href} className="font-bold text-leaf underline underline-offset-2">See it on Past Parties</Link>
            </p>
          )}
          <p className="mt-2 text-sm opacity-70">
            <button type="button" onClick={() => setShowList(true)} className="font-bold text-cream underline underline-offset-2">
              See every nod in the skyline
            </button>
          </p>
        </div>
      )}
    </main>
  );
}
