"use client";

import { useEffect, useRef, useState } from "react";
import {
  CLASSES,
  DEFAULT_NAMES,
  GOAL_BEERS,
  PACES,
  RATIONS,
  TOASTS,
  TOTAL_TURNS,
} from "./data";
import {
  advanceTurn,
  buyItem,
  createGame,
  formatClock,
  GameState,
  getClass,
  getPace,
  getRation,
  giveToast,
  HighScore,
  leaveLandmark,
  loadScores,
  resolveChoice,
  saveScore,
  shopItemsForTurn,
  startPong,
  throwPong,
} from "./engine";
import TrailCanvas from "./TrailCanvas";
import { isMuted, setMuted, sfx } from "./sound";
import { fetchTrailScores, submitTrailScore } from "@/lib/supabase";
import "./trail.css";

function useTypewriter(text: string, speed = 12) {
  const [count, setCount] = useState(0);
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setCount(0);
  }
  useEffect(() => {
    if (!text) return;
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 2;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    skip: () => setCount(text.length),
  };
}

function TrailButton({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`trail-btn min-h-[44px] w-full px-4 py-3 text-left font-mono text-base ${
        primary ? "trail-btn-primary" : ""
      } ${disabled ? "opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="font-mono text-sm">
      <div className="flex justify-between">
        <span className="trail-dim">{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="trail-bar mt-1 h-2.5 w-full">
        <div className="trail-bar-fill h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  sober: "trail-status-sober",
  tipsy: "trail-status-tipsy",
  drunk: "trail-status-drunk",
  gone: "trail-status-gone",
};

function CrewList({ state }: { state: GameState }) {
  return (
    <ul className="m-0 list-none space-y-1 p-0 font-mono text-sm">
      {state.crew.map((m, i) => (
        <li key={i} className="flex items-center justify-between gap-2">
          <span className={m.status === "gone" ? "line-through opacity-50" : ""}>
            {i === 0 ? "> " : ""}
            {m.name}
          </span>
          <span className={`trail-status ${STATUS_STYLE[m.status]}`}>{m.status}</span>
        </li>
      ))}
    </ul>
  );
}

function GameLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);
  return (
    <div ref={ref} className="trail-log h-36 overflow-y-auto font-mono text-sm">
      {lines.slice(-12).map((l, i) => (
        <p key={i} className="m-0 mb-1">
          {l}
        </p>
      ))}
    </div>
  );
}

function StatusPanel({ state }: { state: GameState }) {
  return (
    <div className="trail-panel space-y-3 p-4">
      <div className="flex items-baseline justify-between font-mono">
        <span className="text-lg font-bold trail-glow">{formatClock(state.turn)}</span>
        <span className="trail-dim text-sm">
          {getPace(state.paceId).name} - {getRation(state.rationId).name}
        </span>
      </div>
      <StatBar label="BEERS" value={Math.min(state.beers, GOAL_BEERS)} max={GOAL_BEERS} />
      <div className="flex justify-between font-mono text-sm">
        <span>
          <span className="trail-dim">CASH </span>${state.money}
        </span>
        <span>
          <span className="trail-dim">DIGNITY </span>
          <span className={state.dignity <= 25 ? "trail-danger" : ""}>{state.dignity}</span>
        </span>
      </div>
      <CrewList state={state} />
    </div>
  );
}

const MUG = `      .-""-.
      |    ||
      |    ||
      |    ||
      |____||
       \\__/`;

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <pre className="trail-glow mx-auto inline-block text-left font-mono text-sm leading-tight">
        {MUG}
      </pre>
      <h1 className="trail-glow font-mono text-3xl font-bold tracking-widest sm:text-4xl">
        THE ARBOR DAY TRAIL
      </h1>
      <p className="mx-auto max-w-md font-mono text-sm leading-relaxed">
        50 beers. One night. Five friends.
        <br />
        Lead your crew from 9 PM to midnight across the sacred landmarks of
        Arbor Days past. Do not die of dysentery. There is no dysentery here.
        There is karaoke.
      </p>
      <div className="mx-auto max-w-md text-left font-mono text-xs leading-relaxed trail-dim">
        <p className="m-0">- Name your crew, pick a drinking class and a pace.</p>
        <p className="m-0">- Every 15 minutes the trail throws something at you.</p>
        <p className="m-0">- Reach midnight with 50 beers and your dignity.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.click();
          onStart();
        }}
        className="trail-btn trail-btn-primary mx-auto block min-h-[48px] px-10 py-3 font-mono text-lg"
      >
        HIT THE TRAIL <span className="blink">_</span>
      </button>
      <HighScoreTable compact />
    </div>
  );
}

function SetupScreen({ onBegin }: { onBegin: (s: GameState) => void }) {
  const [names, setNames] = useState<string[]>(["", "", "", "", ""]);
  const [classId, setClassId] = useState<"veteran" | "regular" | "rookie">("regular");
  const [paceId, setPaceId] = useState<"sipping" | "steady" | "sending">("steady");
  const [rationId, setRationId] = useState<"rounds" | "justme" | "nursing">("justme");

  const setName = (i: number, v: string) => {
    const n = [...names];
    n[i] = v;
    setNames(n);
  };

  return (
    <div className="space-y-6">
      <h2 className="trail-glow text-center font-mono text-2xl font-bold">ASSEMBLE YOUR CREW</h2>

      <div className="trail-panel space-y-2 p-4">
        <p className="m-0 font-mono text-sm trail-dim">Name five travelers. The first is your leader.</p>
        {names.map((n, i) => (
          <input
            key={i}
            value={n}
            onChange={(e) => setName(i, e.target.value)}
            placeholder={DEFAULT_NAMES[i]}
            maxLength={16}
            aria-label={`Crew member ${i + 1}`}
            className="trail-input min-h-[44px] w-full px-3 py-2 font-mono text-base"
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="m-0 font-mono text-sm trail-dim">Choose a drinking class:</p>
        {CLASSES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClassId(c.id)}
            aria-pressed={classId === c.id}
            className={`trail-btn min-h-[44px] w-full px-4 py-3 text-left font-mono text-sm ${
              classId === c.id ? "trail-btn-active" : ""
            }`}
          >
            <span className="font-bold">{c.name}</span>
            <br />
            <span className="trail-dim text-xs">{c.blurb}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="m-0 font-mono text-sm trail-dim">Choose a pace:</p>
        {PACES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPaceId(p.id)}
            aria-pressed={paceId === p.id}
            className={`trail-btn min-h-[44px] w-full px-4 py-3 text-left font-mono text-sm ${
              paceId === p.id ? "trail-btn-active" : ""
            }`}
          >
            <span className="font-bold">{p.name}</span>
            <br />
            <span className="trail-dim text-xs">{p.blurb}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="m-0 font-mono text-sm trail-dim">Choose rations:</p>
        {RATIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRationId(r.id)}
            aria-pressed={rationId === r.id}
            className={`trail-btn min-h-[44px] w-full px-4 py-3 text-left font-mono text-sm ${
              rationId === r.id ? "trail-btn-active" : ""
            }`}
          >
            <span className="font-bold">{r.name}</span>
            <br />
            <span className="trail-dim text-xs">{r.blurb}</span>
          </button>
        ))}
      </div>

      <TrailButton
        primary
        onClick={() => {
          sfx.click();
          onBegin(createGame({ names, classId, paceId, rationId }));
        }}
      >
        <span className="font-bold">DEPART AT 9 PM</span>
      </TrailButton>
    </div>
  );
}

function TravelScreen({
  state,
  onAdvance,
}: {
  state: GameState;
  onAdvance: () => void;
}) {
  return (
    <div className="space-y-4">
      <TrailCanvas turn={state.turn} crew={state.crew} />
      <StatusPanel state={state} />
      <GameLog lines={state.log} />
      <TrailButton
        primary
        onClick={() => {
          sfx.step();
          onAdvance();
        }}
      >
        <span className="font-bold">CONTINUE DOWN THE TRAIL (15 MIN)</span>
      </TrailButton>
      <p className="m-0 text-center font-mono text-xs trail-dim">
        Turn {state.turn} of {TOTAL_TURNS}. Midnight approaches.
      </p>
    </div>
  );
}

function EventScreen({
  state,
  onChoice,
  onContinue,
}: {
  state: GameState;
  onChoice: (i: number) => void;
  onContinue: () => void;
}) {
  const event = state.event;
  const tw = useTypewriter(event && !state.eventResult ? event.text : "", 10);
  useEffect(() => {
    sfx.event();
  }, []);
  if (!event) return null;
  return (
    <div className="space-y-4">
      <StatusPanel state={state} />
      <div
        className="trail-panel min-h-[120px] p-4"
        onClick={() => tw.skip()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") tw.skip();
        }}
        aria-label="Event text, activate to skip typing"
      >
        <p className="m-0 font-mono text-base leading-relaxed">
          {state.eventResult ? event.text : tw.shown}
          {!state.eventResult && !tw.done && <span className="blink">_</span>}
        </p>
        {state.eventResult && (
          <p className="trail-glow mb-0 mt-4 font-mono text-base leading-relaxed">
            {state.eventResult}
          </p>
        )}
      </div>
      {state.eventResult ? (
        <TrailButton primary onClick={onContinue}>
          <span className="font-bold">CONTINUE</span>
        </TrailButton>
      ) : (
        tw.done && (
          <div className="space-y-2">
            {event.choices.map((c, i) => {
              const cantAfford = c.cost !== undefined && state.money < c.cost;
              return (
                <TrailButton
                  key={i}
                  onClick={() => {
                    sfx.click();
                    onChoice(i);
                  }}
                  disabled={cantAfford}
                >
                  <span className="font-bold">
                    {i + 1}. {c.label}
                  </span>
                  {c.sub && (
                    <>
                      <br />
                      <span className="trail-dim text-xs">
                        {c.sub}
                        {cantAfford ? " (cannot afford)" : ""}
                      </span>
                    </>
                  )}
                </TrailButton>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function LandmarkScreen({
  state,
  onToast,
  onPong,
  onShop,
  onRest,
  onLeave,
}: {
  state: GameState;
  onToast: (i: number) => void;
  onPong: () => void;
  onShop: () => void;
  onRest: () => void;
  onLeave: () => void;
}) {
  const [toasting, setToasting] = useState(false);
  const lm = state.landmark;
  if (!lm) return null;
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-2 p-4 text-center">
        <p className="trail-dim m-0 font-mono text-xs tracking-widest">LANDMARK REACHED</p>
        <h2 className="trail-glow m-0 font-mono text-2xl font-bold">{lm.name}</h2>
        <p className="trail-dim m-0 font-mono text-sm">{lm.year}</p>
        <p className="m-0 font-mono text-sm leading-relaxed">{lm.blurb}</p>
      </div>
      <StatusPanel state={state} />
      {state.landmarkResult && (
        <div className="trail-panel p-4">
          <p className="trail-glow m-0 font-mono text-sm leading-relaxed">
            {state.landmarkResult}
          </p>
        </div>
      )}
      {lm.final ? (
        <TrailButton primary onClick={onLeave}>
          <span className="font-bold">FACE JUDGMENT</span>
        </TrailButton>
      ) : toasting ? (
        <div className="space-y-2">
          <p className="m-0 font-mono text-sm trail-dim">Choose your toast:</p>
          {TOASTS.map((t, i) => (
            <TrailButton
              key={i}
              onClick={() => {
                sfx.toast();
                onToast(i);
                setToasting(false);
              }}
            >
              <span className="text-sm">&quot;{t.text}&quot;</span>
            </TrailButton>
          ))}
          <TrailButton onClick={() => setToasting(false)}>
            <span className="text-sm">Never mind</span>
          </TrailButton>
        </div>
      ) : (
        <div className="space-y-2">
          <TrailButton onClick={() => setToasting(true)}>
            <span className="font-bold">1. Give a toast</span>
            <br />
            <span className="trail-dim text-xs">Rally the crew. 70 percent glory.</span>
          </TrailButton>
          {!state.pongUsed && (
            <TrailButton onClick={onPong}>
              <span className="font-bold">2. Play beer pong</span>
              <br />
              <span className="trail-dim text-xs">3 throws. +2 beers per hit. Once per stop.</span>
            </TrailButton>
          )}
          {lm.shop && (
            <TrailButton onClick={onShop}>
              <span className="font-bold">3. Browse the shop</span>
              <br />
              <span className="trail-dim text-xs">Supplies for the trail.</span>
            </TrailButton>
          )}
          <TrailButton onClick={onRest}>
            <span className="font-bold">4. Rest the crew</span>
            <br />
            <span className="trail-dim text-xs">Skip drinking a turn. Sober up, +10 dignity.</span>
          </TrailButton>
          <TrailButton primary onClick={onLeave}>
            <span className="font-bold">5. Keep moving</span>
          </TrailButton>
        </div>
      )}
    </div>
  );
}

function ShopScreen({
  state,
  onBuy,
  onBack,
}: {
  state: GameState;
  onBuy: (id: string) => void;
  onBack: () => void;
}) {
  const items = shopItemsForTurn(state.turn);
  return (
    <div className="space-y-4">
      <div className="trail-panel p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">TRAIL SHOP</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          {state.landmark?.name} - You have ${state.money}
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const cantAfford = state.money < item.cost;
          return (
            <TrailButton
              key={item.id}
              onClick={() => {
                sfx.coin();
                onBuy(item.id);
              }}
              disabled={cantAfford}
            >
              <span className="font-bold">
                {item.name} - ${item.cost}
              </span>
              <br />
              <span className="trail-dim text-xs">
                {item.desc}
                {cantAfford ? " (cannot afford)" : ""}
              </span>
            </TrailButton>
          );
        })}
      </div>
      <TrailButton primary onClick={onBack}>
        <span className="font-bold">BACK TO THE LANDMARK</span>
      </TrailButton>
    </div>
  );
}

function PongScreen({
  throwsLeft,
  hits,
  onThrow,
}: {
  throwsLeft: number;
  hits: number;
  onThrow: (hit: boolean) => void;
}) {
  const [pos, setPos] = useState(0);
  const dirRef = useRef(1);
  useEffect(() => {
    const id = setInterval(() => {
      setPos((p) => {
        let n = p + dirRef.current * 2.6;
        if (n >= 100) {
          dirRef.current = -1;
          n = 100;
        } else if (n <= 0) {
          dirRef.current = 1;
          n = 0;
        }
        return n;
      });
    }, 30);
    return () => clearInterval(id);
  }, []);
  const hit = pos >= 42 && pos <= 58;
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-1 p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">BEER PONG</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          Throws left: {throwsLeft} - Hits: {hits}
        </p>
      </div>
      <div className="trail-panel p-4">
        <div className="relative h-10 w-full overflow-hidden rounded border border-current">
          <div className="trail-target absolute inset-y-0" style={{ left: "42%", width: "16%" }} />
          <div
            className="trail-marker absolute inset-y-0 w-[3px]"
            style={{ left: `${pos}%` }}
          />
        </div>
        <p className="trail-dim m-0 mt-2 text-center font-mono text-xs">
          Stop the marker in the zone, then throw.
        </p>
      </div>
      <TrailButton
        primary
        onClick={() => {
          if (hit) sfx.hit();
          else sfx.miss();
          onThrow(hit);
        }}
      >
        <span className="text-center font-bold">THROW</span>
      </TrailButton>
    </div>
  );
}

function HighScoreTable({ compact }: { compact?: boolean }) {
  const [scores, setScores] = useState<HighScore[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetchTrailScores(8)
      .then((rows) => {
        if (!alive) return;
        setScores(
          rows.map((r) => ({
            name: r.name,
            score: r.score,
            beers: r.beers,
            className: r.class,
            won: r.won,
            date: r.created_at.slice(0, 10),
          }))
        );
      })
      .catch(() => {
        if (alive) setScores(loadScores());
      });
    return () => {
      alive = false;
    };
  }, []);
  if (scores === null) {
    return (
      <p className="trail-dim m-0 text-center font-mono text-xs">
        Consulting the trail spirits...
      </p>
    );
  }
  if (scores.length === 0) {
    return (
      <p className="trail-dim m-0 text-center font-mono text-xs">
        No legends yet. Be the first.
      </p>
    );
  }
  return (
    <div className="trail-panel mx-auto w-full max-w-md p-4">
      <p className="trail-glow m-0 mb-2 text-center font-mono text-sm font-bold">
        HALL OF TRAIL LEGENDS
      </p>
      <ol className="m-0 list-none space-y-1 p-0 font-mono text-xs">
        {scores.slice(0, compact ? 5 : 8).map((s, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span className="truncate">
              {i + 1}. {s.name} {s.won ? "(conquered)" : ""}
            </span>
            <span className="shrink-0">{s.score} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OverScreen({
  state,
  onRestart,
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const [name, setName] = useState(state.crew[0]?.name ?? "Traveler");
  const [saved, setSaved] = useState(false);
  const cls = getClass(state.classId);

  useEffect(() => {
    if (state.won) sfx.win();
    else sfx.lose();
  }, [state.won]);

  const handleSave = () => {
    if (saved) return;
    const entry: HighScore = {
      name: name.trim().slice(0, 16) || "Traveler",
      score: state.score,
      beers: state.beers,
      className: cls.name,
      won: state.won,
      date: new Date().toISOString().slice(0, 10),
    };
    saveScore(entry);
    submitTrailScore({
      name: entry.name,
      score: entry.score,
      beers: entry.beers,
      class: cls.name,
      won: entry.won,
    }).catch(() => undefined);
    setSaved(true);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className={`font-mono text-3xl font-bold ${state.won ? "trail-glow" : "trail-danger"}`}>
        {state.won ? "TRAIL CONQUERED" : "THE TRAIL WINS"}
      </h2>
      <p className="mx-auto max-w-md font-mono text-sm leading-relaxed">{state.endReason}</p>

      <div className="trail-panel mx-auto grid max-w-md grid-cols-2 gap-2 p-4 font-mono text-sm">
        <div>
          <span className="trail-dim">BEERS</span>
          <br />
          <span className="text-lg font-bold">
            {state.beers}/{GOAL_BEERS}
          </span>
        </div>
        <div>
          <span className="trail-dim">SCORE</span>
          <br />
          <span className="trail-glow text-lg font-bold">{state.score}</span>
        </div>
        <div>
          <span className="trail-dim">CLASS</span>
          <br />
          {cls.name} (x{cls.multiplier})
        </div>
        <div>
          <span className="trail-dim">STANDING</span>
          <br />
          {state.crew.filter((m) => m.status !== "gone").length}/{state.crew.length}
        </div>
      </div>

      {state.tombstones.length > 0 && (
        <div className="space-y-2">
          <p className="trail-dim m-0 font-mono text-xs tracking-widest">IN MEMORIAM</p>
          {state.tombstones.map((t, i) => (
            <div key={i} className="trail-tombstone mx-auto max-w-xs p-3 font-mono text-sm">
              <p className="m-0 font-bold">Here lies {t.name}</p>
              <p className="trail-dim m-0 text-xs">Cause: {t.cause}</p>
            </div>
          ))}
        </div>
      )}

      {!saved ? (
        <div className="mx-auto flex max-w-md gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            aria-label="Your legend name"
            placeholder="Your legend name"
            className="trail-input min-h-[44px] flex-1 px-3 py-2 font-mono text-base"
          />
          <button
            type="button"
            onClick={handleSave}
            className="trail-btn trail-btn-primary min-h-[44px] shrink-0 px-5 py-2 font-mono"
          >
            SAVE
          </button>
        </div>
      ) : (
        <HighScoreTable />
      )}

      <button
        type="button"
        onClick={onRestart}
        className="trail-btn trail-btn-primary mx-auto block min-h-[48px] px-10 py-3 font-mono text-lg"
      >
        TRAVEL AGAIN
      </button>
    </div>
  );
}

export default function ArborTrailGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [muted, setMutedState] = useState<boolean>(() => isMuted());

  const continueFromEvent = () =>
    setState((s) => {
      if (!s) return s;
      if (s.over) return { ...s, screen: "over" as const };
      return { ...s, screen: "travel" as const, event: null, eventResult: null };
    });

  return (
    <div className="trail-root min-h-screen">
      <div className="trail-scanlines pointer-events-none fixed inset-0 z-10" aria-hidden />
      <main className="relative z-0 mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
        {!state && <TitleScreen onStart={() => setState({ screen: "setup" } as GameState)} />}
        {state?.screen === "setup" && (
          <SetupScreen onBegin={(s) => setState(s)} />
        )}
        {state && state.screen !== "title" && state.screen !== "setup" && (
          <div className="mb-4 flex items-center justify-between font-mono text-xs trail-dim">
            <span>THE ARBOR DAY TRAIL</span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const m = !muted;
                  setMuted(m);
                  setMutedState(m);
                  if (!m) sfx.click();
                }}
                aria-pressed={muted}
                aria-label={muted ? "Unmute sound" : "Mute sound"}
                className="trail-dim min-h-[44px] px-2 underline"
              >
                {muted ? "sound off" : "sound on"}
              </button>
              <button
                type="button"
                onClick={() => setState(null)}
                className="trail-dim min-h-[44px] px-2 underline"
              >
                quit to title
              </button>
            </span>
          </div>
        )}
        {state?.screen === "travel" && (
          <TravelScreen state={state} onAdvance={() => setState((s) => (s ? advanceTurn(s, false) : s))} />
        )}
        {state?.screen === "event" && (
          <EventScreen
            state={state}
            onChoice={(i) => setState((s) => (s ? resolveChoice(s, i) : s))}
            onContinue={continueFromEvent}
          />
        )}
        {state?.screen === "landmark" && (
          <LandmarkScreen
            state={state}
            onToast={(i) => setState((s) => (s ? giveToast(s, i) : s))}
            onPong={() => setState((s) => (s ? startPong(s) : s))}
            onShop={() => setState((s) => (s ? { ...s, screen: "shop" as const } : s))}
            onRest={() => setState((s) => (s ? advanceTurn(s, true) : s))}
            onLeave={() => setState((s) => (s ? leaveLandmark(s) : s))}
          />
        )}
        {state?.screen === "shop" && (
          <ShopScreen
            state={state}
            onBuy={(id) => setState((s) => (s ? buyItem(s, id) : s))}
            onBack={() => setState((s) => (s ? { ...s, screen: "landmark" as const } : s))}
          />
        )}
        {state?.screen === "pong" && (
          <PongScreen
            throwsLeft={state.pongThrowsLeft}
            hits={state.pongHits}
            onThrow={(hit) => setState((s) => (s ? throwPong(s, hit) : s))}
          />
        )}
        {state?.screen === "over" && (
          <OverScreen state={state} onRestart={() => setState(null)} />
        )}
      </main>
    </div>
  );
}
