"use client";

/**
 * Shared Leaflet loader — pulls Leaflet from the unpkg CDN once and caches it
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
