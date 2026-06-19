"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { Career } from "@/lib/types";
import { getAdminCareer, updateAdminCareer, type AdminCareerPayload } from "@/lib/adminCareersApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminCareerEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t } = useI18n();

  const careerId = useMemo(() => {
    const raw = params.id;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.id]);

  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<Career | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!careerId) return;
      setLoading(true);
      setError(null);
      try {
        const found = await getAdminCareer(careerId);
        setCareer(found);
        setTitle(found.title);
        setLocation(found.location ?? "");
        setType(found.type ?? "");
        setDepartment(found.department ?? "");
        setDescription(found.description ?? "");
        setRequirements(found.requirements ?? "");
        setSalaryRange(found.salary_range ?? "");
        setIsActive(found.is_active);
      } catch (e) {
        setError((e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.careers_load_error")));
      } finally {
        setLoading(false);
      }
    })();
  }, [careerId, t]);

  async function onSave(payload: AdminCareerPayload) {
    if (!careerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateAdminCareer(careerId, payload);
      router.push("/admin/careers");
    } catch (e) {
      setError((e as ApiError)?.message || (e instanceof Error ? e.message : t("admin.career_update_error")));
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

  if (!career) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t("admin.career_not_found")}
        </div>
      </div>
    );
  }

  const canSubmit = Boolean(title.trim());

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
              onClick={() => router.push("/admin/careers")}
              className="h-10 w-10 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
                {t("admin.edit_career")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {career.title}
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
            await onSave({
              title: title.trim(),
              location: location.trim() || null,
              type: type || null,
              department: department.trim() || null,
              description: description.trim() || null,
              requirements: requirements.trim() || null,
              salary_range: salaryRange.trim() || null,
              is_active: isActive,
            });
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
              {t("admin.career_title")}
            </label>
            <input
              className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              placeholder="Job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.career_location")}
            </label>
            <input
              className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              placeholder="Marrakech, Remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                {t("admin.career_type")}
              </label>
              <select
                className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">--</option>
                <option value="full-time">{t("admin.career_type_full_time")}</option>
                <option value="part-time">{t("admin.career_type_part_time")}</option>
                <option value="remote">{t("admin.career_type_remote")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                {t("admin.career_department")}
              </label>
              <input
                className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                placeholder="Engineering, Design..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.career_description")}
            </label>
            <textarea
              className="min-h-[120px] rounded-xl border border-[#D5DEEF] bg-white px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all resize-y"
              placeholder="Job description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.career_requirements")}
            </label>
            <textarea
              className="min-h-[120px] rounded-xl border border-[#D5DEEF] bg-white px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all resize-y"
              placeholder="Requirements..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.career_salary")}
            </label>
            <input
              className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              placeholder="e.g. 5,000 - 8,000 MAD"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
              {t("admin.career_active")}
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="w-9 h-5 bg-[#D5DEEF] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#638ECB]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#395886]" />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("admin.saving") : t("admin.save_career")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/careers")}
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
