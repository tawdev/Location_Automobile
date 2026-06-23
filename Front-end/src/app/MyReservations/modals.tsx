"use client";

import { useState, memo, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { AlertTriangle, X, CheckCircle, Loader2, Calendar, MapPin, Fuel, Gauge, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=128&q=75&fm=webp";
const FALLBACK_IMG_DETAIL = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=680&q=80&fm=webp";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; glow: string; border: string }> = {
  en_attente:  { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400", glow: "hover:shadow-amber-900/5 dark:hover:shadow-amber-400/5", border: "border-l-amber-400" },
  confirmée:   { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-400", glow: "hover:shadow-blue-900/5 dark:hover:shadow-blue-400/5", border: "border-l-blue-500" },
  terminée:    { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-400", glow: "hover:shadow-emerald-900/5 dark:hover:shadow-emerald-400/5", border: "border-l-emerald-500" },
  annulée:     { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-400", glow: "hover:shadow-rose-900/5 dark:hover:shadow-rose-400/5", border: "border-l-rose-500" },
};

function getStatusConfig(s: string) {
  return STATUS_CONFIG[s.toLowerCase()] ?? STATUS_CONFIG.en_attente;
}

function statusLabel(s: string, t: (key: string) => string) {
  if (!s) return t("reservations.upcoming").toUpperCase();
  const map: Record<string, string> = {
    "en_attente": t("reservations.status.pending"),
    "confirmée": t("reservations.status.confirmed"),
    "terminée": t("reservations.status.completed"),
    "annulée": t("reservations.status.cancelled"),
  };
  return map[s.toLowerCase()] ?? s.toUpperCase();
}

function formatDateStr(dateStr: string) {
  return formatDate(dateStr);
}

function vehicleName(r: { vehicle?: { name?: string; brand?: string; model?: string } }, fallback = "Vehicle") {
  if (r.vehicle?.name) return r.vehicle.name;
  if (r.vehicle?.brand && r.vehicle?.model)
    return `${r.vehicle.brand} ${r.vehicle.model}`;
  return fallback;
}

function vehicleImage(r: { vehicle?: { image_url?: string; image?: string } }) {
  return r.vehicle?.image_url ?? r.vehicle?.image ?? FALLBACK_IMG;
}

function refCode(r: { reference?: string; id: number }) {
  return r.reference ?? `#CFF-${String(r.id).padStart(4, "0")}`;
}

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const c = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${c.bg} ${c.text} shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {statusLabel(status, t)}
    </span>
  );
});

const DetailImage = memo(function DetailImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={340}
      height={200}
      className="w-full h-full object-cover"
      style={{ minHeight: 200 }}
      onError={() => setImgSrc(FALLBACK_IMG_DETAIL)}
      sizes="(max-width: 768px) 100vw, 340px"
      quality={80}
      unoptimized
    />
  );
});

interface ModalData {
  type: "confirm" | "error" | "success";
  message: string;
  resId?: number;
}

interface Reservation {
  id: number;
  reference?: string;
  status: string;
  total_price: number;
  pickup_date: string;
  dropoff_date: string;
  pickup_location?: string;
  dropoff_location?: string;
  vehicle?: {
    id: number;
    name?: string;
    brand?: string;
    model?: string;
    image?: string;
    image_url?: string;
    fuelType?: string;
    Occupants?: string;
    year?: number;
  };
}

