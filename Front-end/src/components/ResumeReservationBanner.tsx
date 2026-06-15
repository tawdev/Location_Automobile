"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadReservationProgress, clearReservationProgress } from "@/lib/reservationStorage";
import type { SavedReservation } from "@/lib/reservationStorage";
import { Clock, X, ArrowRight, Trash2 } from "lucide-react";

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
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-lg"
        >
          <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#1a1a2e] border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl shadow-2xl shadow-amber-200/30 dark:shadow-amber-900/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.05),transparent_60%)]" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-400" />

            <button
              onClick={handleCancel}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </button>

            <div className="relative p-5 pt-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-300/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-extrabold text-amber-900 dark:text-amber-200">
                    Réservation en attente !
                  </h3>
                  <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                    Tu as laissé une réservation pour <strong>{saved.vehicleName}</strong>{" "}
                    ({daysDiff} jours). Tu veux continuer ou annuler ?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 h-11 rounded-xl border-2 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 font-extrabold text-[12px] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[12px] hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-300/30 flex items-center justify-center gap-1.5"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
