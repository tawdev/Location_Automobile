"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { getAdminCategories, updateAdminCategory, type AdminCategoryPayload } from "@/lib/adminCategoriesApi";

export default function AdminCategoryEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const categoryId = useMemo(() => {
    const raw = params.id;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.id]);

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!categoryId) return;

      setLoading(true);
      setError(null);

      try {
        const all = await getAdminCategories();
        const found = all.find((c) => c.id === categoryId) ?? null;
        setCategory(found);
        setName(found?.name ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load category");
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  async function onSave(payload: AdminCategoryPayload) {
    if (!categoryId) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateAdminCategory(categoryId, payload);
      router.push("/admin/categories");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="font-black">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="p-4 border-2 border-black bg-white font-black">
        Category not found.
      </div>
    );
  }

  const canSubmit = Boolean(name.trim());

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">Edit category</h1>
          <div className="font-bold text-sm mt-1">#{category.id}</div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="font-black border-2 border-black px-4 py-2 bg-white hover:bg-zinc-100"
        >
          Back
        </button>
      </div>

      <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit || submitting) return;
            await onSave({ name: name.trim() });
          }}
          className="flex flex-col gap-4"
        >
          {error ? (
            <div className="p-3 border-2 border-black bg-white font-bold">{error}</div>
          ) : null}

          <label className="flex flex-col gap-2">
            <span className="font-bold">Name</span>
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
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
