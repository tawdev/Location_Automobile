"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, CheckCircle, Loader2 } from "lucide-react";
import { getAuthToken } from "@/lib/tokenStorage";
import { RequireAuth } from "@/components/RequireAuth";
import { API_BASE_URL } from "@/lib/config";

// ── Types ──────────────────────────────────────────────────────────────────
interface Reservation {
  id: number;
  reference?: string;
  status: "upcoming" | "completed" | "cancelled" | string;
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

interface RawItem {
  id: number;
  status?: string;
  TotalPrice?: number;
  total_price?: number;
  start_date?: string;
  pickup_date?: string;
  end_date?: string;
  dropoff_date?: string;
  vehicle?: {
    id: number;
    marque?: string;
    brand?: string;
    model?: string;
    fuelType?: string;
    fuel_type?: string;
    Occupants?: string;
    occupants?: string;
    year?: number;
    pictures?: { path?: string }[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return getAuthToken();
}

function statusLabel(s: string) {
  if (!s) return "À VENIR";
  const map: Record<string, string> = {
    "en_attente": "En Attente",
    "confirmée": "Confirmée",
    "terminée": "Terminée",
    "annulée": "Annulée",
  };
  return map[s.toLowerCase()] ?? s.toUpperCase();
}

function isCancelled(s: string) {
  if (!s) return false;
  return s.toLowerCase() === "annulée";
}

function canCancel(pickupDateStr: string) {
  if (!pickupDateStr) return false;
  const pickupDate = new Date(pickupDateStr);
  const now = new Date();
  const diffTime = pickupDate.getTime() - now.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  return diffHours >= 48;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function vehicleName(r: Reservation) {
  if (r.vehicle?.name) return r.vehicle.name;
  if (r.vehicle?.brand && r.vehicle?.model)
    return `${r.vehicle.brand} ${r.vehicle.model}`;
  return "Vehicle";
}

function vehicleImage(r: Reservation) {
  return r.vehicle?.image_url ?? r.vehicle?.image ?? "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80";
}

function refCode(r: Reservation) {
  return r.reference ?? `#CFF-${String(r.id).padStart(4, "0")}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);
  const s = status.toLowerCase();
  const isActive = s === "en_attente" || s === "confirmée";

  return (
    <span
      className={`absolute top-4 right-4 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-md ${
        isActive ? "bg-[#2B4C7E] text-white" : "bg-white/90 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}

function InfoCol({
  label,
  date,
  location,
}: {
  label: string;
  date: string;
  location?: string;
}) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {label}
      </div>
      <div className="text-sm font-bold text-gray-900 mt-1">{date}</div>
      {location && <div className="text-xs text-gray-500">{location}</div>}
    </div>
  );
}

function ReservationCard({
  res,
  onBookAgain,
  onCancel,
  onShowDetails,
}: {
  res: Reservation;
  onBookAgain: (id: number) => void;
  onCancel: (id: number) => void;
  onShowDetails: (res: Reservation) => void;
}) {
  const cancelled = isCancelled(res.status);
  const s = res.status.toLowerCase();
  const completed = s === "terminée";
  const upcoming = !cancelled && !completed;
  const cancellable = upcoming && canCancel(res.pickup_date);

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(31,66,118,0.12)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Image */}
      <motion.div className="relative h-48 w-full overflow-hidden">
        <motion.img
          src={vehicleImage(res)}
          alt={vehicleName(res)}
          className={`w-full h-full object-cover ${cancelled ? "grayscale opacity-60" : ""}`}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80";
          }}
        />
        <StatusBadge status={res.status} />
      </motion.div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title row */}
        <div className="flex justify-between items-start mb-1">
          <h3 className={`text-xl font-bold ${cancelled ? "text-gray-400" : "text-[#2B4C7E]"}`}>
            {vehicleName(res)}
          </h3>
          <span className={`text-xl font-bold ${cancelled ? "text-gray-400" : "text-[#2B4C7E]"}`}>
            {cancelled ? "€0.00" : `€${Number(res.total_price).toLocaleString()}`}
          </span>
        </div>

