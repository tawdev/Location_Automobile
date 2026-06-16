import { apiRequest } from "./apiClient";
import { getAuthToken } from "./tokenStorage";
import { API_BASE_URL } from "./config";
import type { Reservation, ReservationPicture } from "./types";

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

export async function filterAdminReservations(filters: {
  start_date?: string;
  end_date?: string;
  status?: string;
  vehicle_marque?: string;
}): Promise<Reservation[]> {
  const res = await apiRequest<AdminReservationsResponse>({
    method: "GET",
    path: "/Reservation/filter",
    query: filters,
  });
  return ensureReservations(res.data);
}

export async function uploadContractScans(
  reservationId: number,
  files: File[]
): Promise<Reservation> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images[]", f));

  const token = getAuthToken();

  const res = await fetch(
    `${API_BASE_URL}/Reservations/${reservationId}/contract/scans`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }

  const json = await res.json();
  return json.data as Reservation;
}

export async function getReservationPictures(reservationId: number): Promise<ReservationPicture[]> {
  const res = await apiRequest<{ status: string; data: ReservationPicture[] }>({
    method: "GET",
    path: `/admin/reservations/${reservationId}/pictures`,
  });
  return res.data;
}

export async function uploadReservationPicture(
  reservationId: number,
  type: "before" | "after",
  file: File
): Promise<ReservationPicture> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("image", file);

  const token = getAuthToken();

  const res = await fetch(
    `${API_BASE_URL}/admin/reservations/${reservationId}/pictures`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }

  const json = await res.json();
  return json.data as ReservationPicture;
}

export async function deleteReservationPicture(pictureId: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/reservations/pictures/${pictureId}`,
  });
}
