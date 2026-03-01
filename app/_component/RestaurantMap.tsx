"use client";

import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/types/restaurant";

const CLEAN_MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const CLEAN_MAP_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
const DEFAULT_ZOOM = 14;

type RestaurantMapProps = {
  restaurants: Restaurant[];
  center: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelectRestaurant: (r: Restaurant | null) => void;
};

export default function RestaurantMap({
  restaurants,
  center,
  onSelectRestaurant,
}: RestaurantMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: import("leaflet").Map;
    markers: import("leaflet").Marker[];
  } | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let mounted = true;

    import("leaflet")
      .then((leafletModule) => {
        if (!mounted || !containerRef.current) return;
        const L = leafletModule.default;
        const map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        L.tileLayer(CLEAN_MAP_TILE_URL, {
          attribution: CLEAN_MAP_ATTRIBUTION,
        }).addTo(map);
        mapRef.current = { map, markers: [] };
      })
      .catch(() => setLoadError(true));

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.markers.forEach((marker) => marker.remove());
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const { map, markers } = mapRef.current;
    markers.forEach((marker) => marker.remove());

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default;
      const pinIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [32, 52],
        iconAnchor: [16, 52],
        popupAnchor: [1, -44],
        shadowSize: [52, 52],
      });

      const nextMarkers: import("leaflet").Marker[] = [];
      restaurants.forEach((restaurant) => {
        const coords = restaurant.location?.coordinates;
        if (!coords || coords.length < 2) return;

        const [lng, lat] = coords;
        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        marker.bindPopup(
          `<strong>${restaurant.name}</strong><br/>${(restaurant.averageRating ?? 0).toFixed(1)} rating`
        );
        marker.on("click", () => onSelectRestaurant(restaurant));
        nextMarkers.push(marker);
      });

      mapRef.current = { map, markers: nextMarkers };
    });
  }, [restaurants, onSelectRestaurant]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.map.setView([center.lat, center.lng], DEFAULT_ZOOM);
  }, [center]);

  if (loadError) {
    return (
      <div className="w-full min-h-[400px] rounded-2xl border border-orange-200 bg-orange-100 flex items-center justify-center text-gray-600 text-sm">
        Map unavailable. Install leaflet: npm install leaflet react-leaflet
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[400px] rounded-2xl border border-orange-200 overflow-hidden bg-orange-50"
    />
  );
}
