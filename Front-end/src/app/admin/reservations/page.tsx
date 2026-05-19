"use client";

import React, { useEffect, useState } from "react";
import { acceptAdminReservation, getAdminReservations, refuseAdminReservation } from "@/lib/adminReservationsApi";
import type { Reservation } from "@/lib/types";

function ReservationRow({
  reservation,
  onAccept,
  onRefuse,
  accepting,
  refusing,
}: {
  reservation: Reservation;
  onAccept: (id: number) => void;
  onRefuse: (id: number) => void;
  accepting: boolean;
  refusing: boolean;    
}) {
  const status = reservation.status;

  const isFinal =
    status === "Confirmée" || status === "Annulée" || status === "Términée";

  return (
    <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-black text-xl leading-tight">
            Reservation #{reservation.id}
          </div>

          <div className="font-bold text-sm mt-1">
            Vehicle ID: {reservation.vehicle_id} • User ID: {reservation.user_id}
          </div>

          <div className="mt-2 font-bold">
            From: <span className="font-black">{reservation.start_date}</span>
          </div>
          <div className="font-bold">
            To: <span className="font-black">{reservation.end_date}</span>
          </div>

          <div className="mt-2 font-black text-lg">
            Status: {reservation.status}
          </div>

          <div className="mt-1 font-bold">Total: {reservation.TotalPrice}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            disabled={isFinal || accepting}
            onClick={() => onAccept(reservation.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {accepting ? "Accepting..." : "Accept"}
          </button>

          <button
            type="button"
            disabled={isFinal || refusing}
            onClick={() => onRefuse(reservation.id)}
            className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {refusing ? "Refusing..." : "Refuse"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [refusingId, setRefusingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReservations();
      setReservations(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load reservations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onAccept(id: number) {
    setAcceptingId(id);
    setError(null);
    try {
      await acceptAdminReservation(id);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to accept reservation";
      setError(msg);
    } finally {
      setAcceptingId(null);
    }
  }

  async function onRefuse(id: number) {
    setRefusingId(id);
    setError(null);
    try {
      await refuseAdminReservation(id);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to refuse reservation";
      setError(msg);
    } finally {
      setRefusingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">Reservations</h1>
          <div className="font-bold text-sm mt-1">Admin accept / refuse</div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="font-black border-2 border-black px-4 py-2 bg-white hover:bg-zinc-100"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 border-2 border-black bg-white font-bold">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 font-black">Loading...</div>
      ) : reservations.length === 0 ? (
        <div className="mt-8 p-4 border-2 border-black bg-white font-black text-center">
          No reservations found.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {reservations.map((r) => (
            <ReservationRow
              key={r.id}
              reservation={r}
              onAccept={onAccept}
              onRefuse={onRefuse}
              accepting={acceptingId === r.id}
              refusing={refusingId === r.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
