"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Upload, X } from "lucide-react";
import type { Marque } from "@/lib/types";
import { getAdminMarque, updateAdminMarque, type AdminMarquePayload } from "@/lib/adminMarquesApi";
import type { ApiError } from "@/lib/apiClient";
import { vehicleImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminMarqueEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t } = useI18n();

  const marqueId = useMemo(() => {
    const raw = params.id;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.id]);

  const [loading, setLoading] = useState(true);
  const [marque, setMarque] = useState<Marque | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      if (!marqueId) return;
      setLoading(true);
      setError(null);
      try {
        const found = await getAdminMarque(marqueId);
        setMarque(found);
        setName(found.name);
      } catch (e) {
        setError((e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.marques_load_error")));
      } finally {
        setLoading(false);
      }
    })();
  }, [marqueId, t]);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  function clearLogo() {
    setLogo(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSave(payload: AdminMarquePayload) {
    if (!marqueId) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateAdminMarque(marqueId, payload);
      router.push("/admin/marques");
    } catch (e) {
      setError((e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.marque_update_error")));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 w-48 bg-[#F0F3FA] rounded-md" />
        <div className="animate-pulse h-96 bg-white rounded-3xl border border-[#D5DEEF]/60" />
      </div>
    );
  }

  if (!marque) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t("admin.marque_not_found")}
        </div>
      </div>
    );
  }

  const existingLogoUrl = marque.logo ? vehicleImageUrl(marque.logo) : null;
  const showPreview = preview || (!logo && existingLogoUrl ? existingLogoUrl : null);
  const canSubmit = Boolean(name.trim());

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
                {t("admin.edit_marque")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {marque.name}
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
            await onSave({ name: name.trim(), logo: logo ?? undefined });
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
              {t("admin.marque_name")}
            </label>
            <input
              className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              placeholder="BMW, Mercedes..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.marque_logo")}
            </label>

            {showPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#D5DEEF]/60 bg-[#F0F3FA] flex items-center justify-center h-32">
                <img
                  src={showPreview}
                  alt={marque.name}
                  className="w-auto h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 hover:opacity-100 transition-opacity h-10 px-5 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-extrabold text-[#395886] shadow-sm cursor-pointer"
                  >
                    {t("admin.change_image")}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#638ECB] hover:text-rose-600 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-[#D5DEEF] bg-[#F0F3FA]/50 hover:bg-[#F0F3FA] hover:border-[#638ECB]/40 transition-all cursor-pointer"
              >
                <Upload className="w-6 h-6 text-[#638ECB]" />
                <span className="text-xs font-extrabold text-[#638ECB]">
                  {t("admin.click_to_upload")}
                </span>
                <span className="text-[10px] font-bold text-[#B0C4DE]">
                  JPG, PNG, WEBP
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogo}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("admin.saving") : t("admin.save_marque")}
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
