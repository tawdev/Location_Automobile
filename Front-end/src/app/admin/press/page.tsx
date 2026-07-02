"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, AlertCircle, Newspaper, MoreHorizontal } from "lucide-react";
import type { PressRelease } from "@/lib/types";
import { getAdminPress, deleteAdminPressRelease } from "@/lib/adminPressApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";

function SkeletonRow() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-2xl bg-[#F0F3FA] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-1/4" />
        <div className="h-4 bg-[#F0F3FA] rounded-md w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3FA]/50 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-3xl mb-6 shadow-sm">
          <Newspaper className="w-8 h-8 text-[#638ECB]" />
        </div>
        <h3 className="text-lg font-black text-[#395886] mb-2">
          {t("admin.no_press")}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("admin.add_press")}
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminPressPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const loadPress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPress();
      setPressReleases(data);
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.press_load_error"));
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  async function onDelete(pressId: number) {
    setDeletingId(pressId);
    setError(null);
    try {
      await deleteAdminPressRelease(pressId);
      await loadPress();
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.press_delete_error"));
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void loadPress();
  }, [loadPress]);

  const totalPress = pressReleases.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
              {t("admin.press")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/press/new")}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t("admin.add_press")}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#D5DEEF]/60 px-5 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-[#395886]" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE]">
              Total press releases
            </div>
            <div className="text-xl font-black text-[#395886] tabular-nums">
              {totalPress}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : pressReleases.length === 0 ? (
        <EmptyState onAdd={() => router.push("/admin/press/new")} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {pressReleases.map((press) => (
              <motion.div
                key={press.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-4 rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300 p-4"
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F0F3FA] border border-[#D5DEEF]/40 shrink-0 flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-[#638ECB]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
                      {press.title}
                    </h4>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F3FA] text-[#638ECB] border border-[#D5DEEF]/50">
                      #{press.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {press.category && (
                      <span className="text-xs font-semibold text-[#638ECB]">
                        {press.category}
                      </span>
                    )}
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      press.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {press.status === "published" ? t("admin.press_published") : t("admin.press_draft")}
                    </span>
                    {press.published_at && (
                      <span className="text-[10px] font-bold text-[#B0C4DE]">
                        {formatDate(press.published_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/press/${press.id}/edit`)}
                    className="h-9 px-4 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-xs hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t("admin.edit")}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === press.id}
                    onClick={() => onDelete(press.id)}
                    className="h-9 px-4 rounded-xl border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === press.id ? "..." : t("admin.delete")}
                  </button>
                </div>

                {/* Mobile dropdown */}
                <div className="relative md:hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === press.id ? null : press.id)}
                    className="h-9 w-9 rounded-xl border border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center justify-center cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenuId === press.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] bg-white rounded-2xl border border-[#D5DEEF]/70 shadow-lg py-1.5 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            router.push(`/admin/press/${press.id}/edit`);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          {t("admin.edit")}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === press.id}
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(press.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === press.id ? "..." : t("admin.delete")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
