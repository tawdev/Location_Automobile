"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Extra } from "@/lib/types";
import { getAdminExtras, createAdminExtra, updateAdminExtra, deleteAdminExtra, type AdminExtraPayload } from "@/lib/adminExtrasApi";
import { getApiOrigin } from "@/lib/media";
import { Package, Plus, Pencil, Trash2, Eye, X, AlertCircle, ImageIcon, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ModalMode = "create" | "edit" | null;

function extraImageUrl(extra: Extra): string | null {
  if (extra.image_url) return extra.image_url;
  if (extra.image) return `${getApiOrigin()}/storage/${extra.image}`;
  return null;
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse flex items-center gap-4 p-4">
      <div className="w-20 h-20 rounded-2xl bg-[#F0F3FA] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-1/4" />
        <div className="h-4 bg-[#F0F3FA] rounded-md w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3FA]/50 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-3xl mb-6 shadow-sm">
          <Package className="w-8 h-8 text-[#638ECB]" />
        </div>
        <h3 className="text-lg font-black text-[#395886] mb-2">
          {t("admin.no_extras")}
        </h3>
        <p className="text-sm font-bold text-[#638ECB] mb-6 max-w-xs">
          {t("admin.no_extras_desc")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("admin.create")}
        </button>
      </div>
    </motion.div>
  );
}

function ImageLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center w-screen h-screen p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all z-10 cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={url}
          alt={name}
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-2xl"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
          <span className="text-white/90 text-base font-bold">{name}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminExtrasPage() {
  const { t } = useI18n();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExtras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminExtras();
      setExtras(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du chargement des extras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExtras();
  }, [loadExtras]);

  const totalExtras = extras.length;

  function openCreateModal() {
    setModalMode("create");
    setEditingExtra(null);
    setFormName("");
    setFormPrice("");
    setFormImage(null);
    setFormImagePreview(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(extra: Extra) {
    setModalMode("edit");
    setEditingExtra(extra);
    setFormName(extra.name);
    setFormPrice(String(extra.price_per_day));
    setFormImage(null);
    setFormImagePreview(null);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalMode(null);
    setEditingExtra(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  }

  function clearSelectedImage() {
    setFormImage(null);
    setFormImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) return;
    if (isNaN(parseFloat(formPrice)) || parseFloat(formPrice) <= 0) {
      setFormError("Le prix doit être un nombre positif.");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const payload: AdminExtraPayload = {
      name: formName.trim(),
      price_per_day: parseFloat(formPrice),
      image: formImage || undefined,
    };

    try {
      if (modalMode === "create") {
        await createAdminExtra(payload);
      } else if (modalMode === "edit" && editingExtra) {
        await updateAdminExtra(editingExtra.id, payload);
      }
      closeModal();
      await loadExtras();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Échec de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(extraId: number) {
    setDeletingId(extraId);
    setError(null);
    try {
      await deleteAdminExtra(extraId);
      await loadExtras();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  const existingImageUrl = modalMode === "edit" && editingExtra ? extraImageUrl(editingExtra) : null;
  const displayImagePreview = formImagePreview || (modalMode === "edit" && !formImage ? existingImageUrl : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
              {t("admin.extras_title")}
            </h1>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("admin.create")}
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#D5DEEF]/60 px-5 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#395886]" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE]">
              Total extras
            </div>
            <div className="text-xl font-black text-[#395886] tabular-nums">
              {totalExtras}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error banner */}
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

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : extras.length === 0 ? (
        <EmptyState onCreate={openCreateModal} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {extras.map((extra) => {
              const imgUrl = extraImageUrl(extra);
              return (
                <motion.div
                  key={extra.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-center gap-4 rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300 p-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F0F3FA] border border-[#D5DEEF]/40 shrink-0">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={extra.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-7 h-7 text-[#D5DEEF]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
                        {extra.name}
                      </h4>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F3FA] text-[#638ECB] border border-[#D5DEEF]/50">
                        #{extra.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm font-bold text-[#395886]">
                      <span className="tabular-nums">{extra.price_per_day}</span>
                      <span className="text-xs font-bold text-[#638ECB]">
                        DH / jour
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (imgUrl) setLightbox({ url: imgUrl, name: extra.name });
                      }}
                      className="h-9 w-9 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                      title="Voir l'image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(extra)}
                      className="h-9 px-4 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-xs hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      {t("admin.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === extra.id}
                      onClick={() => handleDelete(extra.id)}
                      className="h-9 px-4 rounded-xl border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === extra.id
                        ? "..."
                        : t("admin.delete")}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 shadow-[0_20px_60px_rgba(57,88,134,0.12)] max-w-lg w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#395886]" />
                  </div>
                  <h2 className="text-xl font-black text-[#395886]">
                    {modalMode === "create"
                      ? t("admin.create")
                      : t("admin.edit_extra")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#638ECB] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
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
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                    Nom
                  </label>
                  <input
                    className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                    placeholder="GPS, Siège bébé..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                    Prix par jour (DH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all w-full"
                      placeholder="0.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#B0C4DE] pointer-events-none">
                      DH
                    </span>
                  </div>
                </div>

                {/* Image upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                    Image
                  </label>

                  {displayImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#D5DEEF]/60 bg-[#F0F3FA] aspect-[16/9]">
                      <img
                        src={displayImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="opacity-0 hover:opacity-100 transition-opacity h-10 px-5 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-extrabold text-[#395886] shadow-sm cursor-pointer"
                        >
                          Changer l'image
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
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
                        Cliquez pour ajouter une image
                      </span>
                      <span className="text-[10px] font-bold text-[#B0C4DE]">
                        JPG, PNG, WEBP (max 5 Mo)
                      </span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !formName.trim() || !formPrice.trim()}
                    className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting
                      ? t("admin.loading")
                      : modalMode === "create"
                        ? t("admin.create")
                        : t("admin.save")}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-11 px-6 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-sm hover:bg-[#F0F3FA] transition-all active:scale-95 cursor-pointer"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image lightbox */}
      {lightbox && (
        <ImageLightbox
          url={lightbox.url}
          name={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
