"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RequireClient } from "@/components/RequireClient";
import BackButton from "@/components/BackButton";
import { makeReservation } from "@/lib/reservationsApi";
import { useAuth } from "@/lib/authContext";

export default function ReservationNewPage() {
  const router = useRouter();
  const params = useParams<{ vehicleId: string }>();
  const { refreshUser } = useAuth();

  const vehicleId = useMemo(() => {
    const raw = params.vehicleId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.vehicleId]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (endDate && startDate && endDate < startDate) {
      setEndDate("");
    }
  }, [startDate]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!vehicleId) {
      setError("ID véhicule invalide.");
      setSubmitting(false);
      return;
    }

    try {
      await makeReservation(vehicleId, { start_date: startDate, end_date: endDate });
      await refreshUser();
      router.replace("/reservations");
    } catch (e) {
      const errMsg = (e as { message?: string })?.message || "";
      if (errMsg.includes("CIN") || errMsg.includes("permi")) {
        router.push("/profile?upload=documents");
        return;
      }
      setError(errMsg || "Échec de la création de la réservation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireClient>
      <div className="min-h-screen bg-zinc-50 text-black p-4">
        <div className="max-w-xl mx-auto border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <BackButton />
          <h1 className="font-black text-3xl mb-2">Nouvelle réservation</h1>
          <p className="font-bold mb-6">Véhicule ID : {vehicleId ?? "—"}</p>

          {error ? (
            <div className="mb-4 p-3 border-2 border-black bg-white font-bold">{error}</div>
          ) : null}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-bold">Date de début</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-black p-2"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Date de fin</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="border-2 border-black p-2"
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
            >
              {submitting ? "Création..." : "Réserver"}
            </button>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => router.push("/reservations")}
                className="underline font-bold"
              >
                Mes réservations
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireClient>
  );
}
