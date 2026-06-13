"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  acceptAdminReservation,
  getAdminReservations,
  refuseAdminReservation,
  filterAdminReservations,
  uploadContractScans,
} from "@/lib/adminReservationsApi";
import type { Reservation } from "@/lib/types";
import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const STATUS_STYLES: Record<string, string> = {
  En_Attente: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmée: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Annulée: "bg-rose-50 text-rose-600 border-rose-200",
  Terminée: "bg-sky-50 text-sky-700 border-sky-200",
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200";
}

const FINAL_STATUSES = ["Confirmée", "Annulée", "Terminée"];

function formatDate(dateStr: string, locale?: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale || "fr-FR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ImageModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
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
        className="relative flex items-center justify-center w-screen h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all z-10 cursor-pointer shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={url}
          alt={label}
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
          <span className="text-white/90 text-base font-bold">{label}</span>
        </div>
      </div>
    </div>
  );
}

function DocThumb({ url, label, onOpen }: { url: string | null | undefined; label: string; onOpen: (url: string, label: string) => void }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-[90px] h-[64px] rounded-xl bg-[#F0F3FA] border border-dashed border-[#D5DEEF]" />
        <span className="text-[10px] font-bold text-[#B0C4DE]">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => onOpen(url, label)}
        className="block w-[90px] h-[64px] rounded-xl overflow-hidden border border-[#D5DEEF]/60 hover:border-[#638ECB]/50 hover:shadow-md transition-all group relative cursor-pointer"
      >
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
          <svg className="w-5 h-5 text-white/0 group-hover:text-white/80 transition-all drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </button>
      <span className="text-[10px] font-bold text-[#638ECB]">{label}</span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
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
        <div className="h-9 w-24 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-24 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-24 rounded-xl bg-[#F0F3FA]" />
      </div>
    </div>
  );
}

