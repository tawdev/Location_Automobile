"use client";

import React, { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import type { Reservation } from "@/lib/types";
import { cancelReservation, getMyReservations } from "@/lib/reservationsApi";
import { useRouter } from "next/navigation";

function ReservationCard({
  r,
  onCancel,
  cancelling,
}: {
  r: Reservation;
  onCancel: (id: number) => void;
  cancelling: boolean;
}) {
  return (
    <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-black text-xl leading-tight">
            Reservation #{r.id}
          </div>
          <div className="font-bold">
            Vehicle ID: {r.vehicle_id} • User ID: {r.user_id}
          </div>
          <div className="mt-2 font-bold">
            From: <span className="font-black">{r.start_date}</span>
          </div>
          <div className="font-bold">
            To: <span className="font-black">{r.end_date}</span>
          </div>
          <div className="mt-2 font-black text-lg">Status: {r.status}</div>
          <div className="font-bold">Total: {r.TotalPrice}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(r.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function loadReservations() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reservations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReservations();
  }, []);

  async function onCancel(id: number) {
    setCancellingId(id);
    setError(null);
    try {
      await cancelReservation(id);
      await loadReservations();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to cancel reservation";
      setError(msg);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-zinc-50 text-black">
        <div className="border-b-4 border-black bg-white p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="font-black text-xl leading-tight">
              Location Automobile
            </div>
            <div className="font-bold text-sm">My reservations</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/vehicles")}
              className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
            >
              Vehicles
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
            >
              Profile
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4">
          <h1 className="font-black text-3xl my-5">Reservations</h1>

          {error ? (
            <div className="mt-2 mb-4 p-3 border-2 border-black bg-white font-bold">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 font-black">Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="mt-6 p-4 border-2 border-black bg-white font-black text-center">
              No reservations yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reservations.map((r) => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  onCancel={onCancel}
                  cancelling={cancellingId === r.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
