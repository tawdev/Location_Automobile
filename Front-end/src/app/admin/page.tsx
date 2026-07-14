"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getDashboardStats } from "@/lib/adminDashboardApi";
import type { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";

const STATUS_META: Record<string, { color: string; lightBg: string }> = {
  En_Attente: { color: "#D97706", lightBg: "#FEF3C7" },
  Confirmée: { color: "#059669", lightBg: "#D1FAE5" },
  Annulée: { color: "#E11D48", lightBg: "#FEE2E2" },
  Terminée: { color: "#0284C7", lightBg: "#E0F2FE" },
};


function formatDateStr(dateStr: string) {
  return formatDate(dateStr);
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function monthLabel(m: string) {
  const d = new Date(m + "-01");
  return d.toLocaleDateString("fr-FR", { month: "short" });
}

// ── Animated counter hook ──
function useCountUp(end: number, duration = 1.2) {
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

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  return <>{fmt(useCountUp(value))}{suffix}</>;
}

// ── Stat Card ──
function StatCard({
  label, value, prefix = "", suffix = "", icon, accent, delay,
}: {
  label: string; value: number; prefix?: string; suffix?: string;
  icon: React.ReactNode; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 group hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.06] dark:opacity-[0.10] group-hover:scale-[2] transition-transform duration-700" style={{ backgroundColor: accent }} />
      <div className="flex items-center gap-4 relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#B0C4DE] dark:text-[#64748B]">
            {label}
          </div>
          <div className="text-2xl font-black text-[#395886] dark:text-[#D5DEEF] mt-0.5 tabular-nums tracking-tight">
            {prefix}<CountUp value={value} suffix={suffix} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Card wrapper ──
function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 sm:p-6 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500"
    >
      <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] mb-5 tracking-tight">{title}</h3>
      {children}
    </motion.div>
  );
}

// ── Custom Tooltip ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-md border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 px-3.5 py-2.5 shadow-lg text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">
      <p className="mb-1 text-[#638ECB] dark:text-[#94A3B8]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)} MAD
        </p>
      ))}
    </div>
  );
}

function StatusTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-md border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 px-3.5 py-2.5 shadow-lg text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">
      <p style={{ color: d.payload.color }}>{d.name}: {d.value}</p>
    </div>
  );
}

// ── Empty state ──
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#B0C4DE] dark:text-[#64748B]">
      <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}

