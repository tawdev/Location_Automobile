"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getUsers, getUserStats } from "@/lib/adminUsersApi";
import { profileImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AdminUser, UserStats } from "@/lib/adminUsersApi";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

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

function StatCard({
  label, value, icon, accent, delay,
}: {
  label: string; value: number; icon: React.ReactNode; accent: string; delay: number;
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
            <CountUp value={value} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 sm:p-6 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F3FA] dark:bg-[#1e293b]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-2/3" />
                <div className="h-6 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 p-5">
        <div className="h-4 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-1/4 mb-5" />
        <div className="h-44 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F0F3FA] dark:bg-[#1e293b]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-3/4" />
                <div className="h-3 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-md border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 px-3.5 py-2.5 shadow-lg text-xs font-bold text-[#395886] dark:text-[#D5DEEF]">
      <p className="text-[#638ECB] dark:text-[#94A3B8] mb-0.5">{label}</p>
      <p>{payload[0].value} inscriptions</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#B0C4DE] dark:text-[#64748B]">
      <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}

function UserAvatar({ user }: { user: AdminUser }) {
  const url = user.profile_pic ? profileImageUrl(user.profile_pic) : null;
  const initial = user.name?.charAt(0).toUpperCase() || "?";

  if (url) {
    return (
      <img
        src={url}
        alt={user.name}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#D5DEEF]/40 dark:border-[#334155]/60"
      />
    );
  }

  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center text-white font-extrabold text-sm border-2 border-[#D5DEEF]/20 dark:border-[#334155]/60 shrink-0">
      {initial}
    </div>
  );
}

function UserCard({
  user, index,
}: {
  user: AdminUser; index: number;
}) {
  const { t } = useI18n();
  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-sm hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-400 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <UserAvatar user={user} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-[#395886] dark:text-[#D5DEEF] truncate">
              {user.name}
            </span>
            {user.email_verified_at ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#059669] bg-[#059669]/10 dark:bg-[#059669]/15 px-1.5 py-0.5 rounded-md shrink-0">
                {t("admin_users.verified")}
              </span>
            ) : (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 dark:bg-[#D97706]/15 px-1.5 py-0.5 rounded-md shrink-0">
                {t("admin_users.unverified")}
              </span>
            )}
          </div>

          <div className="text-[12px] sm:text-[13px] font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-0.5 truncate">
            {user.email}
          </div>

          <div className="flex items-center gap-4 mt-2.5 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#395886] dark:text-[#D5DEEF]">
              <svg className="w-3.5 h-3.5 text-[#0284C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{user.reservations_count ?? 0} {t("admin_users.reservations")}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-[#B0C4DE] dark:text-[#64748B]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{createdDate}</span>
            </div>
          </div>
        </div>


      </div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, s] = await Promise.all([getUsers(), getUserStats()]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : (e as any)?.message || t("admin_users.load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const regChartData = stats?.monthlyRegistrations.map((r) => ({
    month: new Date(r.month + "-01").toLocaleDateString("fr-FR", { month: "short" }),
    inscriptions: r.count,
  })) ?? [];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-4 mb-6 flex-wrap"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
            {t("admin_users.title")}
          </h1>
          <p className="text-sm font-bold text-[#638ECB] dark:text-[#94A3B8] mt-1">
            {t("admin_users.subtitle")}
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
          <span>{loading ? t("admin_users.loading") : t("admin_users.refresh")}</span>
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-sm font-bold text-rose-700 dark:text-rose-400"
        >
          {error}
        </motion.div>
      )}

      {loading && !stats && <Skeleton />}

      {stats && (
        <>
          {/* ═══ Stats Cards ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard
              label={t("admin_users.total")} value={stats.totalClients}
              accent="#8B5CF6" delay={0.05}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
            />
            <StatCard
              label={t("admin_users.active")} value={stats.activeClients}
              accent="#059669" delay={0.1}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              label={t("admin_users.new_month")} value={stats.newThisMonth}
              accent="#D97706" delay={0.15}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
            />
            <StatCard
              label={t("admin_users.documents")} value={stats.withDocuments}
              accent="#0284C7" delay={0.2}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
          </div>

          {/* ═══ Registrations Chart ═══ */}
          <div className="mb-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 sm:p-6 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
                  {t("admin_users.monthly")}
                </h3>
                <span className="text-[10px] font-bold text-[#B0C4DE] dark:text-[#64748B] uppercase tracking-wider">
                  {regChartData.length} mois
                </span>
              </div>
              {regChartData.length === 0 ? (
                <EmptyState message={t("admin_users.no_data")} />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={regChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="2" barGap="0">
                    <defs>
                      <linearGradient id="regBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D5DEEF" strokeOpacity={0.2} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#B0C4DE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#B0C4DE" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip content={<MonthTooltip />} cursor={{ fill: "#F0F3FA", fillOpacity: 0.4 }} />
                    <Bar dataKey="inscriptions" radius={[2, 2, 0, 0]} maxBarSize={64} fill="url(#regBar)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* ═══ Users Grid ═══ */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center justify-between mb-4"
            >
              <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
                {t("admin_users.all")}
              </h3>
              <span className="text-[11px] font-bold text-[#B0C4DE] dark:text-[#64748B]">
                {users.length} utilisateur{users.length !== 1 ? "s" : ""}
              </span>
            </motion.div>

            {users.length === 0 ? (
              <Card>
                <EmptyState message={t("admin_users.no_users")} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {users.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