export function ConfirmDialog({
  modal,
  onClose,
  onConfirm,
  cancelling,
  dialogRef,
}: {
  modal: ModalData;
  onClose: () => void;
  onConfirm: () => void;
  cancelling: boolean;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!dialogRef.current) return;
    const container = dialogRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [dialogRef]);

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={modal.type === "confirm" ? t("reservations.cancel_confirm") : modal.type === "error" ? t("reservations.cancel_error") : t("reservations.cancel_success")}
    >
      <motion.div
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-sm w-full p-8 flex flex-col items-center gap-5 border border-white/50 dark:border-[#1e293b]/70"
        initial={prefersReducedMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1e293b]/60 hover:bg-gray-200 dark:hover:bg-[#1e293b] flex items-center justify-center text-gray-400 dark:text-[#94A3B8] hover:text-gray-600 dark:hover:text-[#D5DEEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {modal.type === "confirm" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-950/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm text-gray-800 dark:text-[#D5DEEF] font-bold text-center">{modal.message}</p>
            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-[#D5DEEF] dark:border-[#1e293b]/70 text-[#395886] dark:text-[#D5DEEF] font-extrabold text-sm py-3 rounded-xl hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
              >
                {t("reservations.cancel_modal_keep")}
              </button>
              <button
                onClick={onConfirm}
                disabled={cancelling}
                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t("reservations.cancel_modal_cancelling")}</>
                ) : (
                  t("reservations.cancel_yes")
                )}
              </button>
            </div>
          </>
        )}

        {modal.type === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-950/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm text-gray-800 dark:text-[#D5DEEF] font-bold text-center">{modal.message}</p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
            >
              OK
            </button>
          </>
        )}

        {modal.type === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-950/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-800 dark:text-[#D5DEEF] font-bold text-center">{modal.message}</p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
            >
              OK
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function DetailDialog({
  res,
  onClose,
  onCancel,
  dialogRef,
}: {
  res: Reservation;
  onClose: () => void;
  onCancel: () => void;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t, locale } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!dialogRef.current) return;
    const container = dialogRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [dialogRef]);

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={t("reservations.details_title")}
    >
      <motion.div
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-3xl flex flex-col max-h-[90vh] border border-white/50 dark:border-[#1e293b]/70"
        initial={prefersReducedMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-[#dde4ef] to-[#e8edf5] dark:from-[#0f1729] dark:to-[#1a2332] px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
          <h2 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("reservations.details_title")}</h2>
          <button
            onClick={onClose}
            aria-label={t("reservations.back_to_history")}
            className="w-8 h-8 rounded-full bg-white/60 dark:bg-[#1e293b]/60 hover:bg-white dark:hover:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] hover:text-[#1d3560] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 py-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="w-full md:w-[340px] flex-shrink-0 rounded-2xl overflow-hidden bg-[#1a1e2e] ring-2 ring-[#D5DEEF]/30 dark:ring-[#1e293b]/80 shadow-lg" style={{ minHeight: 200 }}>
              <DetailImage
                src={vehicleImage(res)}
                alt={vehicleName(res, t("vehicle.default_name"))}
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#638ECB] dark:text-[#94A3B8]">{t("reservations.ref_label")} {refCode(res).replace("#", "")}</span>
                <StatusBadge status={res.status} />
              </div>

              <div className="mb-4">
                <h2 className="text-3xl font-black text-[#395886] dark:text-[#D5DEEF] leading-tight">{vehicleName(res, t("vehicle.default_name"))}</h2>
                <p className="text-[#638ECB] dark:text-[#94A3B8] text-sm font-semibold mt-1">{res.vehicle?.brand} {res.vehicle?.model}</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#0f1729] dark:to-[#1a2332] border border-gray-100 dark:border-[#1e293b]/70 rounded-2xl px-6 py-5 flex items-center justify-between mt-auto shadow-sm">
                <span className="text-sm font-bold text-gray-600 dark:text-[#94A3B8]">{t("reservations.total_amount")}</span>
                <span className="text-2xl font-black text-[#395886] dark:text-[#D5DEEF]">{Number(res.total_price).toLocaleString(locale)} DH</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-[#1e293b]/70 rounded-2xl overflow-hidden flex flex-col md:flex-row mb-8 shadow-sm">
            <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#1e293b]/70 bg-white/50 dark:bg-[#0f1729]/40">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b]/60 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#395886] dark:text-[#D5DEEF]" />
                </div>
                <span className="text-[#395886] dark:text-[#D5DEEF] font-extrabold text-sm">{t("reservations.pickup_label")}</span>
              </div>
              <div className="border-l-2 border-[#D5DEEF] dark:border-[#1e293b]/70 pl-4">
                <p className="text-[11px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-widest mb-1">{t("reservations.date_label")}</p>
                <p className="text-base font-bold text-[#395886] dark:text-[#D5DEEF]">
                  {formatDateStr(res.pickup_date)}
                </p>
                {res.pickup_location && (
                  <p className="text-xs font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {res.pickup_location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 px-6 py-5 bg-white/50 dark:bg-[#0f1729]/40">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b]/60 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#395886] dark:text-[#D5DEEF]" />
                </div>
                <span className="text-[#395886] dark:text-[#D5DEEF] font-extrabold text-sm">{t("reservations.return_label")}</span>
              </div>
              <div className="border-l-2 border-[#D5DEEF] dark:border-[#1e293b]/70 pl-4">
                <p className="text-[11px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-widest mb-1">{t("reservations.date_label")}</p>
                <p className="text-base font-bold text-[#395886] dark:text-[#D5DEEF]">
                  {formatDateStr(res.dropoff_date)}
                </p>
                {res.dropoff_location && (
                  <p className="text-xs font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {res.dropoff_location}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-extrabold text-[#395886] dark:text-[#D5DEEF] mb-4">{t("reservations.specs_title")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { label: t("reservations.fuel_label"), value: res.vehicle?.fuelType ?? "—", icon: Fuel },
                { label: t("reservations.gearbox_label"), value: "Automatique", icon: Gauge },
                { label: t("reservations.seats_label"), value: res.vehicle?.Occupants ?? "—", icon: Users },
                { label: t("reservations.year_label"), value: res.vehicle?.year?.toString() ?? "—", icon: Calendar },
              ] as const).map((spec) => (
                <div key={spec.label} className="bg-white/70 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 rounded-xl px-4 py-5 flex flex-col items-center gap-2.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b]/60 flex items-center justify-center">
                    <spec.icon className="w-4 h-4 text-[#395886] dark:text-[#D5DEEF]" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-wider">{spec.label}</p>
                  <p className="text-sm font-black text-[#395886] dark:text-[#D5DEEF]">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border-2 border-[#D5DEEF] dark:border-[#1e293b]/70 text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638ECB]/50 transition-all"
            >
              {t("reservations.cancel_in_detail")}
            </motion.button>
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-sm font-extrabold shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-all"
            >
              {t("reservations.back_to_history")}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