// ── Skeleton ──
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F3FA] dark:bg-[#1e293b]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-3/4" />
                <div className="h-6 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 p-5">
            <div className="h-4 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-1/3 mb-6" />
            <div className="h-48 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status Badge ──
function statusBadgeClass(status: string) {
  switch (status) {
    case "En_Attente": return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400";
    case "Confirmée": return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400";
    case "Annulée": return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
    case "Terminée": return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400";
    default: return "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
  }
}

// ── Main Dashboard ──
export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => { void load(); }, [load]);

  const statusLabel = useCallback((status: string) => {
    const map: Record<string, string> = {
      En_Attente: t("admin.status_pending"),
      Confirmée: t("admin.status_confirmed"),
      Annulée: t("admin.status_cancelled"),
      Terminée: t("admin.status_completed"),
    };
    return map[status] ?? status;
  }, [t]);

  const sortedMonths = stats
    ? [...stats.monthlyRevenue].sort((a, b) => a.month.localeCompare(b.month))
    : [];

  const revenueChartData = sortedMonths.map((r) => ({
    month: monthLabel(r.month),
    revenu: r.revenue,
  }));

  const statusEntries = stats
    ? (Object.entries(stats.reservationsByStatus) as [string, number][]).filter(([, c]) => c > 0)
    : [];

  const pieData = statusEntries.map(([s, c]) => ({
    name: statusLabel(s),
    value: c,
    color: STATUS_META[s]?.color ?? "#6B7280",
  }));

  const popularVehicles = stats?.popularVehicles ?? [];
  const maxPopularCount = popularVehicles.reduce((m, p) => Math.max(m, p.count), 0);

  return (
    <div>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-4 mb-6 flex-wrap"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
            {t("admin.dashboard_title")}
          </h1>
          <p className="text-sm font-bold text-[#638ECB] dark:text-[#94A3B8] mt-1">
            {t("admin.overview")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 text-[#395886] dark:text-[#D5DEEF] font-bold text-xs hover:bg-white dark:hover:bg-[#1e293b] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer backdrop-blur-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? t("admin.loading") : t("admin.refresh")}</span>
        </button>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-sm font-bold text-rose-700 dark:text-rose-400"
        >
          {error}
        </motion.div>
      )}

      {/* ── Loading ── */}
      {loading && !stats && <DashboardSkeleton />}

      {stats && (
        <div className="space-y-5">
          {/* ═══ Stat Cards ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("admin.total_revenue")} value={stats.totalRevenue} suffix=" MAD" accent="#059669" delay={0.05}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard label={t("admin.reservations_count")} value={stats.totalReservations} accent="#0284C7" delay={0.1}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard label={t("admin.vehicles_count")} value={stats.totalVehicles} accent="#D97706" delay={0.15}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatCard label={t("admin.clients_count")} value={stats.totalClients} accent="#8B5CF6" delay={0.2}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
          </div>

          {/* ═══ Charts Row 1 ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue Chart — Composed: bars + trend line */}
            <ChartCard title={t("admin.monthly_revenue")} delay={0.25}>
              {revenueChartData.length === 0 ? (
                <EmptyState message={t("admin.no_data")} />
              ) : (
                <>
                  {/* Summary row */}
                  <div className="flex items-baseline justify-between mb-5 -mt-1">
                    <div>
                      <span className="text-[28px] sm:text-[32px] font-black text-[#395886] dark:text-[#D5DEEF] tracking-tight tabular-nums">
                        {fmt(sortedMonths.reduce((s, r) => s + r.revenue, 0))} MAD
                      </span>
                      <span className="ml-2.5 text-[11px] font-extrabold text-[#B0C4DE] dark:text-[#64748B]">Total</span>
                    </div>
                    {revenueChartData.length >= 2 && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-extrabold text-[#059669]">
                          +{((revenueChartData[revenueChartData.length - 1].revenu / revenueChartData[revenueChartData.length - 2].revenu - 1) * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-bold text-[#B0C4DE] dark:text-[#64748B]">vs mois dernier</span>
                      </div>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <ComposedChart data={revenueChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#638ECB" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#638ECB" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#FF8D21" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FF8D21" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D5DEEF" strokeOpacity={0.2} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#B0C4DE" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#B0C4DE" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F0F3FA", fillOpacity: 0.4 }} />
                      <Bar dataKey="revenu" radius={[4, 4, 0, 0]} maxBarSize={32} fill="url(#revBar)" />
                      <Line type="monotone" dataKey="revenu" stroke="#FF8D21" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#FF8D21", stroke: "#fff", strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}
            </ChartCard>

            {/* Status Pie Chart */}
            <ChartCard title={t("admin.reservations_by_status")} delay={0.3}>
              {pieData.length === 0 ? (
                <EmptyState message={t("admin.no_data")} />
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 -mt-2">
                    {pieData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[11px] font-bold text-[#395886] dark:text-[#D5DEEF]">{entry.name}</span>
                        <span className="text-[11px] font-black text-[#395886] dark:text-[#D5DEEF]">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* ═══ Charts Row 2 ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Popular Vehicles — Leaderboard */}
            <ChartCard title={t("admin.popular_vehicles")} delay={0.35}>
              {popularVehicles.length === 0 ? (
                <EmptyState message={t("admin.no_data")} />
              ) : (
                <div className="space-y-1">
                  {popularVehicles.map((pv, i) => {
                    const v = pv.vehicle;
                    const pct = maxPopularCount > 0 ? (pv.count / maxPopularCount) * 100 : 0;
                    const rankColors = ["#F59E0B", "#94A3B8", "#CD7F32"];
                    const rankIcons = ["🥇", "🥈", "🥉"];
                    return (
                      <motion.div
                        key={v?.id ?? i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative overflow-hidden rounded-xl bg-[#F0F3FA]/40 dark:bg-[#1e293b]/30 hover:bg-[#F0F3FA]/70 dark:hover:bg-[#1e293b]/50 transition-all duration-300"
                      >
                        {/* Progress bar background */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: i === 0
                              ? "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))"
                              : `linear-gradient(90deg, rgba(99,142,203,${0.1 + (1 - i / popularVehicles.length) * 0.08}), rgba(99,142,203,0.02))`,
                          }}
                        />

                        <div className="relative flex items-center gap-3 px-4 py-3">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-7 h-7 shrink-0">
                            {i < 3 ? (
                              <span className="text-lg">{rankIcons[i]}</span>
                            ) : (
                              <span className="text-[11px] font-black text-[#B0C4DE] dark:text-[#64748B]">
                                #{i + 1}
                              </span>
                            )}
                          </div>

                          {/* Vehicle info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] truncate">
                                {v ? `${v.marque} ${v.model}` : "—"}
                              </span>
                              {i === 0 && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 dark:bg-[#F59E0B]/15 px-1.5 py-0.5 rounded-md">Top</span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                              {v?.category?.name ?? ""} · {v ? `${v.pricePerDay} MAD/jour` : ""}
                            </div>
                          </div>

                          {/* Count */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-black text-[#395886] dark:text-[#D5DEEF] tabular-nums">{pv.count}</div>
                              <div className="text-[9px] font-bold text-[#B0C4DE] dark:text-[#64748B]">réservations</div>
                            </div>
                            {/* Mini bar */}
                            <div className="w-12 h-1.5 rounded-full bg-[#D5DEEF]/50 dark:bg-[#334155]/50 overflow-hidden hidden sm:block">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{
                                  background: i === 0
                                    ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                                    : "linear-gradient(90deg, #638ECB, #93B4E0)",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ChartCard>

            {/* Recent Reservations */}
            <ChartCard title={t("admin.recent_reservations")} delay={0.4}>
              {stats.recentReservations.length === 0 ? (
                <EmptyState message={t("admin.no_reservations")} />
              ) : (
                <div className="space-y-1">
                  {stats.recentReservations.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F0F3FA]/50 dark:hover:bg-[#1e293b]/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] truncate">
                            {r.vehicle ? `${r.vehicle.marque} ${r.vehicle.model}` : `#${r.id}`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(r.status)}`}>
                            {statusLabel(r.status)}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-0.5">
                          {r.user?.name ?? "—"} · {formatDateStr(r.start_date)} → {formatDateStr(r.end_date)}
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#395886] dark:text-[#D5DEEF] shrink-0 tabular-nums">
                        {fmt(r.TotalPrice)} MAD
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
