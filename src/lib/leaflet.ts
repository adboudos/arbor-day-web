"use client";

/**
 * Shared Leaflet loader. Pulls Leaflet from the unpkg CDN once and caches it
 * on window. Extracted so multiple map components don't each reinvent it.
 */

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// Leaflet is loaded from a CDN at runtime, so it can't be typed statically.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Leaflet = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

let pending: Promise<Leaflet> | null = null;

export function loadLeaflet(): Promise<Leaflet> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet needs a browser"));
  }
  const w = window as unknown as { L?: Leaflet };
  if (w.L) return Promise.resolve(w.L);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as unknown as { L: Leaflet }).L);
    script.onerror = () => {
      pending = null;
      reject(new Error("Leaflet failed to load"));
    };
    document.body.appendChild(script);
  });
  return pending;
}

/** Classes for the rounded frame every map renders into. */
export const MAP_FRAME_CLASS =
  // `!` on bg and font: Leaflet's own stylesheet loads at runtime, unlayered, and would otherwise win.
  "relative z-0 h-72 overflow-hidden rounded-2xl border border-cream/20 bg-forest-deep! [font-family:inherit]! shadow-card min-[46rem]:h-88";

/** Round amber-ringed map marker. `flex!` beats Leaflet's `.leaflet-marker-icon { display: block }`. */
const PIN_CLASS =
  "flex! items-center justify-center rounded-full border-3 border-amber bg-forest text-[.95rem] leading-none font-black text-cream shadow-pin";

/** A 38px round pin with `html` (already escaped) centered inside. */
export function pinIcon(L: Leaflet, html: string): Leaflet {
  return L.divIcon({
    className: PIN_CLASS,
    html: `<span>${html}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

/** Escape user text before it goes into a popup's HTML. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** OpenStreetMap tiles, shared by every map. */
export function addTiles(L: Leaflet, map: Leaflet): void {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}
