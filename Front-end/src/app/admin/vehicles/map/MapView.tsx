"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type VehicleLocation = {
  id: number;
  marque: string;
  model: string;
  device_id: string | null;
  picture: string | null;
  location: { latitude: number; longitude: number; speed: number | null; heading: number | null; updated_at: string } | null;
};

type Props = {
  markers: { id: number; lat: number; lng: number; label: string; data: VehicleLocation }[];
  selectedId: number | null;
  onSelect: (v: VehicleLocation) => void;
};

const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#395886;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const selectedIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#f39c12;border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(243,156,18,.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function MapView({ markers, selectedId, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [31.6295, -7.9811],
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (markers.length === 0) return;
    const bounds: L.LatLngBoundsExpression = [];
    markers.forEach((m) => {
      const icon = m.id === selectedId ? selectedIcon : defaultIcon;
      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindTooltip(m.label, { direction: "top", offset: [0, -20] })
        .on("click", () => onSelect(m.data));
      markersRef.current.push(marker);
      bounds.push([m.lat, m.lng]);
    });
    if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [markers, selectedId, onSelect]);

  return <div ref={containerRef} className="w-full h-full" />;
}
