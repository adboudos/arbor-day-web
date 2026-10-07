"use client";

import { useEffect, useRef } from "react";
import { CrewMember, LANDMARKS } from "./data";

// Pixel-art trail scene: the crew walks a Chicago skyline from dusk (9 PM)
// to deep night (midnight). Pure canvas, no image assets.

const W = 480;
const H = 240;
const GROUND_Y = 200;

const SHIRTS = ["#ffb000", "#7dd87d", "#6ab0ff", "#c792ea", "#ff6b6b"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number }[];
}

function makeBuildings(seed: number, count: number, minH: number, maxH: number): Building[] {
  const rnd = seededRandom(seed);
  const out: Building[] = [];
  let x = -20;
  while (x < W + 20) {
    const w = 24 + Math.floor(rnd() * 36);
    const h = minH + Math.floor(rnd() * (maxH - minH));
    const windows: { x: number; y: number }[] = [];
    for (let wy = GROUND_Y - h + 8; wy < GROUND_Y - 8; wy += 10) {
      for (let wx = x + 5; wx < x + w - 5; wx += 9) {
        if (rnd() < 0.28) windows.push({ x: wx, y: wy });
      }
    }
    out.push({ x, w, h, windows });
    x += w + Math.floor(rnd() * 18);
  }
  return out;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number) {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
}

function drawPerson(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
  bob: number,
  lying: boolean
) {
  g.fillStyle = lying ? "#5a5a5a" : shirt;
  if (lying) {
    // knocked out: horizontal
    g.fillRect(x - 6, y - 2, 12, 4);
    g.fillStyle = "#8a8a8a";
    g.fillRect(x + 4, y - 3, 3, 5);
    return;
  }
  const yy = y - bob;
  // legs
  g.fillStyle = "#2a2a3a";
  const legSwing = Math.round(bob * 1.5);
  g.fillRect(x - 3, yy - 6, 2, 6 - legSwing);
  g.fillRect(x + 1, yy - 6, 2, 6 + legSwing);
  // body
  g.fillStyle = shirt;
  g.fillRect(x - 3, yy - 12, 6, 7);
  // head
  g.fillStyle = "#e8b98a";
  g.fillRect(x - 2, yy - 16, 4, 4);
}

export default function TrailCanvas({
  turn,
  crew,
}: {
  turn: number;
  crew: CrewMember[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ crewX: 40, dash: 0, t: 0 });
  const propsRef = useRef({ turn, crew });
  useEffect(() => {
    propsRef.current = { turn, crew };
  }, [turn, crew]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    const far = makeBuildings(1234, 14, 40, 90);
    const near = makeBuildings(987, 10, 60, 130);
    const stars = seededRandom(42);
    const starPts = Array.from({ length: 46 }, () => ({
      x: stars() * W,
      y: stars() * 130,
      r: stars() < 0.2 ? 2 : 1,
    }));

    let raf = 0;
    const loop = () => {
      const { turn: t, crew: c } = propsRef.current;
      const st = stateRef.current;
      const night = Math.min(1, t / 12);
      st.t += 0.016;
      const targetX = 44 + (t / 12) * (W - 120);
      st.crewX = lerp(st.crewX, targetX, 0.06);
      st.dash = (st.dash + 0.6) % 24;

      // sky
      const sky = g.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, lerpColor([42, 26, 58], [5, 5, 16], night));
      sky.addColorStop(1, lerpColor([255, 154, 60], [16, 16, 38], night));
      g.fillStyle = sky;
      g.fillRect(0, 0, W, GROUND_Y);

      // stars
      g.fillStyle = "#ffffff";
      for (const s of starPts) {
        g.globalAlpha = night * 0.9;
        g.fillRect(s.x, s.y, s.r, s.r);
      }
      g.globalAlpha = 1;

      // moon
      g.fillStyle = "#f6f0dc";
      g.globalAlpha = 0.25 + night * 0.75;
      const mx = W - 60;
      const my = 30 + night * 14;
      g.fillRect(mx - 6, my - 6, 12, 12);
      g.globalAlpha = 1;

      // far buildings
      g.fillStyle = lerpColor([30, 22, 44], [16, 16, 30], night);
      for (const b of far) {
        g.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
      }
      // lit windows on far buildings
      g.fillStyle = "#ffb000";
      g.globalAlpha = 0.25 + night * 0.65;
      for (const b of far) {
        for (const win of b.windows) g.fillRect(win.x, win.y, 3, 4);
      }
      g.globalAlpha = 1;

      // near buildings
      g.fillStyle = lerpColor([18, 14, 30], [8, 8, 16], night);
      for (const b of near) {
        g.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
      }
      // willis-tower-like antenna on the tallest near building
      const tall = near.reduce((a, b) => (b.h > a.h ? b : a), near[0]);
      if (tall) {
        const ax = tall.x + tall.w / 2;
        g.fillRect(ax - 1, GROUND_Y - tall.h - 22, 2, 22);
        g.fillStyle = "#ff5a3c";
        g.globalAlpha = 0.6 + 0.4 * Math.sin(st.t * 4);
        g.fillRect(ax - 1, GROUND_Y - tall.h - 24, 2, 2);
        g.globalAlpha = 1;
      }

      // ground
      g.fillStyle = "#0a0908";
      g.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      g.fillStyle = "rgba(255,176,0,0.35)";
      for (let dx = -24; dx < W + 24; dx += 24) {
        g.fillRect(dx + st.dash, GROUND_Y + 18, 12, 2);
      }

      // landmark flags
      for (const lm of LANDMARKS) {
        if (lm.turn === 0 || lm.final) continue;
        const fx = 44 + (lm.turn / 12) * (W - 120);
        const reached = t >= lm.turn;
        g.fillStyle = reached ? "#ffb000" : "rgba(255,176,0,0.35)";
        g.fillRect(fx, GROUND_Y - 34, 2, 34);
        g.fillRect(fx + 2, GROUND_Y - 34, 12, 8);
        g.fillStyle = "#0d0a06";
        g.font = "7px monospace";
        g.fillText(lm.year, fx - 8, GROUND_Y + 34);
      }

      // finish arch at the 2027 venue
      const finX = 44 + (W - 120);
      g.fillStyle = "#ffb000";
      g.fillRect(finX - 2, GROUND_Y - 44, 4, 44);
      g.fillRect(finX - 2, GROUND_Y - 44, 44, 4);
      g.fillRect(finX + 38, GROUND_Y - 44, 4, 44);
      g.fillStyle = "#0d0a06";
      g.font = "7px monospace";
      g.fillText("2027", finX + 4, GROUND_Y - 32);

      // crew
      c.forEach((m, i) => {
        const x = st.crewX - i * 15;
        const lying = m.status === "gone";
        const wobble = m.status === "drunk" ? 2.2 : m.status === "tipsy" ? 1.2 : 0.7;
        const bob = lying ? 0 : Math.abs(Math.sin(st.t * 6 + i * 1.3)) * wobble;
        drawPerson(g, x, GROUND_Y, SHIRTS[i % SHIRTS.length], bob, lying);
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-label="Pixel-art view of the crew walking the Chicago skyline trail"
      className="trail-canvas h-auto w-full"
    />
  );
}
