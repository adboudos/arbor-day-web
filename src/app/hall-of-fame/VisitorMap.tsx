"use client";

import { useEffect, useRef } from "react";
import { MAP_FRAME_CLASS, addTiles, esc, loadLeaflet, pinIcon, type Leaflet } from "@/lib/leaflet";
import { fmtMiles, type OutOfTowner } from "@/data/outOfTowners";

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
      L.marker([v.lat, v.lng], { icon: pinIcon(L, "&#9992;") })
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
        addTiles(L, map);
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
      className={MAP_FRAME_CLASS}
      role="img"
      aria-label="Map with pins for every out-of-towner's hometown"
    />
  );
}
