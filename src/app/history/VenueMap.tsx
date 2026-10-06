"use client";

import { useEffect, useRef } from "react";
import { MAP_FRAME_CLASS, addTiles, esc, loadLeaflet, pinIcon, type Leaflet } from "@/lib/leaflet";

export interface MapPin {
  year: number;
  venue: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

/**
 * Interactive Chicago map with a numbered pin per past venue.
 * Pins come from the editions data. Nothing is hardcoded here.
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
        if ((ref.current as unknown as { _leaflet_id?: number })._leaflet_id) return;

        map = L.map(ref.current, { scrollWheelZoom: false });
        addTiles(L, map);

        const bounds = L.latLngBounds([]);
        pins.forEach((pin) => {
          L.marker([pin.lat, pin.lng], { icon: pinIcon(L, `&#8217;${String(pin.year).slice(2)}`) })
            .addTo(map)
            .bindPopup(`<strong>${pin.year}: ${esc(pin.venue)}</strong><br />${esc(pin.neighborhood)}`);
          bounds.extend([pin.lat, pin.lng]);
        });
        if (pins.length > 0) {
          map.fitBounds(bounds.pad(0.12));
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
      className={MAP_FRAME_CLASS}
      role="img"
      aria-label="Map of Chicago with pins for every past Arbor Day party venue"
    />
  );
}
