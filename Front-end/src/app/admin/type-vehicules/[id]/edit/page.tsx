"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Layers } from "lucide-react";
import type { TypeVehicule } from "@/lib/types";
import { getAdminTypeVehicules, updateAdminTypeVehicule, type AdminTypeVehiculePayload } from "@/lib/adminTypeVehiculesApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminTypeVehiculeEditPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();

  const id = Number(params.id);

  const [type, setType] = useState<TypeVehicule | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadType = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const types = await getAdminTypeVehicules();
      const found = types.find((t) => t.id === id);
      if (found) {
        setType(found);
        setName(found.name);
      } else {
        setError(t("admin.type_vehicule_not_found"));
      }
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.type_vehicules_load_error"));
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const canSubmit = Boolean(name.trim());

  async function onUpdate(payload: AdminTypeVehiculePayload) {
    setSubmitting(true);
    setError(null);
    try {
      await updateAdminTypeVehicule(id, payload);
      router.push("/admin/type-vehicules");
    } catch (e) {
      const msg = (e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.type_vehicule_update_error"));
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    void loadType();
  }, [loadType]);

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
                {t("admin.edit_type_vehicule")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {type?.name ?? ""}
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
        {loading ? (
          <div className="flex items-center gap-3 text-sm font-bold text-[#638ECB]">
            <div className="w-5 h-5 border-2 border-[#638ECB] border-t-transparent rounded-full animate-spin" />
            {t("loading")}
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!canSubmit || submitting) return;
              await onUpdate({ name: name.trim() });
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
                {submitting ? t("admin.saving") : t("admin.save_type_vehicule")}
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
        )}
      </motion.div>
    </div>
  );
}
