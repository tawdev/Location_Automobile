"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Layers } from "lucide-react";
import { createAdminTypeVehicule, type AdminTypeVehiculePayload } from "@/lib/adminTypeVehiculesApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminTypeVehiculeNewPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim());

  async function onCreate(payload: AdminTypeVehiculePayload) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAdminTypeVehicule(payload);
      router.push(`/admin/type-vehicules/${created.id}/edit`);
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.type_vehicule_create_error"));
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
              onClick={() => router.push("/admin/type-vehicules")}
              className="h-10 w-10 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
                {t("admin.add_type_vehicule")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {t("admin.new_type_vehicule")}
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
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit || submitting) return;
            await onCreate({ name: name.trim() });
          }}
          className="flex flex-col gap-5"
        >
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.type_vehicule_name")}
            </label>
            <input
              className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              placeholder="SUV, Berline, Utilitaire..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("admin.creating") : t("admin.create_type_vehicule")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/type-vehicules")}
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
