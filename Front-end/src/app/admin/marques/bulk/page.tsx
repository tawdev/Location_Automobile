"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { createAdminMarques } from "@/lib/adminMarquesApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminMarqueBulkPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const names = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const canSubmit = names.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await createAdminMarques(names);
      setResult({
        created: Array.isArray(res.data) ? res.data.length : 0,
        errors: (res.errors as string[]) || [],
      });
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : "Failed to create marques");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/marques")}
              className="h-10 w-10 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
                {t("admin.bulk_add_marque")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {t("admin.bulk_add_desc")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl border border-[#D5DEEF]/60 shadow-sm p-6 sm:p-8 max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm font-bold"
              style={{
                borderColor: result.errors.length > 0 ? "#fde68a" : "#bbf7d0",
                backgroundColor: result.errors.length > 0 ? "#fefce8" : "#f0fdf4",
                color: result.errors.length > 0 ? "#92400e" : "#166534",
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {result.created} {t("admin.bulk_success")}
              </div>
              {result.errors.length > 0 && (
                <div className="flex items-start gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t("admin.bulk_some_errors")}: {result.errors.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.bulk_names_label")}
            </label>
            <textarea
              className="h-48 rounded-xl border border-[#D5DEEF] bg-white px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all resize-none"
              placeholder={t("admin.bulk_names_placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <p className="text-xs font-bold text-[#B0C4DE]">
              {names.length} name(s) detected
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("admin.bulk_creating") : t("admin.bulk_submit")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/marques")}
              className="h-11 px-6 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-sm hover:bg-[#F0F3FA] transition-all active:scale-95 cursor-pointer"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
