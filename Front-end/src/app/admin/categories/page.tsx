"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { deleteAdminCategory, getAdminCategories } from "@/lib/adminCategoriesApi";

function CategoryRow({
  category,
  onDelete,
  deleting,
  onEdit,
}: {
  category: Category;
  onDelete: (id: number) => void;
  deleting: boolean;
  onEdit: (id: number) => void;
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
            Edit
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(category.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();

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
      const msg = e instanceof Error ? e.message : "Failed to load categories";
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
      const msg = e instanceof Error ? e.message : "Failed to delete category";
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
          <h1 className="font-black text-3xl">Categories</h1>
          <div className="font-bold text-sm mt-1">Admin CRUD</div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/categories/new")}
          className="font-black border-2 border-black px-4 py-2 bg-white hover:bg-zinc-100"
        >
          Add category
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 border-2 border-black bg-white font-bold">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 font-black">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="mt-8 p-4 border-2 border-black bg-white font-black text-center">
          No categories found.
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
