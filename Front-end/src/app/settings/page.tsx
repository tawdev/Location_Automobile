"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { motion } from "framer-motion";
import { getAuthToken } from "@/lib/tokenStorage";
import { vehicleImageUrl } from "@/lib/media";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function formatDate(d: string) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    "en_attente": "En Attente",
    "confirmée": "Confirmée",
    "terminée": "Terminée",
    "annulée": "Annulée",
  };
  return map[s?.toLowerCase()] ?? s;
}

export default function SettingsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchReservations() {
      const token = getAuthToken();
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/MyReservations`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data ?? [];
        if (!cancelled) setReservations(items.filter((r: any) => r.status !== "Annulée"));
      } catch {
        if (!cancelled) setReservations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReservations();
    return () => { cancelled = true; };
  }, []);
  return (
    <RequireAuth>
      <main className="flex-1">
        <div className="bg-[#F0F3FA] px-6 py-10 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Page title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="playfair text-4xl font-bold text-[#1e3a5f]">Param&egrave;tres</h1>
              <p className="text-gray-400 text-sm mt-1">G&eacute;rez votre compte et vos documents.</p>
            </motion.div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left column */}
              <div className="flex flex-col gap-5 w-full lg:w-72 flex-shrink-0">
                {/* Profile card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#1e3a5f]">Alexandre Dubois</h2>
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mt-1 mb-5">Membre Premium</p>
                  <button className="w-full border border-gray-300 rounded-lg py-2.5 text-xs font-semibold text-gray-600 tracking-widest uppercase hover:bg-gray-50 transition-colors">
                    <a href="/profile">
                    Modifier le profil
                    </a>
                  </button>
                </motion.div>

                {/* Required Documents card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h3 className="text-base font-semibold text-[#1e3a5f] mb-4">Documents requis</h3>
                  <div className="flex flex-col gap-3">
                    {/* Driver's License */}
                    <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Permis de conduire</p>
                          <p className="text-xs text-gray-400">Recto &amp; Verso</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>

                    {/* CIN / ID */}
                    <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">CIN / ID</p>
                          <p className="text-xs text-gray-400">Recto &amp; Verso</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right column: Active Reservations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-[#c8861a]">R&eacute;servations actives</h3>
                  <a href="/MyReservations" className="text-xs font-semibold text-[#c8861a] tracking-widest uppercase hover:underline">Historique &rarr;</a>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-[#395886] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center">
                    <p className="text-gray-400 text-sm">Aucune r&eacute;servation active.</p>
                    <button onClick={() => router.push("/vehicles")} className="mt-3 text-sm font-semibold text-[#395886] hover:underline">
                      Parcourir les v&eacute;hicules
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reservations.map((r, i) => {
                      const img = r.vehicle?.pictures?.[0]?.path
                        ? vehicleImageUrl(r.vehicle.pictures[0].path)
                        : null;
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                          className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
                        >
                          <div className="w-full sm:w-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100" style={{ minHeight: 100 }}>
                            {img ? (
                              <img src={img} alt={r.vehicle?.marque} className="w-full h-full object-cover" style={{ minHeight: 100 }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-base font-bold text-[#1e3a5f] leading-tight">
                                {r.vehicle?.marque} {r.vehicle?.model}
                              </h4>
                              <span className={`text-xs font-semibold rounded-full px-3 py-1 tracking-wide ${
                                r.status === "Confirmée"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {statusLabel(r.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              Marrakech
                            </div>
                            <div className="flex gap-8">
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">D&eacute;part</p>
                                <p className="text-sm font-semibold text-gray-800">{formatDate(r.start_date)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Retour</p>
                                <p className="text-sm font-semibold text-gray-800">{formatDate(r.end_date)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
