"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { RequireClient } from "@/components/RequireClient";
import { motion } from "framer-motion";
import { getAuthToken } from "@/lib/tokenStorage";
import { vehicleImageUrl } from "@/lib/media";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/authContext";
import { Car, Calendar, ChevronRight, FileText, IdCard, User, Sparkles, ArrowRight, CheckCircle, AlertCircle, Clock, MapPin, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface SettingsReservation {
  id: number;
  status: string;
  start_date?: string;
  end_date?: string;
  TotalPrice?: number;
  vehicle?: {
    id: number;
    marque?: string;
    model?: string;
    pictures?: { path?: string }[];
  };
}

function formatDate(d: string | undefined, locale: string) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}



const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  confirmée: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  annulée: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  terminée: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
  en_attente: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
};



function DocRow({ icon: Icon, label, sublabel, verified, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; sublabel: string; verified: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, x: 3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-[#D5DEEF]/50 bg-white/60 hover:bg-white hover:border-[#638ECB]/30 transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${verified ? "bg-emerald-100" : "bg-[#F0F3FA]"}`}>
          <Icon className={`w-4 h-4 ${verified ? "text-emerald-600" : "text-[#638ECB]"}`} />
        </div>
        <div>
          <p className="text-sm font-extrabold text-[#395886]">{label}</p>
          <p className="text-xs font-semibold text-[#638ECB]/60">{sublabel}</p>
        </div>
      </div>
      {verified ? (
        <CheckCircle className="w-4 h-4 text-emerald-500" />
      ) : (
        <ChevronRight className="w-4 h-4 text-[#638ECB]/40" />
      )}
    </motion.button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useI18n();

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      "en_attente": t("settings.status_pending"),
      "confirmée": t("settings.status_confirmed"),
      "terminée": t("settings.status_completed"),
      "annulée": t("settings.status_cancelled"),
    };
    return map[s?.toLowerCase()] ?? s;
  };

  function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLES[status?.toLowerCase()] ?? { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {statusLabel(status)}
      </span>
    );
  }

  const [reservations, setReservations] = useState<SettingsReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchReservations() {
      const token = getAuthToken();
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/MyReservations`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data ?? [];
        if (!cancelled) setReservations(items.filter((r: SettingsReservation) => r.status !== "Annulée"));
      } catch {
        if (!cancelled) setReservations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReservations();
    return () => { cancelled = true; };
  }, []);

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const hasPermi = !!(user?.permi_recto && user?.permi_verso);
  const hasCin = !!(user?.cin_recto && user?.cin_verso);

  return (
    <RequireClient>
      <div className="min-h-screen bg-[#F0F3FA]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="relative max-w-6xl mx-auto px-6 py-14">
            <BackButton />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Sparkles className="w-4 h-4 text-[#f39c12]" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-[0.15em]">{t("reservations.dashboard")}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">{t("settings.title")}</h1>
              <p className="text-white/70 text-base font-semibold mt-2 max-w-xl">{t("settings.subtitle")}</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10 pb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-5 w-full lg:w-80 flex-shrink-0">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 p-7 flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center shadow-xl ring-4 ring-white/50">
                    <span className="text-4xl font-black text-white">{userInitial}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-black text-[#395886]">{user?.name ?? t("settings.user")}</h2>
                <p className="text-xs font-extrabold text-[#638ECB]/60 uppercase tracking-[0.12em] mt-0.5 mb-5">{t("settings.member")}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/profile")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-xs font-extrabold tracking-wider shadow-lg shadow-[#395886]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  {t("settings.edit_profile")}
                </motion.button>
              </motion.div>

              {/* Documents Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 p-7"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-[#395886]">{t("settings.documents_card")}</h3>
                  {(hasPermi && hasCin) ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-full px-3 py-1">
                      <CheckCircle className="w-3 h-3" /> {t("settings.complete")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-full px-3 py-1">
                      <AlertCircle className="w-3 h-3" /> {t("settings.pending_status")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <DocRow icon={FileText} label={t("settings.license_row")} sublabel={t("settings.front_back")} verified={hasPermi} onClick={() => router.push("/profile")} />
                  <DocRow icon={IdCard} label={t("settings.cin_row")} sublabel={t("settings.front_back")} verified={hasCin} onClick={() => router.push("/profile")} />
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 min-w-0"
            >
              <div className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden">
                <div className="px-7 py-5 border-b border-[#D5DEEF]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f39c12] to-[#e08e0b] flex items-center justify-center shadow-md">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#395886]">{t("settings.active_reservations")}</h3>
                      <p className="text-[11px] font-semibold text-[#638ECB]/70">{t("settings.active_reservations_subtitle")}</p>
                    </div>
                  </div>
                  <motion.a
                    whileHover={{ x: 3 }}
                    href="/MyReservations"
                    className="text-xs font-extrabold text-[#f39c12] hover:text-[#e08e0b] transition-colors flex items-center gap-1"
                  >
                    {t("settings.history_link")} <ArrowRight className="w-3 h-3" />
                  </motion.a>
                </div>

                <div className="px-7 py-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="relative">
                        <div className="w-10 h-10 border-3 border-[#D5DEEF] rounded-full" />
                        <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-t-[#638ECB] rounded-full animate-spin" />
                      </div>
                      <span className="ml-3 text-sm font-extrabold text-[#638ECB]">{t("settings.loading")}</span>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-14 h-14 rounded-2xl bg-[#F0F3FA] flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-7 h-7 text-[#638ECB]" />
                      </div>
                      <p className="text-base font-black text-[#395886]">{t("settings.no_active")}</p>
                      <p className="text-sm font-semibold text-[#638ECB]/70 mt-1 mb-5">{t("settings.no_active_cta")}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/vehicles")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-xs font-extrabold shadow-lg shadow-[#395886]/20 hover:shadow-xl transition-all"
                      >
                        <Car className="w-3.5 h-3.5" />
                        {t("settings.browse_vehicles")}
                      </motion.button>
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
                            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="group rounded-2xl border border-[#D5DEEF]/50 bg-white/80 hover:bg-white hover:shadow-lg hover:border-[#638ECB]/20 transition-all overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row gap-0 sm:gap-5">
                              <div className="w-full sm:w-44 h-32 shrink-0 bg-[#F0F3FA] overflow-hidden">
                                {img ? (
                                  <img src={img} alt={r.vehicle?.marque} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-8 h-8 text-[#D5DEEF]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 p-5 pt-3 sm:pt-5">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-base font-extrabold text-[#395886] leading-tight">
                                      {r.vehicle?.marque} {r.vehicle?.model}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-[#638ECB]/60 mt-0.5">
                                      <MapPin className="w-3 h-3" /> {t("settings.location")}
                                    </div>
                                  </div>
                                  <StatusBadge status={r.status} />
                                </div>
                                <div className="flex gap-6 mt-3">
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#638ECB] uppercase tracking-[0.1em]">{t("settings.departure")}</p>
                                    <p className="text-sm font-bold text-[#395886] mt-0.5 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-[#f39c12]" />
                                      {formatDate(r.start_date, locale)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#638ECB] uppercase tracking-[0.1em]">{t("settings.return_date")}</p>
                                    <p className="text-sm font-bold text-[#395886] mt-0.5 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-[#f39c12]" />
                                      {formatDate(r.end_date, locale)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </RequireClient>
  );
}
