"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ACHIEVEMENTS,
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
  evaluateAchievements,
  formatClock,
  GameState,
  getClass,
  getPace,
  getPersonality,
  getRation,
  giveToast,
  HighScore,
  leaveLandmark,
  leaveRoulette,
  loadAchievements,
  loadScores,
  MinigameResult,
  openShop,
  resolveChoice,
  resolveMinigame,
  resolveRoast,
  saveScore,
  shopItemsForTurn,
  skipDetour,
  startPong,
  startRoulette,
  takeDetour,
  takeRouletteShot,
  throwPong,
  unlockAchievements,
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

// A double click or a fat-fingered double tap must never fire two actions
// (two turns, two choices). Every action button shares one short cooldown.
const CLICK_GUARD_MS = 250;
let lastActivation = 0;
function allowActivation(): boolean {
  const now = Date.now();
  if (now - lastActivation < CLICK_GUARD_MS) return false;
  lastActivation = now;
  return true;
}

function TrailButton({
  children,
  onClick,
  disabled,
  primary,
  silent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  /** The handler plays its own sound, so skip the default click. */
  silent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!allowActivation()) return;
        if (!silent) sfx.click();
        onClick();
      }}
      disabled={disabled}
      className={`trail-btn min-h-[44px] w-full px-4 py-3 text-left font-mono text-base ${
        primary ? "trail-btn-primary" : ""
      }`}
    >
      {children}
    </button>
  );
}

interface StatDelta {
  beers: number;
  money: number;
  dignity: number;
  k: number;
}
const DeltaContext = createContext<StatDelta | null>(null);

function DeltaTag({ value, prefix = "" }: { value: number; prefix?: string }) {
  if (!value) return null;
  const up = value > 0;
  return (
    <span className={`trail-delta ${up ? "trail-delta-up" : "trail-delta-down"}`} aria-hidden>
      {up ? "+" : "-"}
      {prefix}
      {Math.abs(value)}
    </span>
  );
}

