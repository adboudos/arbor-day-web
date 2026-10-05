"use client";

import { useEffect, useRef } from "react";
import { loadLeaflet, type Leaflet } from "@/lib/leaflet";
import { fmtMiles, type OutOfTowner } from "@/data/outOfTowners";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Map of every inducted out-of-towner's hometown. Pins re-render when the
 * visitor list changes; the map itself is created once.
 */
export default function VisitorMap({ visitors }: { visitors: OutOfTowner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet | null>(null);
  const layerRef = useRef<Leaflet | null>(null);

  function syncPins(L: Leaflet) {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (visitors.length === 0) {
      map.setView([39.8, -98.5], 4); // blank canvas: the whole country
      return;
    }
    const bounds = L.latLngBounds([]);
    visitors.forEach((v) => {
      const icon = L.divIcon({
        className: "venue-pin",
        html: `<span>&#9992;</span>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });
      L.marker([v.lat, v.lng], { icon })
        .addTo(layer)
        .bindPopup(
          `<strong>${esc(v.name)}</strong><br />${esc(v.resolved)} &middot; ${esc(fmtMiles(v.miles))} &middot; &#8217;${String(v.year).slice(2)}`,
        );
      bounds.extend([v.lat, v.lng]);
    });
    // Keep Chicago in frame so the journey reads on the map.
    bounds.extend([41.8781, -87.6298]);
    map.fitBounds(bounds.pad(0.15));
  }

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L: Leaflet) => {
        if (cancelled || !ref.current || mapRef.current) return;
        const map = L.map(ref.current, { scrollWheelZoom: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        syncPins(L);
      })
      .catch(() => {
        // Map is decorative; the lists below stand on their own.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    loadLeaflet()
      .then((L: Leaflet) => syncPins(L))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitors]);

  return (
    <div
      ref={ref}
      className="venue-map"
      role="img"
      aria-label="Map with pins for every out-of-towner's hometown"
    />
  );
}
