import { apiRequest } from "./apiClient";
import type { Reservation } from "./types";

type AdminReservationsResponse = {
  status: string;
  data: Reservation[] | string;
};

function ensureReservations(
  data: AdminReservationsResponse["data"]
): Reservation[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminReservations(): Promise<Reservation[]> {
  const res = await apiRequest<AdminReservationsResponse>({
    method: "GET",
    path: "/Reservations",
  });

  return ensureReservations(res.data);
}

export async function acceptAdminReservation(
  reservationId: number
): Promise<Reservation> {
  const res = await apiRequest<{ status: string; data: Reservation }>({
    method: "PATCH",
    path: `/Reservations/${reservationId}/confirme`,
    body: null,
  });

  return res.data;
}

export async function refuseAdminReservation(
  reservationId: number
): Promise<Reservation> {
  const res = await apiRequest<{ status: string; data: Reservation }>({
    method: "PATCH",
    path: `/Reservations/${reservationId}/annuler`,
    body: null,
  });

  return res.data;
}
