"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminCategory, type AdminCategoryPayload } from "@/lib/adminCategoriesApi";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim());

  async function onCreate(payload: AdminCategoryPayload) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAdminCategory(payload);
      router.push(`/admin/categories/${created.id}/edit`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.category_create_error");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">{t("admin.add_category")}</h1>
          <div className="font-bold text-sm mt-1">{t("admin.new_category")}</div>
        </div>
      </div>

      <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit || submitting) return;
            await onCreate({ name: name.trim() });
          }}
          className="flex flex-col gap-4"
        >
          {error ? (
            <div className="p-3 border-2 border-black bg-white font-bold">{error}</div>
          ) : null}

          <label className="flex flex-col gap-2">
            <span className="font-bold">{t("admin.category_name")}</span>
            <input
              className="border-2 border-black p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {submitting ? t("admin.creating") : t("admin.create_category")}
          </button>
        </form>
      </div>
    </div>
  );
}
