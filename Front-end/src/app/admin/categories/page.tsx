"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { deleteAdminCategory, getAdminCategories } from "@/lib/adminCategoriesApi";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function CategoryRow({
  category,
  onDelete,
  deleting,
  onEdit,
  t,
}: {
  category: Category;
  onDelete: (id: number) => void;
  deleting: boolean;
  onEdit: (id: number) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-black text-2xl leading-tight">{category.name}</div>
          <div className="font-bold text-sm mt-1">ID: {category.id}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(category.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
          >
            {t("admin.edit")}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(category.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {deleting ? t("admin.deleting") : t("admin.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.categories_load_error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(categoryId: number) {
    setDeletingId(categoryId);
    setError(null);
    try {
      await deleteAdminCategory(categoryId);
      await loadCategories();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.category_delete_error");
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">{t("admin.categories_title")}</h1>
          <div className="font-bold text-sm mt-1">{t("admin.categories_management")}</div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/categories/new")}
          className="font-black border-2 border-black px-4 py-2 bg-white hover:bg-zinc-100"
        >
          {t("admin.add_category")}
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 border-2 border-black bg-white font-bold">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 font-black">{t("admin.loading")}</div>
      ) : categories.length === 0 ? (
        <div className="mt-8 p-4 border-2 border-black bg-white font-black text-center">
          {t("admin.no_categories")}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              deleting={deletingId === c.id}
              onDelete={onDelete}
              onEdit={(id) => router.push(`/admin/categories/${id}/edit`)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
