import { apiRequest } from "./apiClient";
import type { Reservation } from "./types";

type MyReservationsResponse = {
  status: string;
  data: Reservation[];
};

export async function getMyReservations(): Promise<Reservation[]> {
  const res = await apiRequest<MyReservationsResponse>({
    method: "GET",
    path: "/MyReservations",
    auth: true,
  });
  return res.data ?? [];
}

type MakeReservationResponse = {
  status: string;
  message: string;
  data: Reservation;
};

export async function makeReservation(vehicleId: number, payload: Record<string, any> | FormData): Promise<Reservation> {
  const res = await apiRequest<MakeReservationResponse>({
    method: "POST",
    path: `/Reservations/vehicle/${vehicleId}`,
    body: payload,
  });
  return res.data;
}

export async function cancelReservation(reservationId: number): Promise<void> {
  await apiRequest<{ status: string; message?: string; data?: unknown }>({
    method: "PATCH",
    path: `/MyReservations/${reservationId}/annuler`,
    body: null,
    auth: true,
  });
}