function DetailModal({
  reservation,
  open,
  onClose,
  onOpenLightbox,
  onRefresh,
}: {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  onOpenLightbox: (url: string, label: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t, locale } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLabel = useCallback((s: string) => {
    const map: Record<string, string> = {
      En_Attente: t("admin.status_pending"),
      Confirmée: t("admin.status_confirmed"),
      Annulée: t("admin.status_cancelled"),
      Terminée: t("admin.status_completed"),
    };
    return map[s] ?? s;
  }, [t]);

  async function handleUploadScans(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      await uploadContractScans(reservation!.id, Array.from(files));
      await onRefresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !reservation) return null;

  const userName = reservation.user?.name ?? `Utilisateur #${reservation.user_id}`;
  const userEmail = reservation.user?.email ?? "";
  const vehicleName = reservation.vehicle
    ? `${reservation.vehicle.marque} ${reservation.vehicle.model}`
    : `Véhicule #${reservation.vehicle_id}`;

  const vehiclePic = reservation.vehicle?.pictures?.[0]?.path
    ? vehicleImageUrl(reservation.vehicle.pictures[0].path)
    : null;

  const cinRecto = reservation.user?.cin_recto ? vehicleImageUrl(reservation.user.cin_recto) : null;
  const cinVerso = reservation.user?.cin_verso ? vehicleImageUrl(reservation.user.cin_verso) : null;
  const permiRecto = reservation.user?.permi_recto ? vehicleImageUrl(reservation.user.permi_recto) : null;
  const permiVerso = reservation.user?.permi_verso ? vehicleImageUrl(reservation.user.permi_verso) : null;

  const ss = statusStyle(reservation.status);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-[#D5DEEF]/80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F0F3FA] border border-[#D5DEEF]/40 shrink-0">
              {vehiclePic ? (
                <img src={vehiclePic} alt={vehicleName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#B0C4DE] text-xs font-bold">—</div>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-[#395886] text-lg leading-tight">{vehicleName}</h3>
              <p className="text-xs font-bold text-[#638ECB]">{userName}</p>
            </div>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${ss}`}>
            {statusLabel(reservation.status)}
          </span>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] flex items-center justify-center transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 pt-4 space-y-5">
          {/* Vehicle details */}
          <div className="p-4 rounded-2xl bg-[#F0F3FA]/40 border border-[#D5DEEF]/40 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.vehicle")}</span>
              <span className="text-sm font-bold text-[#395886]">{vehicleName}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.price_per_day_label")}</span>
              <span className="text-sm font-bold text-[#395886]">{reservation.vehicle?.pricePerDay ?? "—"} MAD</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.client")}</span>
              <span className="text-sm font-bold text-[#395886]">{userName}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.email")}</span>
              <span className="text-sm font-bold text-[#395886] truncate block">{userEmail || "—"}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="p-4 rounded-2xl bg-[#F0F3FA]/40 border border-[#D5DEEF]/40 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.start")}</span>
              <span className="text-sm font-bold text-[#395886]">{formatDate(reservation.start_date, locale)}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.end")}</span>
              <span className="text-sm font-bold text-[#395886]">{formatDate(reservation.end_date, locale)}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-[#D5DEEF]/30">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.total")}</span>
              <span className="text-xl font-black text-[#395886]">{reservation.TotalPrice} MAD</span>
            </div>
          </div>

          {/* Documents */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B0C4DE] block mb-3">
              {t("admin.client_documents")}
            </span>
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex items-start gap-3">
                <DocThumb url={cinRecto} label={t("admin.cin_front")} onOpen={onOpenLightbox} />
                <DocThumb url={cinVerso} label={t("admin.cin_back")} onOpen={onOpenLightbox} />
              </div>
              <div className="w-px h-[72px] bg-[#D5DEEF]/40 hidden sm:block self-center" />
              <div className="flex items-start gap-3">
                <DocThumb url={permiRecto} label={t("admin.license_front")} onOpen={onOpenLightbox} />
                <DocThumb url={permiVerso} label={t("admin.license_back")} onOpen={onOpenLightbox} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#D5DEEF]/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B0C4DE] block mb-3">
                Contrat signé
              </span>
              {reservation.contract_pdf ? (
                <a
                  href={`${getApiOrigin()}/storage/${reservation.contract_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 px-4 rounded-xl bg-[#395886] hover:bg-[#2c4570] text-white font-bold text-xs transition-all active:scale-95 items-center justify-center gap-2 cursor-pointer no-underline"
                >
                  <FileIcon />
                  <span>Télécharger le contrat</span>
                </a>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[#638ECB] mb-2">
                    Scanner le contrat signé et générer le PDF
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadScans}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 px-4 rounded-xl bg-[#395886] hover:bg-[#2c4570] disabled:bg-[#B0C4DE] text-white font-bold text-xs transition-all active:scale-95 items-center justify-center gap-2 cursor-pointer"
                  >
                    {uploading ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <UploadIcon />
                    )}
                    <span>{uploading ? "Génération..." : "Ajouter le contrat scanné"}</span>
                  </button>
                  {uploadError && (
                    <p className="mt-2 text-xs font-bold text-rose-600">{uploadError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  const { t, locale } = useI18n();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"accept" | "refuse" | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);
  const openLightbox = useCallback((url: string, label: string) => setLightbox({ url, label }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function buildFilters() {
    const filters: Record<string, string> = {};
    if (search.trim()) filters.vehicle_marque = search.trim();
    if (status !== "all") filters.status = status;
    return filters;
  }

  const hasFilters = search.trim() || status !== "all";

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const f = buildFilters();
      const data = Object.keys(f).length > 0
        ? await filterAdminReservations(f)
        : await getAdminReservations();
      setReservations(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.reservations_load_error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
  }

  function handleStatusChange(value: string | null) {
    setStatus(value ?? "all");
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void load();
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function handleAccept(id: number) {
    setActionId(id);
    setActionType("accept");
    setError(null);
    try {
      await acceptAdminReservation(id);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.reservation_confirm_error");
      setError(msg);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handleRefuse(id: number) {
    setActionId(id);
    setActionType("refuse");
    setError(null);
    try {
      await refuseAdminReservation(id);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.reservation_refuse_error");
      setError(msg);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handleQuickUpload(id: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingId(id);
    setError(null);
    try {
      await uploadContractScans(id, Array.from(files));
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
    } finally {
      setUploadingId(null);
    }
  }

  const statusLabel = useCallback((s: string) => {
    const map: Record<string, string> = {
      En_Attente: t("admin.status_pending"),
      Confirmée: t("admin.status_confirmed"),
      Annulée: t("admin.status_cancelled"),
      Terminée: t("admin.status_completed"),
    };
    return map[s] ?? s;
  }, [t]);

  const isBusy = (id: number) => actionId === id;
  const isAccepting = (id: number) => isBusy(id) && actionType === "accept";
  const isRefusing = (id: number) => isBusy(id) && actionType === "refuse";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#395886]">{t("admin.reservations_title")}</h1>
          <p className="text-sm font-bold text-[#638ECB] mt-1">
            {t("admin.reservations_subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-white border border-[#D5DEEF] text-[#395886] font-bold text-xs hover:bg-[#F0F3FA] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          <RefreshIcon />
          <span>{loading ? t("admin.loading") : t("admin.refresh")}</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-5 p-4 rounded-2xl bg-white border border-[#D5DEEF]/60 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE] block mb-1.5">
              {t("admin.filter_vehicle")}
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0C4DE] pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.search_brand")}
                className="w-full pl-10 pr-4 h-10 rounded-xl border border-[#D5DEEF]/60 bg-[#F0F3FA] text-sm text-[#395886] font-bold placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
              />
            </div>
          </div>

          <div className="w-full sm:w-[180px]">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE] block mb-1.5">
              {t("admin.filter_status")}
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-10 rounded-xl border border-[#D5DEEF]/60 bg-[#F0F3FA] text-sm text-[#395886] font-bold">
                <SelectValue placeholder={t("admin.all_statuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.all")}</SelectItem>
                <SelectItem value="En_Attente">{t("admin.status_pending")}</SelectItem>
                <SelectItem value="Confirmée">{t("admin.status_confirmed")}</SelectItem>
                <SelectItem value="Annulée">{t("admin.status_cancelled")}</SelectItem>
                <SelectItem value="Terminée">{t("admin.status_completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="flex gap-2 w-full sm:w-auto">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[#D5DEEF]/60 bg-white text-[#395886] font-bold text-xs hover:bg-[#F0F3FA] transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{t("admin.clear")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-[#D5DEEF]/40 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#B0C4DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-[#395886]">
            {hasFilters ? t("admin.no_reservations_filter") : t("admin.no_reservations_yet")}
          </h3>
          <p className="text-sm font-bold text-[#638ECB] mt-1">
            {hasFilters
              ? t("admin.adjust_filters")
              : t("admin.reservations_appear")}
          </p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => {
            const isFinal = FINAL_STATUSES.includes(r.status);
            const ss = statusStyle(r.status);
            const userName = r.user?.name ?? `Utilisateur #${r.user_id}`;
            const vehicleName = r.vehicle
              ? `${r.vehicle.marque} ${r.vehicle.model}`
              : `Véhicule #${r.vehicle_id}`;

            const vehiclePic = r.vehicle?.pictures?.[0]?.path
              ? vehicleImageUrl(r.vehicle.pictures[0].path)
              : null;

            return (
              <div
                key={r.id}
                className="group flex items-center gap-4 rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300 p-4"
              >
                {/* Vehicle image */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F0F3FA] border border-[#D5DEEF]/40 shrink-0">
                  {vehiclePic ? (
                    <img
                      src={vehiclePic}
                      alt={vehicleName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#638ECB]/50 text-[10px]">
                      {t("admin.no_image")}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
                      {vehicleName}
                    </h4>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ss}`}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-[#638ECB]">
                    <span>{userName}</span>
                    <span className="text-[#D5DEEF]">|</span>
                    <span>{formatDate(r.start_date, locale)}</span>
                    <svg className="w-3 h-3 text-[#B0C4DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>{formatDate(r.end_date, locale)}</span>
                    <span className="text-[#D5DEEF]">|</span>
                    <span className="text-[#395886] font-bold">{r.TotalPrice} MAD</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDetailReservation(r)}
                    className="h-9 px-4 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <EyeIcon />
                    <span>{t("admin.view_details")}</span>
                  </button>
                  {r.contract_pdf ? (
                    <a
                      href={`${getApiOrigin()}/storage/${r.contract_pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer no-underline"
                    >
                      <FileIcon />
                      <span>Contrat</span>
                    </a>
                  ) : (
                    <>
                      <input
                        ref={(el) => { if (el) fileInputRefs.current.set(r.id, el); else fileInputRefs.current.delete(r.id); }}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => { handleQuickUpload(r.id, e.target.files); }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingId === r.id}
                        onClick={() => fileInputRefs.current.get(r.id)?.click()}
                        className="h-9 px-4 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {uploadingId === r.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <UploadIcon />
                        )}
                        <span>Scanner</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={isFinal || isAccepting(r.id)}
                    onClick={() => handleAccept(r.id)}
                    className={`h-9 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isFinal
                        ? "bg-zinc-50 text-zinc-400 border border-zinc-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {isAccepting(r.id) ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {!isAccepting(r.id) && <span>{t("admin.confirm")}</span>}
                  </button>
                  <button
                    type="button"
                    disabled={isFinal || isRefusing(r.id)}
                    onClick={() => handleRefuse(r.id)}
                    className={`h-9 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isFinal
                        ? "bg-zinc-50 text-zinc-400 border border-zinc-200"
                        : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {isRefusing(r.id) ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {!isRefusing(r.id) && <span>{t("admin.refuse")}</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <ImageModal url={lightbox.url} label={lightbox.label} onClose={closeLightbox} />
      )}

      <DetailModal
        reservation={detailReservation}
        open={!!detailReservation}
        onClose={() => setDetailReservation(null)}
        onOpenLightbox={openLightbox}
        onRefresh={load}
      />
    </div>
  );
}