        {/* Ref */}
        <div className="text-xs text-gray-400 mb-6">
          Ref: {refCode(res)}
        </div>

        {/* Dates */}
        <div className="flex gap-8 mb-8 flex-1">
          <InfoCol
            label="PICK-UP"
            date={formatDate(res.pickup_date)}
            location={res.pickup_location}
          />
          <InfoCol
            label="DROP-OFF"
            date={formatDate(res.dropoff_date)}
            location={res.dropoff_location}
          />
        </div>

        {/* Buttons / Cancelled state */}
        {cancelled ? (
          <div className="text-xs text-gray-400 text-center py-3">
            Reservation cancelled on {formatDate(res.pickup_date)}
          </div>
        ) : upcoming ? (
          cancellable ? (
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onShowDetails(res)}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-sm tracking-widest py-3.5 rounded-xl transition-colors"
              >
                DETAILS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onCancel(res.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm tracking-widest py-3.5 rounded-xl transition-colors"
              >
                ANNULER
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onShowDetails(res)}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-sm tracking-widest py-3.5 rounded-xl transition-colors"
            >
              DETAILS
            </motion.button>
          )
        ) : (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onBookAgain(res.vehicle?.id ?? res.id)}
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-sm tracking-widest py-3.5 rounded-xl transition-colors"
            >
              BOOK AGAIN
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#475569] font-bold text-sm tracking-widest py-3.5 rounded-xl transition-colors"
            >
              RECEIPT
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookingHistoryPage() {
  const router = useRouter();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PER_PAGE = 4;

  // ── Modal state ──
  const [modal, setModal] = useState<{ type: "confirm" | "error" | "success"; message: string; resId?: number } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);

