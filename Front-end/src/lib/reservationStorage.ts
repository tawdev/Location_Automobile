export type SavedReservation = {
  vehicleId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  startDateTime?: string;
  endDateTime?: string;
  savedChoice: "one" | "two" | null;
  step: string;
  selectedExtraIds: number[];
  departCountryId?: number | null;
  departCityId?: number | null;
  returnCountryId?: number | null;
  returnCityId?: number | null;
  departLocationType?: string;
  returnLocationType?: string;
  returnLocationName?: string;
  returnLocationSupplement?: number;
  selectedReturnLocationId?: number | null;
  clientNom: string;
  clientDateNaissance: string;
  clientCin: string;
  clientAdresse: string;
  clientTelephone: string;
  clientNumeroPermi: string;
  clientDateDelivrance: string;
  clientDateExpiration: string;
  driver2Name: string;
  sdNom: string;
  sdDateNaissance: string;
  sdCin: string;
  sdAdresse: string;
  sdTelephone: string;
  sdNumeroPermi: string;
  sdDateDelivrance: string;
  sdDateExpiration: string;
  protectionLevel: "basic" | "gold" | "platinum";
  savedAt: string;
};

const STORAGE_KEY = "pendingReservation";

export function saveReservationProgress(data: Partial<SavedReservation> & { vehicleId: number; vehicleName: string; startDate: string; endDate: string }): void {
  const existing = loadReservationProgress();
  const merged = { ...existing, ...data, savedAt: new Date().toISOString() } as SavedReservation;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function loadReservationProgress(): SavedReservation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedReservation;
  } catch {
    return null;
  }
}

export function clearReservationProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function hasPendingReservation(): boolean {
  return loadReservationProgress() !== null;
}
