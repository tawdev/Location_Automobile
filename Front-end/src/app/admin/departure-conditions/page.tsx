"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DepartureCondition } from "@/lib/departureConditionsApi";
import {
  getAdminDepartureConditions,
  createAdminDepartureCondition,
  updateAdminDepartureCondition,
  deleteAdminDepartureCondition,
} from "@/lib/departureConditionsApi";
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function SkeletonRow() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-xl bg-[#F0F3FA] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
      </div>
    </div>
  );
}

export default function AdminDepartureConditionsPage() {
  const { t } = useI18n();
  const [conditions, setConditions] = useState<DepartureCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartureCondition | null>(null);
  const [formName, setFormName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadConditions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDepartureConditions();
      setConditions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConditions();
  }, [loadConditions]);

  const filteredConditions = conditions.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreate() {
    setEditingItem(null);
    setFormName("");
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(item: DepartureCondition) {
    setEditingItem(item);
    setFormName(item.name);
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingItem) {
        await updateAdminDepartureCondition(editingItem.id, { name: formName.trim() });
      } else {
        await createAdminDepartureCondition({ name: formName.trim() });
      }
      closeForm();
      await loadConditions();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Échec de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteAdminDepartureCondition(id);
      await loadConditions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
              Conditions de départ
            </h1>
            <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
              Gérez les éléments d&apos;état du véhicule au départ
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </motion.div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold text-[#638ECB] bg-white rounded-2xl border border-[#D5DEEF]/60 px-5 py-3 shadow-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          {filteredConditions.length} condition(s) définie(s)
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#638ECB]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une condition..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#D5DEEF] bg-white text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filteredConditions.length === 0 && conditions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm"
        >
          <div className="relative flex flex-col items-center max-w-md mx-auto">
            <h3 className="text-lg font-black text-[#395886] mb-2">
              Aucune condition de départ
            </h3>
            <p className="text-sm font-bold text-[#638ECB] mb-6 max-w-xs">
              Créez des éléments pour l&apos;état du véhicule au départ (ex: Véhicule propre, Pneus en bon état...)
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Créer une condition
            </button>
          </div>
        </motion.div>
      ) : filteredConditions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm"
        >
          <div className="relative flex flex-col items-center max-w-md mx-auto">
            <h3 className="text-lg font-black text-[#395886] mb-2">
              Aucun résultat
            </h3>
            <p className="text-sm font-bold text-[#638ECB] mb-6 max-w-xs">
              Aucune condition ne correspond à votre recherche.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredConditions.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.35 }}
                className="group flex items-center gap-4 rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300 p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0F3FA] flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#638ECB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
                    {item.name}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F3FA] text-[#638ECB] border border-[#D5DEEF]/50">
                    #{item.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="h-9 px-4 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-xs hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t("admin.edit")}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="h-9 px-4 rounded-xl border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === item.id ? "..." : t("admin.delete")}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 shadow-[0_20px_60px_rgba(57,88,134,0.12)] max-w-lg w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#395886]">
                  {editingItem ? "Modifier la condition" : "Nouvelle condition"}
                </h2>
                <button type="button" onClick={closeForm} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#638ECB] hover:bg-[#F0F3FA] transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {formError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">Nom</label>
                  <input
                    className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                    placeholder="Ex: Véhicule propre"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !formName.trim()}
                    className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? "Enregistrement..." : editingItem ? "Enregistrer" : "Créer"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="h-11 px-6 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-sm hover:bg-[#F0F3FA] transition-all active:scale-95 cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
