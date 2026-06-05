"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/lib/adminDashboardApi";
import type { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  En_Attente: { label: "En attente", color: "#D97706" },
  Confirmée: { label: "Confirmée", color: "#059669" },
  Annulée: { label: "Annulée", color: "#E11D48" },
  Terminée: { label: "Terminée", color: "#0284C7" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" });
}

function formatRevenue(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function countUp(end: number, duration = 1.2) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (end === 0) { setVal(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      setVal(Math.floor(t * end));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return val;
}

function CountUpNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const display = countUp(value);
  return <>{formatRevenue(display)}{suffix}</>;
}

function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  icon,
  accent,
  delay,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center gap-4 bg-white rounded-3xl border border-[#D5DEEF]/60 p-5 shadow-sm hover:shadow-[0_8px_30px_rgba(99,142,203,0.10)] hover:border-[#638ECB]/40 transition-all duration-300 group"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accent}18` }}
      >
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE]">
          {label}
        </div>
        <div className="text-2xl font-black text-[#395886] mt-0.5 tabular-nums">
          {prefix}
          <CountUpNumber value={value} suffix={suffix} />
        </div>
      </div>
    </motion.div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold text-[#395886] w-12 shrink-0 text-right tabular-nums">
        {formatRevenue(value)} MAD
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-[#F0F3FA] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F3FA]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F0F3FA] rounded-md w-3/4" />
                <div className="h-6 bg-[#F0F3FA] rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5">
            <div className="h-4 bg-[#F0F3FA] rounded-md w-1/3 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-[#F0F3FA] rounded-md w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function statusBadgeClass(status: string) {
  const s = STATUS_LABELS[status];
  if (!s) return "bg-zinc-50 text-zinc-600";
  switch (status) {
    case "En_Attente": return "bg-amber-50 text-amber-700";
    case "Confirmée": return "bg-emerald-50 text-emerald-700";
    case "Annulée": return "bg-rose-50 text-rose-600";
    case "Terminée": return "bg-sky-50 text-sky-700";
    default: return "bg-zinc-50 text-zinc-600";
  }
}

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : (e as any)?.message || "Échec du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const sortedMonths = stats
    ? [...stats.monthlyRevenue].sort((a, b) => a.month.localeCompare(b.month))
    : [];

  const maxMonthlyRevenue = sortedMonths.reduce((m, r) => Math.max(m, r.revenue), 0);

  const statusEntries = stats
    ? Object.entries(stats.reservationsByStatus) as [string, number][]
    : [];

  const maxStatusCount = statusEntries.reduce((m, [, c]) => Math.max(m, c), 0);

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#395886]">{t("admin.dashboard_title")}</h1>
          <p className="text-sm font-bold text-[#638ECB] mt-1">
            {t("admin.overview")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-white border border-[#D5DEEF] text-[#395886] font-bold text-xs hover:bg-[#F0F3FA] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <RefreshIcon />
          <span>{loading ? t("admin.loading") : t("admin.refresh")}</span>
        </button>
      </motion.div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {loading && !stats && <DashboardSkeleton />}

      {stats && (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("admin.total_revenue")}
              value={stats.totalRevenue}
              prefix=""
              suffix=" MAD"
              accent="#059669"
              delay={0.05}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label={t("admin.reservations_count")}
              value={stats.totalReservations}
              accent="#0284C7"
              delay={0.1}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              label={t("admin.vehicles_count")}
              value={stats.totalVehicles}
              accent="#D97706"
              delay={0.15}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              label={t("admin.clients_count")}
              value={stats.totalClients}
              accent="#8B5CF6"
              delay={0.2}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Monthly Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-[#395886]">{t("admin.monthly_revenue")}</h3>
                {sortedMonths.length > 0 && (
                  <span className="text-[10px] font-bold text-[#B0C4DE] uppercase tracking-wider">
                    {sortedMonths.length} {t("admin.months")}
                  </span>
                )}
              </div>
              {sortedMonths.length === 0 ? (
                <p className="text-sm font-bold text-[#B0C4DE] py-6 text-center">{t("admin.no_data")}</p>
              ) : (
                <div className="space-y-2.5">
                  {[...sortedMonths].reverse().map((r, i) => {
                    const pct = maxMonthlyRevenue > 0 ? (r.revenue / maxMonthlyRevenue) * 100 : 0;
                    return (
                      <motion.div
                        key={r.month}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-[11px] font-bold text-[#638ECB] w-14 shrink-0">
                          {r.month}
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-[#F0F3FA] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full bg-gradient-to-r from-[#395886] to-[#638ECB]"
                          />
                        </div>
                        <span className="text-xs font-bold text-[#395886] w-24 text-right tabular-nums">
                          {formatRevenue(r.revenue)} MAD
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Reservations by Status */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5 shadow-sm"
            >
              <h3 className="text-sm font-extrabold text-[#395886] mb-4">{t("admin.reservations_by_status")}</h3>
              {statusEntries.length === 0 ? (
                <p className="text-sm font-bold text-[#B0C4DE] py-6 text-center">{t("admin.no_data")}</p>
              ) : (
                <div className="space-y-3">
                  {statusEntries.map(([status, count], i) => {
                    const info = STATUS_LABELS[status] ?? { label: status, color: "#6B7280" };
                    const pct = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
                    return (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                            <span className="text-xs font-bold text-[#395886]">{info.label}</span>
                          </div>
                          <span className="text-xs font-black text-[#395886]">{count}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#F0F3FA] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.45 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: info.color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Reservations */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5 shadow-sm"
            >
              <h3 className="text-sm font-extrabold text-[#395886] mb-4">{t("admin.recent_reservations")}</h3>
              {stats.recentReservations.length === 0 ? (
                <p className="text-sm font-bold text-[#B0C4DE] py-6 text-center">{t("admin.no_reservations")}</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentReservations.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-[#F0F3FA]/60 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[#395886] truncate">
                            {r.vehicle ? `${r.vehicle.marque} ${r.vehicle.model}` : `#${r.id}`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(r.status)}`}>
                            {STATUS_LABELS[r.status]?.label ?? r.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#638ECB] mt-0.5">
                          {r.user?.name ?? "—"} · {formatDate(r.start_date)} → {formatDate(r.end_date)}
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#395886] shrink-0">
                        {formatRevenue(r.TotalPrice)} MAD
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Popular Vehicles */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 p-5 shadow-sm"
            >
              <h3 className="text-sm font-extrabold text-[#395886] mb-4">{t("admin.popular_vehicles")}</h3>
              {stats.popularVehicles.length === 0 ? (
                <p className="text-sm font-bold text-[#B0C4DE] py-6 text-center">{t("admin.no_data")}</p>
              ) : (
                <div className="space-y-2">
                  {stats.popularVehicles.map((pv, i) => {
                    const v = pv.vehicle;
                    const maxCount = stats.popularVehicles[0]?.count ?? 1;
                    const barPct = (pv.count / maxCount) * 100;
                    return (
                      <motion.div
                        key={v?.id ?? i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.45 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-[#F0F3FA]/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-extrabold text-[#395886] truncate">
                            {v ? `${v.marque} ${v.model}` : "—"}
                          </div>
                          <div className="text-[11px] font-semibold text-[#638ECB] mt-0.5">
                            {v?.category?.name ?? ""} · {v ? `${v.pricePerDay} MAD/jour` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="w-16 h-2 rounded-full bg-[#F0F3FA] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barPct}%` }}
                              transition={{ duration: 0.8, delay: 0.5 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-[#395886] to-[#638ECB]"
                            />
                          </div>
                          <span className="text-xs font-black text-[#395886] tabular-nums w-6 text-right">
                            {pv.count}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