  async function fetchReservations(pageNum = 1) {
    const token = getToken();
    if (!token) {
      setError("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const statusMap: Record<string, string | undefined> = {
        all: undefined,
        upcoming: "Confirmée",
        completed: "Terminée",
        cancelled: "Annulée",
      };
      const statusParam = statusMap[filter];
      const url = statusParam
        ? `${API_BASE_URL}/MyReservation/filter?status=${encodeURIComponent(statusParam)}&page=${pageNum}`
        : `${API_BASE_URL}/MyReservations?page=${pageNum}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const items: RawItem[] = Array.isArray(json)
        ? json
        : json.data ?? json.reservations ?? [];

      const mappedItems: Reservation[] = items.map((item: RawItem) => ({
        id: item.id,
        reference: `#CFF-${String(item.id).padStart(4, "0")}`,
        status: item.status ?? "upcoming",
        total_price: item.TotalPrice ?? item.total_price ?? 0,
        pickup_date: item.start_date ?? item.pickup_date ?? "",
        dropoff_date: item.end_date ?? item.dropoff_date ?? "",
        pickup_location: "Office / Pick-up",
        dropoff_location: "Office / Drop-off",
        vehicle: item.vehicle ? {
          id: item.vehicle.id,
          brand: item.vehicle.marque ?? item.vehicle.brand,
          model: item.vehicle.model,
          fuelType: item.vehicle.fuelType ?? item.vehicle.fuel_type,
          Occupants: item.vehicle.Occupants ?? item.vehicle.occupants,
          year: item.vehicle.year,
          image_url: item.vehicle.pictures?.[0]?.path 
            ? `http://localhost:8000/storage/${item.vehicle.pictures[0].path}` 
            : undefined
        } : undefined
      }));

      if (pageNum === 1) {
        setReservations(mappedItems);
      } else {
        setReservations((prev) => [...prev, ...mappedItems]);
      }

      setHasMore(mappedItems.length >= PER_PAGE && items.length > 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchReservations(1);
    }, 0);
    return () => clearTimeout(id);
  }, [filter]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    setLoading(true);
    setError(null);
    fetchReservations(next);
  }

  function handleBookAgain(vehicleId: number) {
    router.push(`/vehicles`);
  }

  function handleCancelReservation(reservationId: number) {
    setModal({ type: "confirm", message: "Are you sure you want to cancel this reservation?", resId: reservationId });
  }

  function handleShowDetails(res: Reservation) {
    setDetailReservation(res);
  }

  async function confirmCancel() {
    const resId = modal?.resId;
    if (!resId) return;
    setModal(null);
    setCancelling(true);

    const token = getAuthToken();
    if (!token) { setCancelling(false); return; }

    try {
      const res = await fetch(`${API_BASE_URL}/MyReservations/${resId}/annuler`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) {
        setModal({ type: "error", message: json.message || "Failed to cancel reservation" });
        return;
      }

      setModal({ type: "success", message: "Reservation cancelled successfully" });
      fetchReservations(page);
    } catch (err) {
      setModal({ type: "error", message: "An error occurred while cancelling your reservation." });
    } finally {
      setCancelling(false);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#F4F7FB]">
        {/* ── Content ── */}
        <main className="max-w-7xl mx-auto w-full px-6 py-12">
          {/* Title Row */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#2B4C7E] tracking-tight mb-2">
              Booking History
            </h1>
            <p className="text-gray-500 text-sm">
              Review your past and upcoming reservations with CARFORFAR.
            </p>
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
            </button>
            
            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-10 min-w-[140px]">
                {(["all", "upcoming", "completed", "cancelled"] as const).map((opt) => {
                  const labels: Record<string, string> = { all: "Toutes", upcoming: "À Venir", completed: "Terminée", cancelled: "Annulée" };
                  return (
                    <button
                      key={opt}
                      onClick={() => { setFilter(opt); setShowFilter(false); }}
                      className={`text-left px-4 py-2 rounded-lg text-sm font-semibold ${
                        filter === opt ? "bg-[#2B4C7E] text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {labels[opt]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Grid or Empty State */}
        {reservations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res, i) => (
              <motion.div
                key={res.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              >
                <ReservationCard
                  res={res}
                  onBookAgain={handleBookAgain}
                  onCancel={handleCancelReservation}
                  onShowDetails={handleShowDetails}
                />
              </motion.div>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-50">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p className="text-lg font-medium text-gray-500">No reservations found.</p>
            <p className="text-sm mt-1">Book a vehicle to see your history here.</p>
          </div>
        ) : null}

        {loading && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              className="border-2 border-[#2B4C7E]/20 text-[#2B4C7E] font-bold text-sm tracking-widest px-8 py-3 rounded-xl hover:bg-[#2B4C7E]/5 transition-colors"
            >
              LOAD MORE HISTORY
            </button>
          </div>
        )}
      </main>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
            />

            {/* Card */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center gap-4"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {modal.type === "confirm" && (
                <>
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-medium text-center">{modal.message}</p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={confirmCancel}
                      disabled={cancelling}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {cancelling ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                      ) : (
                        "Yes, Cancel"
                      )}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "error" && (
                <>
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-medium text-center">{modal.message}</p>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full bg-[#2B4C7E] hover:bg-[#1d3560] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    OK
                  </button>
                </>
              )}

              {modal.type === "success" && (
                <>
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-medium text-center">{modal.message}</p>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full bg-[#2B4C7E] hover:bg-[#1d3560] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    OK
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {detailReservation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailReservation(null)}
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              {/* Top bar (sticky) */}
              <div className="bg-[#dde4ef] px-6 py-4 flex items-center shrink-0">
                <button
                  onClick={() => setDetailReservation(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#1e3a5f] hover:bg-white/40 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Body (scrollable) */}
              <div className="px-8 py-8 overflow-y-auto">
                {/* Car image + info row */}
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  {/* Image */}
                  <div className="w-full md:w-[340px] flex-shrink-0 rounded-xl overflow-hidden bg-[#1a1e2e]" style={{ minHeight: 200 }}>
                    <img
                      src={vehicleImage(detailReservation)}
                      alt={vehicleName(detailReservation)}
                      className="w-full h-full object-cover"
                      style={{ minHeight: 200 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=700&q=80";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Ref + badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 font-medium">REF: {refCode(detailReservation).replace("#", "")}</span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-[#1e3a5f] border border-[#1e3a5f]/30 bg-[#eef1f8] rounded-full px-3 py-1">
                        <span className="w-2 h-2 rounded-full bg-[#1e3a5f] inline-block" />
                        {statusLabel(detailReservation.status)}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <h2 className="playfair text-3xl font-bold text-[#1e3a5f] leading-tight">{vehicleName(detailReservation)}</h2>
                      <p className="text-gray-400 text-sm mt-1">{detailReservation.vehicle?.brand} {detailReservation.vehicle?.model}</p>
                    </div>

                    {/* Total amount card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between mt-auto">
                      <span className="text-base font-semibold text-gray-700">Total Amount</span>
                      <span className="text-2xl font-bold text-[#1e3a5f]">€{Number(detailReservation.total_price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pick-up / Drop-off row */}
                <div className="border border-gray-100 rounded-xl overflow-hidden flex flex-col md:flex-row mb-8">
                  {/* Pick-up */}
                  <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1e3a5f]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-3.92-1.05-2.74-7.2-1.5-.4v5.55l-2.5-.67V9.5l-1.5-.4-1 3.73 2.72 4.44z"/>
                      </svg>
                      <span className="text-[#1e3a5f] font-semibold text-base">Pick-up</span>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(detailReservation.pickup_date)}
                      </p>
                      {detailReservation.pickup_location && (
                        <p className="text-xs text-gray-500 mt-1">{detailReservation.pickup_location}</p>
                      )}
                    </div>
                  </div>

                  {/* Drop-off */}
                  <div className="flex-1 px-6 py-5">
                    <div className="flex items-center gap-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1e3a5f]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.21 1.28-1.04 1.07-1.85z"/>
                      </svg>
                      <span className="text-[#1e3a5f] font-semibold text-base">Drop-off</span>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(detailReservation.dropoff_date)}
                      </p>
                      {detailReservation.dropoff_location && (
                        <p className="text-xs text-gray-500 mt-1">{detailReservation.dropoff_location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Specifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Fuel */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-5 flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h2l1 2h12l1-2h2M5 10V6a2 2 0 012-2h6a2 2 0 012 2v4M3 10v9a1 1 0 001 1h14a1 1 0 001-1v-9"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h1a2 2 0 012 2v3"/>
                      </svg>
                      <p className="text-xs text-gray-400 font-medium">Fuel Type</p>
                      <p className="text-sm font-bold text-gray-800 text-center">{detailReservation.vehicle?.fuelType ?? "—"}</p>
                    </div>

                    {/* Gearbox */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-5 flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="text-xs text-gray-400 font-medium">Gearbox</p>
                      <p className="text-sm font-bold text-gray-800 text-center">Automatic</p>
                    </div>

{/*  */}
                    {/* Seats */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-5 flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM7 14a5 5 0 0110 0v1H7v-1z"/>
                      </svg>
                      <p className="text-xs text-gray-400 font-medium">Seats</p>
                      <p className="text-sm font-bold text-gray-800 text-center">{detailReservation.vehicle?.Occupants ?? "—"}</p>
                    </div>

                    {/* Year */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-5 flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p className="text-xs text-gray-400 font-medium">Year</p>
                      <p className="text-sm font-bold text-gray-800 text-center">{detailReservation.vehicle?.year ?? "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setDetailReservation(null);
                      handleCancelReservation(detailReservation.id);
                    }}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel Reservation
                  </button>
                  <button
                    onClick={() => setDetailReservation(null)}
                    className="px-6 py-3 rounded-xl bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#16304f] transition-colors"
                  >
                    Back to History
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RequireAuth>
  );
}