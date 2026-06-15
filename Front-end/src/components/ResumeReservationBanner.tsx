"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadReservationProgress, clearReservationProgress } from "@/lib/reservationStorage";
import type { SavedReservation } from "@/lib/reservationStorage";
import { Clock, X, ArrowRight, Trash2, Car } from "lucide-react";

export default function ResumeReservationBanner() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedReservation | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const data = loadReservationProgress();
    if (data) {
      setSaved(data);
      setVisible(true);
    }
  }, []);

  function handleComplete() {
    setVisible(false);
    setTimeout(() => {
      router.push(`/vehicles/${saved!.vehicleId}`);
    }, 200);
  }

  function handleCancel() {
    clearReservationProgress();
    setVisible(false);
  }

  const daysDiff = saved
    ? Math.ceil(
        (new Date(saved.endDate).getTime() - new Date(saved.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <AnimatePresence>
      {visible && saved && (
        <motion.div
          initial={{ opacity: 0, y: -120, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -120, scale: 0.92 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] w-[94%] max-w-xl"
        >
          <div className="relative bg-white rounded-3xl border-2 border-[#D5DEEF]/80 shadow-[0_20px_60px_-12px_rgba(57,88,134,0.25)] overflow-hidden">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#395886]" />

            {/* Subtle background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#638ECB]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#395886]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F0F3FA] hover:bg-[#D5DEEF] flex items-center justify-center transition-all z-10 group"
            >
              <X className="w-4 h-4 text-[#638ECB] group-hover:text-[#395886] transition-colors" />
            </button>

            <div className="relative p-7 pt-8">
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#395886] to-[#638ECB] flex items-center justify-center shadow-lg shadow-[#395886]/20">
                  <Clock className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-extrabold text-[#395886] tracking-tight">
                    Réservation en attente
                  </h3>
                  <p className="text-sm font-semibold text-[#638ECB] mt-2 leading-relaxed">
                    Tu as laissé une réservation pour{" "}
                    <span className="text-[#395886] font-extrabold">{saved.vehicleName}</span>{" "}
                    ({daysDiff} jours). Tu veux continuer ou annuler ?
                  </p>
                </div>
              </div>

              {/* Info pill */}
              <div className="mt-4 ml-[84px] flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F3FA] border border-[#D5DEEF]/60">
                  <Car className="w-3.5 h-3.5 text-[#638ECB]" />
                  <span className="text-[11px] font-bold text-[#638ECB]">{saved.vehicleName}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#638ECB]/60">•</span>
                <span className="text-[11px] font-semibold text-[#638ECB]/60">{daysDiff} jours</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-5 ml-[84px]">
                <button
                  onClick={handleCancel}
                  className="flex-1 h-12 rounded-xl border-2 border-[#D5DEEF] bg-white text-[#638ECB] font-extrabold text-[13px] hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 hover:text-[#395886] transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Annuler
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-[#395886] to-[#638ECB] text-white font-extrabold text-[13px] shadow-lg shadow-[#395886]/25 hover:shadow-xl hover:shadow-[#395886]/35 hover:from-[#2b4c7e] hover:to-[#4a7bb8] transition-all flex items-center justify-center gap-2 group"
                >
                  Continuer la réservation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
