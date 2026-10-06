"use client";

import { useSyncExternalStore } from "react";

const TARGET = new Date(2027, 3, 30, 0, 0, 0).getTime(); // Apr 30, 2027 (local time)

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** Ticks once a second. Snapshots are rounded to the second so they stay stable between ticks. */
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => null;

const row = "flex min-h-21 justify-center gap-2.5";

export default function Countdown() {
  // null on the server and during hydration, so the markup matches before the clock starts.
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  if (now === null) return <div className={row} aria-hidden="true" />;
  if (now >= TARGET) {
    return <div className={`${row} items-center text-[1.8rem] font-bold`}>It&apos;s party day! 🌳🍻</div>;
  }

  const t = parts(TARGET - now);
  const cells: [string, number][] = [
    ["days", t.days],
    ["hrs", t.hours],
    ["min", t.minutes],
    ["sec", t.seconds],
  ];

  return (
    <div className={row} role="timer" aria-label="Time until Arbor Day">
      {cells.map(([label, n]) => (
        <div key={label} className="min-w-17 rounded-xl border border-cream/18 bg-cream/8 px-2 py-2.5">
          <b className="block text-[1.9rem] text-amber tabular-nums">{String(n).padStart(2, "0")}</b>
          <span className="text-xs tracking-[.12em] uppercase opacity-80">{label}</span>
        </div>
      ))}
    </div>
  );
}
