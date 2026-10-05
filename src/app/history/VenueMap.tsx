"use client";

import { useEffect, useRef } from "react";

export interface MapPin {
  year: number;
  venue: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

type Leaflet = any;

function loadLeaflet(): Promise<Leaflet> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.L) {
      resolve(w.L);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error("Leaflet failed to load"));
    document.body.appendChild(script);
  });
}

/**
 * Interactive Chicago map with a numbered pin per past venue.
 * Pins come from the editions data — nothing is hardcoded here.
 */
export default function VenueMap({ pins }: { pins: MapPin[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: Leaflet | null = null;
    let cancelled = false;

    loadLeaflet()
      .then((L: Leaflet) => {
        if (cancelled || !ref.current) return;
        // Guard against double-init in React StrictMode.
        if ((ref.current as any)._leaflet_id) return;

        map = L.map(ref.current, { scrollWheelZoom: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const bounds = L.latLngBounds([]);
        pins.forEach((pin) => {
          const icon = L.divIcon({
            className: "venue-pin",
            html: `<span>&#8217;${String(pin.year).slice(2)}</span>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
          L.marker([pin.lat, pin.lng], { icon })
            .addTo(map)
            .bindPopup(`<strong>${pin.year} &mdash; ${pin.venue}</strong><br />${pin.neighborhood}`);
          bounds.extend([pin.lat, pin.lng]);
        });
        if (pins.length > 0) {
          map.fitBounds(bounds.pad(0.4));
        } else {
          map.setView([41.88, -87.63], 11);
        }
      })
      .catch(() => {
        // Map is decorative; the timeline below stands on its own.
      });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [pins]);

  return (
    <div
      ref={ref}
      className="venue-map"
      role="img"
      aria-label="Map of Chicago with pins for every past Arbor Day party venue"
    />
  );
}
