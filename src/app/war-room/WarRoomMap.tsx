"use client";

import { useEffect, useRef } from "react";
import { loadLeaflet, type Leaflet } from "@/lib/leaflet";
import { jokeVenues } from "@/data/warRoom";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** World map with a pin for every venue under "active consideration". */
export default function WarRoomMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L: Leaflet) => {
        if (cancelled || !ref.current) return;
        if ((ref.current as unknown as { _leaflet_id?: number })._leaflet_id)
          return;
        const map = L.map(ref.current, { scrollWheelZoom: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        const bounds = L.latLngBounds([]);
        jokeVenues.forEach((v) => {
          const icon = L.divIcon({
            className: "venue-pin",
            html: `<span>&#127867;</span>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
          L.marker([v.lat, v.lng], { icon })
            .addTo(map)
            .bindPopup(
              `<strong>${esc(v.name)}</strong><br />${esc(v.location)}`,
            );
          bounds.extend([v.lat, v.lng]);
        });
        map.fitBounds(bounds.pad(0.2));
      })
      .catch(() => {
        // Map is decorative; the shortlist below stands on its own.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={ref}
      className="venue-map"
      role="img"
      aria-label="World map with pins for every venue under consideration"
    />
  );
}
