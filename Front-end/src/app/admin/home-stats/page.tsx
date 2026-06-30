"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, AlertCircle } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/adminSettingsApi";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type StatField = {
  key: string;
  defaultLabel: string;
};

const STATS: { valueKey: string; labelKey: string; fields: StatField[] }[] = [
  {
    valueKey: "stat_1_value",
    labelKey: "stat_1",
    fields: [
      { key: "stat_1_label_en", defaultLabel: "Years of expertise" },
      { key: "stat_1_label_fr", defaultLabel: "Années d'expertise" },
      { key: "stat_1_label_ar", defaultLabel: "سنوات من الخبرة" },
    ],
  },
  {
    valueKey: "stat_2_value",
    labelKey: "stat_2",
    fields: [
      { key: "stat_2_label_en", defaultLabel: "Vehicles available" },
      { key: "stat_2_label_fr", defaultLabel: "Véhicules disponibles" },
      { key: "stat_2_label_ar", defaultLabel: "مركبة متاحة" },
    ],
  },
  {
    valueKey: "stat_3_value",
    labelKey: "stat_3",
    fields: [
      { key: "stat_3_label_en", defaultLabel: "Satisfied clients" },
      { key: "stat_3_label_fr", defaultLabel: "Clients satisfaits" },
      { key: "stat_3_label_ar", defaultLabel: "عميل راضٍ" },
    ],
  },
  {
    valueKey: "stat_4_value",
    labelKey: "stat_4",
    fields: [
      { key: "stat_4_label_en", defaultLabel: "Customer support" },
      { key: "stat_4_label_fr", defaultLabel: "Support client" },
      { key: "stat_4_label_ar", defaultLabel: "دعم العملاء" },
    ],
  },
];

const DEFAULT_VALUES: Record<string, string> = {
  stat_1_value: "15+",
  stat_1_label_en: "Years of expertise",
  stat_1_label_fr: "Années d'expertise",
  stat_1_label_ar: "سنوات من الخبرة",
  stat_2_value: "200+",
  stat_2_label_en: "Vehicles available",
  stat_2_label_fr: "Véhicules disponibles",
  stat_2_label_ar: "مركبة متاحة",
  stat_3_value: "5000+",
  stat_3_label_en: "Satisfied clients",
  stat_3_label_fr: "Clients satisfaits",
  stat_3_label_ar: "عميل راضٍ",
  stat_4_value: "24/7",
  stat_4_label_en: "Customer support",
  stat_4_label_fr: "Support client",
  stat_4_label_ar: "دعم العملاء",
};

export default function AdminHomeStatsPage() {
  const { t, locale } = useI18n();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getSettings();
      const merged: Record<string, string> = {};
      for (const [k, v] of Object.entries(DEFAULT_VALUES)) {
        merged[k] = (settings as Record<string, string>)[k] ?? v;
      }
      setValues(merged);
    } catch {
      setValues({ ...DEFAULT_VALUES });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSettings(values);
      setMessage({ type: "success", text: t("admin.home_stats_save_success") });
      setDirty(false);
    } catch {
      setMessage({ type: "error", text: t("admin.home_stats_save_error") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#395886]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#395886]/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-[#395886]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#395886] dark:text-[#D5DEEF] tracking-tight">
              {t("admin.home_stats_title")}
            </h1>
            <p className="text-sm font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-1">
              {t("admin.home_stats_description")}
            </p>
          </div>
        </div>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3.5 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSave}>
        <div className="flex flex-col gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.valueKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-[#0f1729] rounded-3xl border border-[#D5DEEF]/60 dark:border-[#1e293b]/60 p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-sm font-black text-[#395886] dark:text-[#D5DEEF]">
                  {idx + 1}
                </div>
                <h2 className="text-base font-black text-[#395886] dark:text-[#D5DEEF]">
                  {t("admin.home_stats_stat")} {idx + 1}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">
                    {t("admin.home_stats_value")}
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-bold text-[#395886] dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                    value={values[stat.valueKey] ?? ""}
                    onChange={(e) => set(stat.valueKey, e.target.value)}
                    placeholder="15+"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">
                    {t("admin.home_stats_label")} (EN)
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                    value={values[stat.fields[0].key] ?? ""}
                    onChange={(e) => set(stat.fields[0].key, e.target.value)}
                    placeholder={stat.fields[0].defaultLabel}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">
                    {t("admin.home_stats_label")} (FR)
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                    value={values[stat.fields[1].key] ?? ""}
                    onChange={(e) => set(stat.fields[1].key, e.target.value)}
                    placeholder={stat.fields[1].defaultLabel}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">
                    {t("admin.home_stats_label")} (AR)
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                    value={values[stat.fields[2].key] ?? ""}
                    onChange={(e) => set(stat.fields[2].key, e.target.value)}
                    placeholder={stat.fields[2].defaultLabel}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-end mt-6"
        >
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-8 py-3 rounded-xl bg-[#395886] text-white font-bold text-sm transition-all hover:bg-[#395886]/90 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? t("admin.home_stats_saving") : t("admin.home_stats_save")}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