function StatBar({
  label,
  value,
  max,
  delta,
}: {
  label: string;
  value: number;
  max: number;
  delta?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="font-mono text-sm">
      <div className="flex justify-between">
        <span className="trail-dim">{label}</span>
        <span>
          {value}/{max}
          {delta}
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
            <span className="trail-dim text-xs"> ({getPersonality(m.personalityId).name.toLowerCase()})</span>
            {state.walkerShield?.name === m.name && state.walkerShield.turns > 0 && (
              <span className="text-xs"> [walker]</span>
            )}
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
  const delta = useContext(DeltaContext);
  return (
    <div className="trail-panel space-y-3 p-4">
      <div className="flex items-baseline justify-between font-mono">
        <span className="text-lg font-bold trail-glow">{formatClock(state.turn)}</span>
        <span className="trail-dim text-sm">
          {getPace(state.paceId).name} - {getRation(state.rationId).name}
        </span>
      </div>
      <StatBar
        label="BEERS"
        value={Math.min(state.beers, GOAL_BEERS)}
        max={GOAL_BEERS}
        delta={delta ? <DeltaTag key={delta.k} value={delta.beers} /> : null}
      />
      <div className="flex justify-between font-mono text-sm">
        <span>
          <span className="trail-dim">CASH </span>${state.money}
          {delta && <DeltaTag key={delta.k} value={delta.money} prefix="$" />}
        </span>
        <span>
          <span className="trail-dim">DIGNITY </span>
          <span className={state.dignity <= 25 ? "trail-danger" : ""}>{state.dignity}</span>
          {delta && <DeltaTag key={delta.k} value={delta.dignity} />}
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

/** One-line stats for the minigame screens, where the full panel would crowd the game. */
function MiniStats({ state }: { state: GameState }) {
  const delta = useContext(DeltaContext);
  return (
    <div className="trail-panel flex justify-between px-4 py-2 font-mono text-sm">
      <span>
        <span className="trail-dim">BEERS </span>
        {state.beers}
        {delta && <DeltaTag key={delta.k} value={delta.beers} />}
      </span>
      <span>
        <span className="trail-dim">DIGNITY </span>
        {state.dignity}
        {delta && <DeltaTag key={delta.k} value={delta.dignity} />}
      </span>
    </div>
  );
}

function BadgeCase() {
  const [earned] = useState<string[]>(() => loadAchievements());
  if (earned.length === 0) return null;
  return (
    <div className="trail-panel mx-auto w-full max-w-md p-4">
      <p className="trail-glow m-0 mb-2 text-center font-mono text-sm font-bold">
        BADGES ({earned.length}/{ACHIEVEMENTS.length})
      </p>
      <ul className="m-0 list-none space-y-1 p-0 font-mono text-xs">
        {ACHIEVEMENTS.filter((a) => earned.includes(a.id)).map((a) => (
          <li key={a.id} className="flex justify-between gap-2">
            <span className="font-bold">{a.name}</span>
            <span className="trail-dim text-right">{a.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
          if (!allowActivation()) return;
          sfx.click();
          onStart();
        }}
        className="trail-btn trail-btn-primary mx-auto block min-h-[48px] px-10 py-3 font-mono text-lg"
      >
        HIT THE TRAIL <span className="blink">_</span>
      </button>
      <HighScoreTable compact />
      <BadgeCase />
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
            onClick={() => {
              sfx.click();
              setClassId(c.id);
            }}
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
            onClick={() => {
              sfx.click();
              setPaceId(p.id);
            }}
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
            onClick={() => {
              sfx.click();
              setRationId(r.id);
            }}
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
        onClick={() => onBegin(createGame({ names, classId, paceId, rationId }))}
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
      {state.banter && (
        <div className="trail-panel p-4" aria-live="polite">
          <p className="m-0 font-mono text-sm leading-relaxed">
            <span className="trail-dim">&ldquo;</span>
            {state.banter}
            <span className="trail-dim">&rdquo;</span>
          </p>
        </div>
      )}
      <GameLog lines={state.log} />
      <TrailButton
        primary
        silent
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
        key={state.eventResult ? "result" : "text"}
        className={`trail-panel min-h-[120px] p-4 ${state.eventResult ? "trail-flash" : ""}`}
        onClick={() => tw.skip()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            tw.skip();
          }
        }}
        aria-label="Event text, activate to skip typing"
      >
        <p className="m-0 font-mono text-base leading-relaxed">
          {state.eventResult ? event.text : tw.shown}
          {!state.eventResult && !tw.done && <span className="blink">_</span>}
        </p>
        {state.eventResult && (
          <p
            className="trail-glow mb-0 mt-4 font-mono text-base leading-relaxed"
            aria-live="polite"
          >
            {state.eventResult}
          </p>
        )}
        {!state.eventResult && !tw.done && (
          <p className="trail-dim mb-0 mt-3 font-mono text-xs">tap to skip</p>
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
                <TrailButton key={i} onClick={() => onChoice(i)} disabled={cantAfford}>
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

function DetourScreen({
  state,
  onTake,
  onRoast,
  onSkip,
}: {
  state: GameState;
  onTake: () => void;
  onRoast: (i: number) => void;
  onSkip: () => void;
}) {
  const bar = state.detour;
  if (!bar) return null;
  const cantAfford = (bar.cost ?? 0) > state.money;
  const isRoast = bar.kind === "roast";
  return (
    <div className="space-y-4">
      <StatusPanel state={state} />
      <div className="trail-panel space-y-2 p-4 text-center">
        <p className="trail-danger m-0 font-mono text-xs tracking-widest">DIVE BAR SPOTTED</p>
        <h2 className="trail-glow m-0 font-mono text-2xl font-bold">{bar.name}</h2>
        <p className="m-0 font-mono text-sm leading-relaxed trail-dim">{bar.blurb}</p>
      </div>
      {state.detourResult ? (
        <div className="trail-panel trail-flash p-4" aria-live="polite">
          <p className="trail-glow m-0 font-mono text-sm leading-relaxed">
            {state.detourResult}
          </p>
        </div>
      ) : null}
      {state.detourResult ? (
        <TrailButton primary onClick={onSkip}>
          <span className="font-bold">STUMBLE ONWARD</span>
        </TrailButton>
      ) : isRoast ? (
        <div className="space-y-2">
          <p className="m-0 font-mono text-sm trail-dim">
            The staffer sizes you up: &quot;What do YOU want?&quot;
          </p>
          <TrailButton onClick={() => onRoast(0)}>
            <span className="font-bold">Clap back</span>
            <br />
            <span className="trail-dim text-xs">60% glory, 40% disaster.</span>
          </TrailButton>
          <TrailButton onClick={() => onRoast(1)}>
            <span className="font-bold">Take it</span>
            <br />
            <span className="trail-dim text-xs">-3 dignity, +2 beers.</span>
          </TrailButton>
          <TrailButton
            disabled={state.money < 6}
            onClick={() => onRoast(2)}
          >
            <span className="font-bold">Order and run</span>
            <br />
            <span className="trail-dim text-xs">
              -$6, +2 beers.{state.money < 6 ? " (cannot afford)" : ""}
            </span>
          </TrailButton>
          <TrailButton onClick={onSkip}>
            <span className="font-bold">KEEP WALKING</span>
          </TrailButton>
        </div>
      ) : (
        <div className="space-y-2">
          <TrailButton
            primary
            silent
            disabled={cantAfford}
            onClick={() => {
              sfx.detour();
              onTake();
            }}
          >
            <span className="font-bold">{bar.cta}</span>
            {cantAfford && (
              <>
                <br />
                <span className="trail-dim text-xs">(cannot afford it)</span>
              </>
            )}
          </TrailButton>
          <TrailButton onClick={onSkip}>
            <span className="font-bold">KEEP WALKING</span>
          </TrailButton>
        </div>
      )}
    </div>
  );
}

/* ---------------- detour mini-games ---------------- */

/** How long a throw's result stays on screen before the game moves on. */
const THROW_PAUSE_MS = 750;

/** A marker that sweeps 0..100 and back. Frozen while a result is being shown. */
function useSweep(speed: number, frozen: boolean) {
  const [pos, setPos] = useState(0);
  const dirRef = useRef(1);
  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => {
      setPos((p) => {
        let n = p + dirRef.current * speed;
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
  }, [speed, frozen]);
  return pos;
}

type ThrowOutcome = "bull" | "hit" | "miss";

function ThrowCallout({ outcome, bullLabel }: { outcome: ThrowOutcome | null; bullLabel: string }) {
  // Reserve the line so the layout doesn't jump when a result appears.
  return (
    <div className="flex h-8 items-center justify-center" aria-live="assertive">
      {outcome && (
        <p
          className={`trail-callout m-0 font-mono text-xl font-bold ${
            outcome === "miss" ? "trail-danger" : "trail-glow"
          }`}
        >
          {outcome === "bull" ? bullLabel : outcome === "hit" ? "HIT!" : "MISS"}
        </p>
      )}
    </div>
  );
}

function TimingGame({
  title,
  hint,
  throws,
  zoneForThrow,
  bullseyePad,
  speed,
  bullLabel = "BULLSEYE!",
  state,
  onDone,
}: {
  title: string;
  hint: string;
  throws: number;
  zoneForThrow: (i: number) => [number, number];
  bullseyePad: number;
  speed: number;
  bullLabel?: string;
  state: GameState;
  onDone: (hits: number, bullseyes: number) => void;
}) {
  const [throwIdx, setThrowIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [bulls, setBulls] = useState(0);
  const [outcome, setOutcome] = useState<ThrowOutcome | null>(null);
  const pos = useSweep(speed, outcome !== null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const [zs, ze] = zoneForThrow(throwIdx);
  const hit = pos >= zs && pos <= ze;
  const bull = pos >= zs + bullseyePad && pos <= ze - bullseyePad;
  const locked = outcome !== null;
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-1 p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">{title}</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          Throw {Math.min(throwIdx + 1, throws)} of {throws} - Hits: {hits}
        </p>
      </div>
      <MiniStats state={state} />
      <div className="trail-panel p-4">
        <div className="relative h-10 w-full overflow-hidden rounded border border-current">
          <div
            className="trail-target absolute inset-y-0"
            style={{ left: `${zs}%`, width: `${ze - zs}%` }}
          />
          <div
            className="trail-marker absolute inset-y-0 w-[3px]"
            style={{ left: `${pos}%` }}
          />
        </div>
        <ThrowCallout outcome={outcome} bullLabel={bullLabel} />
        <p className="trail-dim m-0 text-center font-mono text-xs">{hint}</p>
      </div>
      <TrailButton
        primary
        silent
        disabled={locked}
        onClick={() => {
          if (locked) return;
          const result: ThrowOutcome = bull ? "bull" : hit ? "hit" : "miss";
          if (result === "miss") sfx.miss();
          else sfx.hit();
          const nh = hits + (hit ? 1 : 0);
          const nb = bulls + (bull ? 1 : 0);
          setHits(nh);
          setBulls(nb);
          setOutcome(result);
          timer.current = setTimeout(() => {
            if (throwIdx + 1 >= throws) {
              onDone(nh, nb);
            } else {
              setThrowIdx(throwIdx + 1);
              setOutcome(null);
            }
          }, THROW_PAUSE_MS);
        }}
      >
        <span className="text-center font-bold">THROW</span>
      </TrailButton>
    </div>
  );
}

const CHUG_SECONDS = 5;

function ChugGame({ state, onDone }: { state: GameState; onDone: (taps: number) => void }) {
  // The clock starts on the first tap, not on arrival, so the player is never
  // already losing time while the screen is still sinking in.
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [taps, setTaps] = useState(0);
  const [msLeft, setMsLeft] = useState(CHUG_SECONDS * 1000);
  const tapsRef = useRef(0);
  const onDoneRef = useRef(onDone);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; end?: ReturnType<typeof setTimeout> }>({});
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  useEffect(() => {
    const t = timers.current;
    return () => {
      if (t.tick) clearInterval(t.tick);
      if (t.end) clearTimeout(t.end);
    };
  }, []);

  const start = () => {
    const endAt = Date.now() + CHUG_SECONDS * 1000;
    setPhase("running");
    timers.current.tick = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      setMsLeft(left);
      if (left <= 0) {
        if (timers.current.tick) clearInterval(timers.current.tick);
        setPhase("done");
        timers.current.end = setTimeout(() => onDoneRef.current(tapsRef.current), THROW_PAUSE_MS);
      }
    }, 50);
  };

  const label =
    phase === "ready"
      ? "TAP TO START"
      : phase === "running"
        ? "CHUG"
        : "TIME";
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-1 p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">DAB CHUG</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          {phase === "ready"
            ? `${CHUG_SECONDS}s on the clock. It starts on your first tap.`
            : phase === "done"
              ? `Time! ${taps} chugs.`
              : `${(msLeft / 1000).toFixed(1)}s left - ${taps} chugs`}
        </p>
      </div>
      <MiniStats state={state} />
      <div className="trail-panel p-4">
        <div className="trail-bar h-3 w-full">
          <div
            className="trail-bar-fill h-full"
            style={{ width: `${(msLeft / (CHUG_SECONDS * 1000)) * 100}%`, transition: "none" }}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={phase === "done"}
        onClick={() => {
          if (phase === "done") return;
          if (phase === "ready") start();
          sfx.chug();
          tapsRef.current += 1;
          setTaps(tapsRef.current);
        }}
        className="trail-btn trail-btn-primary mx-auto block min-h-[96px] w-full max-w-xs rounded-full font-mono text-2xl font-bold"
      >
        {label}
      </button>
      <p className="trail-dim m-0 text-center font-mono text-xs">
        Mash it. As many Dabs as possible.
      </p>
    </div>
  );
}

function MinigameScreen({
  state,
  onDone,
}: {
  state: GameState;
  onDone: (r: MinigameResult) => void;
}) {
  const kind = state.minigame;
  const barName = state.detour?.name ?? "Detour";
  if (kind === "darts") {
    return (
      <TimingGame
        state={state}
        title={`${barName}: DARTS`}
        hint="Stop the marker in the zone. Center is bullseye."
        throws={3}
        zoneForThrow={() => [44, 56]}
        bullseyePad={4}
        speed={3.2}
        onDone={(hits, bulls) =>
          onDone({
            beers: hits * 2 + bulls,
            dignity: bulls * 2,
            wobbles: 0,
            text: `Darts at ${barName}: ${hits}/3 hits${bulls > 0 ? `, ${bulls} bullseye${bulls > 1 ? "s" : ""}` : ""}. +${hits * 2 + bulls} beers.`,
          })
        }
      />
    );
  }
  if (kind === "batting") {
    return (
      <TimingGame
        state={state}
        title={`${barName}: BATTING CAGES`}
        hint="Swing when the marker crosses the plate."
        bullLabel="HOME RUN!"
        throws={3}
        zoneForThrow={() => [42, 58]}
        bullseyePad={5}
        speed={4.5}
        onDone={(hits, bulls) =>
          onDone({
            beers: hits * 2 + bulls * 2,
            dignity: bulls * 2,
            wobbles: 0,
            text: `Batting cages: ${hits}/3 hits${bulls > 0 ? `, ${bulls} home run${bulls > 1 ? "s" : ""}` : ""}. +${hits * 2 + bulls * 2} beers.`,
          })
        }
      />
    );
  }
  if (kind === "pool") {
    return (
      <TimingGame
        state={state}
        title={`${barName}: POOL`}
        hint="The table gets tougher every shot. The zone shrinks."
        bullLabel="CLEAN POT!"
        throws={3}
        zoneForThrow={(i) => [40 + i * 2, 60 - i * 2]}
        bullseyePad={3}
        speed={2.8}
        onDone={(hits, bulls) =>
          onDone({
            beers: hits * 3 + bulls,
            dignity: hits === 3 ? 5 : 0,
            wobbles: 0,
            text: `Pool at ${barName}: ${hits}/3${hits === 3 ? ", run the table" : ""}. +${hits * 3 + bulls} beers.`,
          })
        }
      />
    );
  }
  if (kind === "chug") {
    return (
      <ChugGame
        state={state}
        onDone={(taps) => {
          const beers = Math.min(8, Math.floor(taps / 4));
          onDone({
            beers,
            dignity: -5,
            wobbles: 1,
            text: `${taps} chugs at ${barName}. +${beers} Dab beers, -5 dignity, and the room spins.`,
          });
        }}
      />
    );
  }
  if (kind === "trumpet") {
    return (
      <TimingGame
        state={state}
        title={`${barName}: TRUMPET SOLO`}
        hint="The solo is peaking. Do not spill. Do not breathe."
        bullLabel="PERFECT!"
        throws={3}
        zoneForThrow={() => [46, 54]}
        bullseyePad={2}
        speed={3.8}
        onDone={(hits, bulls) =>
          onDone({
            beers: hits * 2 + bulls,
            dignity: hits * 2,
            wobbles: 0,
            text: `Trumpet solo survived: ${hits}/3 steady${bulls > 0 ? `, ${bulls} perfect` : ""}. +${hits * 2 + bulls} beers, +${hits * 2} dignity.`,
          })
        }
      />
    );
  }
  return null;
}

function LandmarkScreen({
  state,
  onToast,
  onPong,
  onRoulette,
  onOpenShop,
  onBuy,
  onRest,
  onLeave,
}: {
  state: GameState;
  onToast: (i: number) => void;
  onPong: () => void;
  onRoulette: () => void;
  onOpenShop: () => void;
  onBuy: (id: string) => void;
  onRest: () => void;
  onLeave: () => void;
}) {
  const [toasting, setToasting] = useState(false);
  const [shopping, setShopping] = useState(false);
  const lm = state.landmark;
  if (!lm) return null;
  const stock = state.shopStock ?? [];
  const openShop = () => {
    onOpenShop();
    setShopping(true);
  };
  const result = [state.pongResult, state.landmarkResult].filter(Boolean).join(" ");
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-2 p-4 text-center">
        <p className="trail-dim m-0 font-mono text-xs tracking-widest">LANDMARK REACHED</p>
        <h2 className="trail-glow m-0 font-mono text-2xl font-bold">{lm.name}</h2>
        <p className="trail-dim m-0 font-mono text-sm">{lm.year}</p>
        <p className="m-0 font-mono text-sm leading-relaxed">{lm.blurb}</p>
      </div>
      <StatusPanel state={state} />
      {result && (
        <div key={result} className="trail-panel trail-flash p-4" aria-live="polite">
          <p className="trail-glow m-0 font-mono text-sm leading-relaxed">{result}</p>
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
              silent
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
      ) : shopping ? (
        <div className="space-y-2">
          <p className="m-0 font-mono text-sm trail-dim">
            Today&apos;s stock (you have ${state.money}):
          </p>
          {shopItemsForTurn(state.turn)
            .filter((item) => stock.includes(item.id))
            .map((item) => {
              const cantAfford = state.money < item.cost;
              return (
                <TrailButton
                  key={item.id}
                  disabled={cantAfford}
                  silent
                  onClick={() => {
                    sfx.coin();
                    onBuy(item.id);
                    setShopping(false);
                  }}
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
          <TrailButton onClick={() => setShopping(false)}>
            <span className="text-sm">Never mind</span>
          </TrailButton>
        </div>
      ) : (
        <div className="space-y-2">
          {!state.toastUsed && (
            <TrailButton onClick={() => setToasting(true)}>
              <span className="font-bold">1. Give a toast</span>
              <br />
              <span className="trail-dim text-xs">Rally the crew. 70 percent glory. Once per stop.</span>
            </TrailButton>
          )}
          {!state.pongUsed && (
            <TrailButton onClick={onPong}>
              <span className="font-bold">2. Play beer pong</span>
              <br />
              <span className="trail-dim text-xs">3 throws. +2 beers per hit. Once per stop.</span>
            </TrailButton>
          )}
          {!state.rouletteUsed && (
            <TrailButton onClick={onRoulette}>
              <span className="font-bold">3. Shot roulette</span>
              <br />
              <span className="trail-dim text-xs">Six shots, one bad. Push your luck. Once per stop.</span>
            </TrailButton>
          )}
          {lm.shop && (
            <TrailButton onClick={openShop}>
              <span className="font-bold">4. Browse the shop</span>
              <br />
              <span className="trail-dim text-xs">Stock varies. Supplies for the trail.</span>
            </TrailButton>
          )}
          <TrailButton onClick={onRest}>
            <span className="font-bold">5. Rest the crew</span>
            <br />
            <span className="trail-dim text-xs">Skip drinking a turn. Sober up, +10 dignity.</span>
          </TrailButton>
          <TrailButton primary onClick={onLeave}>
            <span className="font-bold">6. Keep moving</span>
          </TrailButton>
        </div>
      )}
    </div>
  );
}

function PongScreen({
  state,
  onThrow,
}: {
  state: GameState;
  onThrow: (hit: boolean) => void;
}) {
  const [outcome, setOutcome] = useState<ThrowOutcome | null>(null);
  const pos = useSweep(2.6, outcome !== null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const hit = pos >= 42 && pos <= 58;
  const locked = outcome !== null;
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-1 p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">BEER PONG</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          Throws left: {state.pongThrowsLeft} - Hits: {state.pongHits}
        </p>
      </div>
      <MiniStats state={state} />
      <div className="trail-panel p-4">
        <div className="relative h-10 w-full overflow-hidden rounded border border-current">
          <div className="trail-target absolute inset-y-0" style={{ left: "42%", width: "16%" }} />
          <div
            className="trail-marker absolute inset-y-0 w-[3px]"
            style={{ left: `${pos}%` }}
          />
        </div>
        <ThrowCallout outcome={outcome} bullLabel="SPLASH!" />
        <p className="trail-dim m-0 text-center font-mono text-xs">
          Stop the marker in the zone, then throw.
        </p>
      </div>
      <TrailButton
        primary
        silent
        disabled={locked}
        onClick={() => {
          if (locked) return;
          if (hit) sfx.hit();
          else sfx.miss();
          setOutcome(hit ? "hit" : "miss");
          const landed = hit;
          timer.current = setTimeout(() => {
            onThrow(landed);
            setOutcome(null);
          }, THROW_PAUSE_MS);
        }}
      >
        <span className="text-center font-bold">THROW</span>
      </TrailButton>
    </div>
  );
}

function RouletteScreen({
  state,
  onTake,
  onLeave,
}: {
  state: GameState;
  onTake: (slot: number) => void;
  onLeave: () => void;
}) {
  const done = state.rouletteUsed;
  const taken = state.rouletteTaken.length;
  // The engine logs every shot, so the last log line is the shot just taken.
  const lastShot = taken > 0 ? state.log[state.log.length - 1] : null;
  return (
    <div className="space-y-4">
      <div className="trail-panel space-y-1 p-4 text-center">
        <h2 className="trail-glow m-0 font-mono text-xl font-bold">SHOT ROULETTE</h2>
        <p className="trail-dim m-0 font-mono text-sm">
          Six shots. One is the bad one. +2 beers per clean shot.
          <br />
          Take all five clean for a Daredevil bonus. Walk away anytime, but you only get one run at the table per stop.
        </p>
      </div>
      <MiniStats state={state} />
      <div className="trail-panel p-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((slot) => {
            const isTaken = state.rouletteTaken.includes(slot);
            const isBad = done && slot === state.rouletteBad;
            return (
              <button
                key={slot}
                type="button"
                disabled={isTaken || done}
                onClick={() => {
                  if (!allowActivation()) return;
                  sfx.click();
                  onTake(slot);
                }}
                aria-label={isTaken ? `Shot ${slot + 1}, taken` : `Take shot ${slot + 1}`}
                className={`flex min-h-[64px] items-center justify-center rounded-lg border font-mono text-2xl ${
                  isBad
                    ? "trail-danger border-current"
                    : isTaken
                      ? "trail-dim opacity-40"
                      : "trail-btn"
                }`}
              >
                {isBad ? "X" : isTaken ? "OK" : "?"}
              </button>
            );
          })}
        </div>
        {(state.rouletteResult || lastShot) && (
          <p
            key={taken}
            className="trail-glow trail-callout mb-0 mt-4 text-center font-mono text-sm"
            aria-live="polite"
          >
            {state.rouletteResult ?? lastShot}
          </p>
        )}
      </div>
      <TrailButton primary onClick={onLeave}>
        <span className="font-bold">
          {done ? "BACK TO THE LANDMARK" : "WALK AWAY"}
        </span>
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [newBadges] = useState<string[]>(() =>
    unlockAchievements(evaluateAchievements(state))
  );
  const cls = getClass(state.classId);

  useEffect(() => {
    if (state.won) sfx.win();
    else sfx.lose();
  }, [state.won]);

  const handleSave = () => {
    if (saveStatus !== "idle") return;
    const entry: HighScore = {
      name: name.trim().slice(0, 16) || "Traveler",
      score: state.score,
      beers: state.beers,
      className: cls.name,
      won: state.won,
      date: new Date().toISOString().slice(0, 10),
    };
    saveScore(entry);
    setSaveStatus("saving");
    // Wait for the upload before showing the board, or the new score isn't on it yet.
    submitTrailScore({
      name: entry.name,
      score: entry.score,
      beers: entry.beers,
      class: cls.name,
      won: entry.won,
    })
      .catch(() => undefined)
      .finally(() => setSaveStatus("saved"));
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

      {newBadges.length > 0 && (
        <div className="trail-panel mx-auto w-full max-w-md space-y-1 p-4">
          <p className="trail-glow m-0 mb-2 text-center font-mono text-sm font-bold">
            NEW BADGES
          </p>
          {ACHIEVEMENTS.filter((a) => newBadges.includes(a.id)).map((a) => (
            <p key={a.id} className="m-0 font-mono text-xs">
              <span className="font-bold">{a.name}</span>
              <span className="trail-dim"> - {a.desc}</span>
            </p>
          ))}
        </div>
      )}

      {saveStatus === "saved" ? (
        <div className="space-y-3">
          <p className="trail-glow trail-flash m-0 font-mono text-sm font-bold">
            Legend saved: {name.trim().slice(0, 16) || "Traveler"}, {state.score} pts.
          </p>
          <HighScoreTable />
        </div>
      ) : (
        <form
          className="mx-auto flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            disabled={saveStatus === "saving"}
            aria-label="Your legend name"
            placeholder="Your legend name"
            className="trail-input min-h-[44px] flex-1 px-3 py-2 font-mono text-base"
          />
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="trail-btn trail-btn-primary min-h-[44px] shrink-0 px-5 py-2 font-mono"
          >
            {saveStatus === "saving" ? "SAVING..." : "SAVE"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          if (!allowActivation()) return;
          sfx.click();
          onRestart();
        }}
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
  const [confirmQuit, setConfirmQuit] = useState(false);

  // Track stat changes so every screen can show what just happened (+4 beers, -5 dignity).
  const stats =
    state && state.screen !== "setup"
      ? { beers: state.beers, money: state.money, dignity: state.dignity }
      : null;
  const [prevStats, setPrevStats] = useState(stats);
  const [delta, setDelta] = useState<StatDelta | null>(null);
  if (
    prevStats?.beers !== stats?.beers ||
    prevStats?.money !== stats?.money ||
    prevStats?.dignity !== stats?.dignity
  ) {
    setPrevStats(stats);
    if (prevStats && stats) {
      setDelta((d) => ({
        beers: stats.beers - prevStats.beers,
        money: stats.money - prevStats.money,
        dignity: stats.dignity - prevStats.dignity,
        k: (d?.k ?? 0) + 1,
      }));
    } else {
      setDelta(null);
    }
  }
  useEffect(() => {
    if (!delta) return;
    const id = setTimeout(() => setDelta(null), 1700);
    return () => clearTimeout(id);
  }, [delta]);

  // A new screen (or a freshly shown result) should start at the top, not wherever
  // the last button press left the scroll position.
  const scrollKey = `${state?.screen ?? "title"}|${state?.eventResult ? 1 : 0}|${state?.detourResult ? 1 : 0}|${state?.landmarkResult ?? ""}|${state?.pongResult ?? ""}`;
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [scrollKey]);

  const continueFromEvent = () =>
    setState((s) => {
      if (!s) return s;
      if (s.over) return { ...s, screen: "over" as const };
      return { ...s, screen: "travel" as const, event: null, eventResult: null };
    });

  return (
    <div className="trail-root min-h-screen">
      <div className="trail-scanlines pointer-events-none fixed inset-0 z-10" aria-hidden />
      <DeltaContext.Provider value={delta}>
      <main
        key={state?.screen ?? "title"}
        className="trail-screen relative z-0 mx-auto w-full max-w-2xl px-4 pb-16 pt-8"
      >
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
                aria-label={muted ? "Unmute sound" : "Mute sound"}
                className="trail-dim min-h-[44px] px-2 underline"
              >
                {muted ? "sound off" : "sound on"}
              </button>
              {confirmQuit ? (
                <>
                  <span className="trail-danger">lose this run?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmQuit(false);
                      setState(null);
                    }}
                    className="trail-danger min-h-[44px] px-2 font-bold underline"
                  >
                    yes, quit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmQuit(false)}
                    className="trail-dim min-h-[44px] px-2 underline"
                  >
                    keep playing
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmQuit(true)}
                  className="trail-dim min-h-[44px] px-2 underline"
                >
                  quit to title
                </button>
              )}
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
        {state?.screen === "detour" && (
          <DetourScreen
            state={state}
            onTake={() => setState((s) => (s ? takeDetour(s) : s))}
            onRoast={(i) => setState((s) => (s ? resolveRoast(s, i) : s))}
            onSkip={() => setState((s) => (s ? skipDetour(s) : s))}
          />
        )}
        {state?.screen === "minigame" && (
          <MinigameScreen
            state={state}
            onDone={(r: MinigameResult) => setState((s) => (s ? resolveMinigame(s, r) : s))}
          />
        )}
        {state?.screen === "landmark" && (
          <LandmarkScreen
            state={state}
            onToast={(i) => setState((s) => (s ? giveToast(s, i) : s))}
            onPong={() => setState((s) => (s ? startPong(s) : s))}
            onRoulette={() => setState((s) => (s ? startRoulette(s) : s))}
            onOpenShop={() => setState((s) => (s ? openShop(s) : s))}
            onBuy={(id) => setState((s) => (s ? buyItem(s, id) : s))}
            onRest={() => setState((s) => (s ? advanceTurn(s, true) : s))}
            onLeave={() => setState((s) => (s ? leaveLandmark(s) : s))}
          />
        )}
        {state?.screen === "pong" && (
          <PongScreen
            state={state}
            onThrow={(hit) => setState((s) => (s ? throwPong(s, hit) : s))}
          />
        )}
        {state?.screen === "roulette" && (
          <RouletteScreen
            state={state}
            onTake={(slot) => setState((s) => (s ? takeRouletteShot(s, slot) : s))}
            onLeave={() => setState((s) => (s ? leaveRoulette(s) : s))}
          />
        )}
        {state?.screen === "over" && (
          <OverScreen
            state={state}
            onRestart={() => setState({ screen: "setup" } as GameState)}
          />
        )}
      </main>
      </DeltaContext.Provider>
    </div>
  );
}
