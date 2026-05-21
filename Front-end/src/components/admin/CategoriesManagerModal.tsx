"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import type { Category } from "@/lib/types";
import {
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/lib/adminCategoriesApi";

interface CategoriesManagerModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export function CategoriesManagerModal({
  open,
  onClose,
  categories,
  onRefresh,
}: CategoriesManagerModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim() || creating) return;

    setCreating(true);
    setError(null);
    try {
      await createAdminCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      await onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateCategory(id: number) {
    if (!editingName.trim() || updating) return;

    setUpdating(true);
    setError(null);
    try {
      await updateAdminCategory(id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      await onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      setError(msg);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteCategory(id: number) {
    if (deletingId !== null) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteAdminCategory(id);
      await onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Categories"
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-5">
        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              ✕
            </button>
          </div>
        )}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/40 px-4 py-3 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none transition-all placeholder:text-[#638ECB]/50"
            placeholder="Add new category (e.g. Convertible)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            disabled={creating}
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim() || creating}
            className="h-[46px] px-5 rounded-xl bg-[#395886] hover:bg-[#395886]/90 disabled:opacity-50 text-white text-sm font-bold transition-all hover:shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:hover:shadow-none disabled:active:scale-100"
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Category List */}
        <div className="border border-[#D5DEEF]/60 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="px-4 py-3 bg-[#F0F3FA]/40 border-b border-[#D5DEEF]/40 flex justify-between text-xs font-bold text-[#395886] uppercase tracking-wider">
            <span>Category Name</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#D5DEEF]/40 max-h-[350px] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm font-bold text-[#638ECB]/70">
                No categories available yet.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F0F3FA]/20 transition-all duration-150"
                >
                  {editingId === category.id ? (
                    /* Edit mode */
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-[#638ECB] px-3 py-1.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] outline-none"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        required
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={!editingName.trim() || updating}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {updating ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={updating}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 px-2 rounded bg-[#D5DEEF] text-[#395886] text-[10px] font-bold flex items-center justify-center">
                          #{category.id}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {category.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          className="p-2 rounded-lg text-[#638ECB] hover:text-[#395886] hover:bg-[#F0F3FA] transition-all cursor-pointer"
                          aria-label="Edit category"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deletingId !== null}
                          className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all disabled:opacity-50 cursor-pointer"
                          aria-label="Delete category"
                        >
                          {deletingId === category.id ? (
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
