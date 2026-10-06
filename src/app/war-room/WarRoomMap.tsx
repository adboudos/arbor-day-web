"use client";

import { useEffect, useRef } from "react";
import { MAP_FRAME_CLASS, addTiles, esc, loadLeaflet, pinIcon, type Leaflet } from "@/lib/leaflet";
import { jokeVenues } from "@/data/warRoom";

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
        addTiles(L, map);
        const bounds = L.latLngBounds([]);
        jokeVenues.forEach((v) => {
          L.marker([v.lat, v.lng], { icon: pinIcon(L, "&#127867;") })
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
      className={MAP_FRAME_CLASS}
      role="img"
      aria-label="World map with pins for every venue under consideration"
    />
  );
}
