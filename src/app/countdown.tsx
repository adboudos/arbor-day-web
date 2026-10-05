"use client";

import { useEffect, useState } from "react";

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

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="countdown" aria-hidden="true" />;
  if (now >= TARGET) return <div className="countdown party">It&apos;s party day! 🌳🍻</div>;

  const t = parts(TARGET - now);
  const cells: [string, number][] = [
    ["days", t.days],
    ["hrs", t.hours],
    ["min", t.minutes],
    ["sec", t.seconds],
  ];

  return (
    <div className="countdown" role="timer" aria-label="Time until Arbor Day">
      {cells.map(([label, n]) => (
        <div key={label} className="cell">
          <b>{String(n).padStart(2, "0")}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
