"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllUsers, getPermissions, getUserPermissionIds, updateUserPermissions } from "@/lib/adminPermissionsApi";
import { profileImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AllUser, Permission } from "@/lib/adminPermissionsApi";

function UserAvatar({ user, size = "md" }: { user: AllUser; size?: "sm" | "md" }) {
  const url = user.profile_pic ? profileImageUrl(user.profile_pic) : null;
  const initial = user.name?.charAt(0).toUpperCase() || "?";
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (url) {
    return <img src={url} alt={user.name} className={`${dim} rounded-full object-cover border-2 border-[#D5DEEF]/40 dark:border-[#334155]/60 shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center text-white font-extrabold border-2 border-[#D5DEEF]/20 dark:border-[#334155]/60 shrink-0`}>
      {initial}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 rounded-xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="h-64 rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 border border-[#D5DEEF]/40" />
        </div>
      </div>
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

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Support: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Seconde_Admin: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  Client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function AdminPermissionsPage() {
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<AllUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const [activePermissionIds, setActivePermissionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    setPermissionsError(null);
    let u: AllUser[] = [];
    let p: Permission[] = [];
    try {
      u = await getAllUsers(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : (e as any)?.message || t("admin_permissions.load_error"));
    }
    try {
      p = await getPermissions();
    } catch (e) {
      setPermissionsError(e instanceof Error ? e.message : (e as any)?.message || t("admin_permissions.load_error"));
    }
    setUsers(u);
    setPermissions(p);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void load(searchQuery || undefined);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, load]);

  const loadUserPermissions = useCallback(async (user: AllUser) => {
    setSelectedUser(user);
    setSuccessMsg(null);
    try {
      const ids = await getUserPermissionIds(user.id);
      setActivePermissionIds(new Set(ids));
    } catch {
      setActivePermissionIds(new Set());
    }
  }, []);

  const togglePermission = (permId: number) => {
    setActivePermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await updateUserPermissions(selectedUser.id, Array.from(activePermissionIds));
      setSuccessMsg(t("admin_permissions.saved"));
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError(t("admin_permissions.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const g = p.group || "general";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  const groupLabel = (g: string) => {
    const map: Record<string, { en: string; fr: string; ar: string }> = {
      messages: { en: "Messages", fr: "Messages", ar: "الرسائل" },
      reservations: { en: "Reservations", fr: "Réservations", ar: "الحجوزات" },
      vehicles: { en: "Vehicles", fr: "Véhicules", ar: "المركبات" },
      general: { en: "General", fr: "Général", ar: "عام" },
    };
    const l = map[g];
    if (!l) return g;
    if (locale === "fr") return l.fr;
    if (locale === "ar") return l.ar;
    return l.en;
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
          {t("admin_permissions.title")}
        </h1>
        <p className="text-sm font-bold text-[#638ECB] dark:text-[#94A3B8] mt-1">
          {t("admin_permissions.subtitle")}
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-sm font-bold text-rose-700 dark:text-rose-400"
        >
          {error}
        </motion.div>
      )}

      {loading && !users.length && <Skeleton />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── User List ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="p-3 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0C4DE] dark:text-[#64748B] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("admin_permissions.search_placeholder")}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-white/70 dark:bg-[#0f1729]/80 text-xs font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#B0C4DE] dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#f39c12]/20 focus:border-[#f39c12]/40 transition-all"
                />
              </div>
            </div>
            <div className="divide-y divide-[#D5DEEF]/30 dark:divide-[#1e293b]/60 max-h-[65vh] overflow-y-auto scrollbar-thin">
              {users.length === 0 ? (
                <div className="p-6">
                  <EmptyState message={t("admin_permissions.no_users")} />
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => void loadUserPermissions(user)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-all duration-200 hover:bg-[#F0F3FA]/60 dark:hover:bg-[#1e293b]/40 cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "bg-[#638ECB]/10 dark:bg-[#638ECB]/20 border-l-2 border-[#f39c12]"
                        : "border-l-2 border-transparent"
                    }`}
                  >
                    <UserAvatar user={user} />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-[#395886] dark:text-[#D5DEEF] text-sm leading-tight truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] font-semibold text-[#638ECB] dark:text-[#94A3B8] truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${ROLE_COLORS[user.role?.name || "Client"] || ROLE_COLORS.Client}`}>
                      {user.role?.name || "Client"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Permission Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2"
        >
          {selectedUser ? (
            <div className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 sm:p-6">
              {/* User header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
                <UserAvatar user={selectedUser} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-[#395886] dark:text-[#D5DEEF] text-lg tracking-tight truncate">
                    {t("admin_permissions.user_permissions")} {selectedUser.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#638ECB] dark:text-[#94A3B8]">{selectedUser.email}</p>
                </div>
                <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg shrink-0 ${ROLE_COLORS[selectedUser.role?.name || "Client"] || ROLE_COLORS.Client}`}>
                  {selectedUser.role?.name || "Client"}
                </span>
              </div>

              {/* Permissions grid */}
              {permissions.length === 0 ? (
                permissionsError ? (
                  <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30">
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{permissionsError}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">Check the browser console (F12 → Network tab) to see the API response for <code>GET /admin/permissions</code></p>
                  </div>
                ) : (
                  <EmptyState message={t("admin_permissions.no_permissions")} />
                )
              ) : (
                <div className="space-y-5">
                  {Object.entries(grouped).map(([group, perms]) => (
                    <div key={group}>
                      <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#B0C4DE] dark:text-[#64748B] mb-3">
                        {groupLabel(group)}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {perms.map((perm) => {
                          const isActive = activePermissionIds.has(perm.id);
                          const label = locale === "fr" ? perm.name_fr : locale === "ar" ? perm.name_ar : perm.name_en;
                          return (
                            <button
                              key={perm.id}
                              type="button"
                              onClick={() => togglePermission(perm.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-[#f39c12]/10 dark:bg-[#f39c12]/20 border-[#f39c12]/30 dark:border-[#f39c12]/40"
                                  : "bg-white/50 dark:bg-[#0f1729]/50 border-[#D5DEEF]/40 dark:border-[#1e293b]/70 hover:border-[#638ECB]/30"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  isActive
                                    ? "bg-[#f39c12] border-[#f39c12]"
                                    : "border-[#B0C4DE] dark:border-[#64748B]"
                                }`}
                              >
                                {isActive && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-sm font-bold leading-snug ${
                                isActive
                                  ? "text-[#395886] dark:text-[#D5DEEF]"
                                  : "text-[#638ECB] dark:text-[#94A3B8]"
                              }`}>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save bar */}
              <div className="mt-6 pt-4 border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/70 flex items-center justify-between">
                <AnimatePresence>
                  {successMsg && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-extrabold text-[#059669]"
                    >
                      {successMsg}
                    </motion.span>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="ml-auto h-10 px-5 rounded-xl bg-[#f39c12] text-[#395886] font-extrabold text-xs hover:bg-[#e08e0b] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#f39c12]/20 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t("admin_permissions.saving")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      {t("admin_permissions.save")}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-12">
              <EmptyState message={t("admin_permissions.no_selection")} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
