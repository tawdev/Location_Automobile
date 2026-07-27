"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { RequireClient } from "@/components/RequireClient";
import { motion } from "framer-motion";
import { getAuthToken } from "@/lib/tokenStorage";
import { profileImageUrl, vehicleImageUrl } from "@/lib/media";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/authContext";
import { Car, Calendar, FileText, IdCard, User, Sparkles, ArrowRight, CheckCircle, AlertCircle, MapPin, Settings, Shield, Clock, CreditCard } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";

interface SettingsReservation {
  id: number;
  status: string;
  start_date?: string;
  end_date?: string;
  TotalPrice?: number;
  date_heure_depart?: string | null;
  date_heure_retour?: string | null;
  vehicle?: {
    id: number;
    marque?: string;
    model?: string;
    pictures?: { path?: string }[];
  };
}

function formatDateStr(d: string | undefined) {
  return formatDate(d ?? null);
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  confirmée: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  annulée: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  terminée: { bg: "bg-slate-50 dark:bg-slate-950/40", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  en_attente: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-400" },
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      "en_attente": t("settings.status_pending"),
      "confirmée": t("settings.status_confirmed"),
      "terminée": t("settings.status_completed"),
      "annulée": t("settings.status_cancelled"),
    };
    return map[s?.toLowerCase()] ?? s;
  };
  const s = STATUS_STYLES[status?.toLowerCase()] ?? { bg: "bg-gray-50 dark:bg-gray-950/40", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
    })));
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 dark:bg-[#F39C12]/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useI18n();

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

  const profilePicSrc = user?.profile_pic ? profileImageUrl(user.profile_pic) : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const hasPermi = !!(user?.permi_recto && user?.permi_verso);
  const hasCin = !!(user?.cin_recto && user?.cin_verso);
  const docsComplete = hasPermi && hasCin;

  return (
    <RequireClient>
      <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
          <Particles />
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
                <Sparkles className="w-4 h-4 text-[#F39C12]" />
                <span className="text-[#FF7B00] text-xs font-bold uppercase tracking-[0.15em]">{t("reservations.dashboard")}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#FF7B00] tracking-tight leading-tight">{t("settings.title")}</h1>
              <p className="text-[#FF7B00] text-base font-semibold mt-2 max-w-xl">{t("settings.subtitle")}</p>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 pb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[280px]">

            {/* Profile Card - spans 2 rows, 1 col */}
            <motion.div variants={cardVariants} className="row-span-2 group">
              <div className="relative h-full rounded-3xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-gradient-to-br from-[#638ECB]/5 to-[#395886]/10 dark:from-[#F39C12]/5 dark:to-amber-600/10 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-7">
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-[#638ECB] to-[#395886] dark:from-[#F39C12] dark:to-amber-700 opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center shadow-xl ring-4 ring-white/50 dark:ring-[#0f1729]/50 transition-transform duration-500 group-hover:scale-105">
                      {profilePicSrc ? (
                        <img src={profilePicSrc} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl font-black text-white">{userInitial}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-emerald-400 border-3 border-white dark:border-[#0f1729] flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4.5 h-4.5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-[#395886] dark:text-[#D5DEEF]">{user?.name ?? t("settings.user")}</h2>
                  <p className="text-xs font-extrabold text-[#638ECB]/60 dark:text-[#94A3B8]/60 uppercase tracking-[0.12em] mt-1 mb-6">{t("settings.member")}</p>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/profile")}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#F39C12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-xs font-extrabold tracking-wider shadow-lg shadow-[#395886]/20 dark:shadow-[#F39C12]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    {t("settings.edit_profile")}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Documents Card - spans 1 row, 1 col */}
            <motion.div variants={cardVariants} className="group">
              <div className="relative h-full rounded-3xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-gradient-to-br from-[#F0F3FA]/80 to-white/50 dark:from-[#0f1729]/80 dark:to-[#111827]/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#395886] to-[#2b4c7e] dark:from-[#638ECB] dark:to-[#395886] flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  {docsComplete ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-full px-3 py-1">
                      <CheckCircle className="w-3 h-3" /> {t("settings.complete")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-full px-3 py-1">
                      <AlertCircle className="w-3 h-3" /> {t("settings.pending_status")}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] mb-1">{t("settings.documents_card")}</h3>
                <p className="text-xs font-semibold text-[#638ECB]/60 dark:text-[#94A3B8]/60 mb-4">{t("settings.front_back")}</p>
                <div className="mt-auto flex flex-col gap-2">
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/profile")}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-[#1e293b]/60 hover:bg-white dark:hover:bg-[#1e293b]/90 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 transition-all text-left"
                  >
                    <FileText className="w-4 h-4 text-[#638ECB] dark:text-[#94A3B8]" />
                    <span className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">{t("settings.license_row")}</span>
                    {hasPermi && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/profile")}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-[#1e293b]/60 hover:bg-white dark:hover:bg-[#1e293b]/90 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 transition-all text-left"
                  >
                    <IdCard className="w-4 h-4 text-[#638ECB] dark:text-[#94A3B8]" />
                    <span className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">{t("settings.cin_row")}</span>
                    {hasCin && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card - spans 1 row, 1 col */}
            <motion.div variants={cardVariants} className="group">
              <div className="relative h-full rounded-3xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-gradient-to-br from-[#F39C12]/5 to-amber-500/10 dark:from-[#F39C12]/5 dark:to-amber-700/10 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col p-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F39C12] to-[#e08e0b] dark:from-amber-500 dark:to-amber-700 flex items-center justify-center shadow-lg shadow-black/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] mb-1">{t("reservations.quick_actions")}</h3>
                <p className="text-xs font-semibold text-[#638ECB]/60 dark:text-[#94A3B8]/60 mb-4">{t("reservations.manage_account")}</p>
                <div className="mt-auto flex flex-col gap-2">
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/vehicules")}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-[#1e293b]/60 hover:bg-white dark:hover:bg-[#1e293b]/90 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 transition-all text-left"
                  >
                    <Car className="w-4 h-4 text-[#F39C12] dark:text-amber-400" />
                    <span className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">{t("settings.browse_vehicles")}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#638ECB]/40 dark:text-[#64748b]/40 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/MyReservations")}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-[#1e293b]/60 hover:bg-white dark:hover:bg-[#1e293b]/90 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 transition-all text-left"
                  >
                    <Calendar className="w-4 h-4 text-[#638ECB] dark:text-[#94A3B8]" />
                    <span className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">{t("settings.history_link")}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#638ECB]/40 dark:text-[#64748b]/40 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Active Reservations Card - spans 1 row, full width */}
            <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-3 group">
              <div className="relative h-full rounded-3xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-gradient-to-br from-white/70 to-[#F0F3FA]/50 dark:from-[#0f1729]/80 dark:to-[#111827]/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col">
                <div className="px-7 py-5 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F39C12] to-[#e08e0b] dark:from-amber-500 dark:to-amber-700 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("settings.active_reservations")}</h3>
                      <p className="text-[11px] font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70">{t("settings.active_reservations_subtitle")}</p>
                    </div>
                  </div>
                  <motion.a
                    whileHover={{ x: 3 }}
                    href="/MyReservations"
                    className="text-xs font-extrabold text-[#F39C12] dark:text-amber-400 hover:text-[#e08e0b] dark:hover:text-amber-500 transition-colors flex items-center gap-1"
                  >
                    {t("settings.history_link")} <ArrowRight className="w-3 h-3" />
                  </motion.a>
                </div>

                <div className="px-7 py-6 flex-1 min-h-0 overflow-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="relative">
                        <div className="w-10 h-10 border-3 border-[#D5DEEF] dark:border-[#1e293b] rounded-full" />
                        <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-t-[#638ECB] dark:border-t-[#F39C12] rounded-full animate-spin" />
                      </div>
                      <span className="ml-3 text-sm font-extrabold text-[#638ECB] dark:text-[#94A3B8]">{t("settings.loading")}</span>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#F0F3FA] dark:bg-[#1e293b]/60 flex items-center justify-center mb-4">
                        <Calendar className="w-7 h-7 text-[#638ECB] dark:text-[#94A3B8]" />
                      </div>
                      <p className="text-base font-black text-[#395886] dark:text-[#D5DEEF]">{t("settings.no_active")}</p>
                      <p className="text-sm font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 mt-1 mb-5">{t("settings.no_active_cta")}</p>
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push("/vehicules")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#F39C12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-xs font-extrabold shadow-lg shadow-[#395886]/20 dark:shadow-[#F39C12]/20 hover:shadow-xl transition-all"
                      >
                        <Car className="w-3.5 h-3.5" />
                        {t("settings.browse_vehicles")}
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                      {reservations.slice(0, 3).map((r, i) => {
                        const img = r.vehicle?.pictures?.[0]?.path
                          ? vehicleImageUrl(r.vehicle.pictures[0].path)
                          : null;
                        return (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="group/card rounded-2xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-white/80 dark:bg-[#0f1729]/60 hover:bg-white dark:hover:bg-[#0f1729]/90 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#638ECB]/20 dark:hover:border-[#638ECB]/10 transition-all overflow-hidden flex flex-col"
                          >
                            <div className="w-full h-28 bg-[#F0F3FA] dark:bg-[#1e293b]/60 overflow-hidden">
                              {img ? (
                                <img src={img} alt={r.vehicle?.marque} className="w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Car className="w-8 h-8 text-[#D5DEEF] dark:text-[#334155]" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] leading-tight">
                                  {r.vehicle?.marque} {r.vehicle?.model}
                                </h4>
                                <StatusBadge status={r.status} />
                              </div>
                              <div className="flex gap-4 mt-auto pt-2">
                                <div>
                                  <p className="text-[10px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-[0.1em]">{t("settings.departure")}</p>
                                  <p className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mt-0.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#F39C12] dark:text-amber-400" />
                                    {formatDateStr(r.start_date)}
                                  </p>
                                  {r.date_heure_depart && (
                                    <p className="text-[10px] font-bold text-[#638ECB] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#F39C12] dark:text-amber-400" />
                                      {new Date(r.date_heure_depart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[10px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-[0.1em]">{t("settings.return_date")}</p>
                                  <p className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mt-0.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#F39C12] dark:text-amber-400" />
                                    {formatDateStr(r.end_date)}
                                  </p>
                                  {r.date_heure_retour && (
                                    <p className="text-[10px] font-bold text-[#638ECB] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#F39C12] dark:text-amber-400" />
                                      {new Date(r.date_heure_retour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
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
        </motion.div>
      </div>
    </RequireClient>
  );
}
