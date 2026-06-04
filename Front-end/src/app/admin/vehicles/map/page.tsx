"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getAuthToken } from "@/lib/tokenStorage";
import { API_BASE_URL } from "@/lib/config";
import { vehicleImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const MapWithNoSSR = dynamic(() => import("./MapView"), { ssr: false });

type VehicleLocation = {
  id: number;
  marque: string;
  model: string;
  registration: string;
  device_id: string | null;
  picture: string | null;
  location: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    updated_at: string;
  } | null;
};

export default function VehicleMapPage() {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      const token = getAuthToken();
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/admin/vehicles/location`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Échec de la récupération des données");
        const json = await res.json();
        if (!cancelled) setVehicles(json.data ?? []);
      } catch (e) {
        if (!cancelled) setError((e as { message?: string })?.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const markers = vehicles.filter((v) => v.location).map((v) => ({
    id: v.id,
    lat: v.location!.latitude,
    lng: v.location!.longitude,
    label: `${v.marque} ${v.model}`,
    data: v,
  }));

  return (
    <div className="flex gap-4 h-[calc(100vh-6rem)]">
      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-[#D5DEEF] bg-white relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="w-8 h-8 border-4 border-[#395886] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <MapWithNoSSR
          markers={markers}
          selectedId={selectedVehicle?.id ?? null}
          onSelect={(v) => setSelectedVehicle(v)}
        />
      </div>

      {/* Side panel */}
      <div className="w-80 shrink-0 rounded-xl border border-[#D5DEEF] bg-white p-4 overflow-y-auto">
        <h2 className="text-sm font-extrabold text-[#395886] uppercase tracking-wider mb-4">{t("admin.vehicle")}</h2>
        {error && <p className="text-red-600 text-xs font-bold">{error}</p>}
        <div className="flex flex-col gap-2">
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVehicle(v)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedVehicle?.id === v.id
                  ? "border-[#395886] bg-[#F0F3FA]"
                  : "border-transparent hover:bg-[#F0F3FA]"
              }`}
            >
              <div className="flex items-center gap-3">
                {v.picture ? (
                  <img src={vehicleImageUrl(v.picture)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#D5DEEF] flex items-center justify-center text-xs font-bold text-[#638ECB]">
                    {v.marque?.[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#395886] truncate">{v.marque} {v.model}</div>
                  <div className="text-[11px] font-semibold text-[#638ECB]">{v.registration}</div>
                  {v.location ? (
                    <div className="text-[10px] font-bold text-emerald-600 mt-0.5">En ligne</div>
                  ) : (
                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">{t("admin.no_position")}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedVehicle?.location && (
          <div className="mt-4 p-3 rounded-xl bg-[#F0F3FA] text-xs">
            <div className="font-bold text-[#395886] mb-2">Dernière position</div>
            <div className="flex flex-col gap-1 text-[#638ECB] font-semibold">
              <span>Lat: {selectedVehicle.location.latitude.toFixed(6)}</span>
              <span>Lng: {selectedVehicle.location.longitude.toFixed(6)}</span>
              {selectedVehicle.location.speed != null && (
                <span>Vitesse: {selectedVehicle.location.speed.toFixed(1)} km/h</span>
              )}
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(selectedVehicle.location.updated_at).toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-4 text-center font-semibold">
          Rafraîchissement automatique toutes les 15s
        </p>
      </div>
    </div>
  );
}
