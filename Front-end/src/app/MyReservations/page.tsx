"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, CheckCircle, Loader2, Search, Car, Calendar, DollarSign, Clock, ArrowRight } from "lucide-react";
import { getAuthToken } from "@/lib/tokenStorage";
import BackButton from "@/components/BackButton";
import { RequireClient } from "@/components/RequireClient";
import { API_BASE_URL } from "@/lib/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

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

function getToken(): string | null {
  return getAuthToken();
}

function statusLabel(s: string, t: (key: string) => string) {
  if (!s) return t("reservations.upcoming").toUpperCase();
  const map: Record<string, string> = {
    "en_attente": t("reservations.status.pending"),
    "confirmée": t("reservations.status.confirmed"),
    "terminée": t("reservations.status.completed"),
    "annulée": t("reservations.status.cancelled"),
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

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function vehicleName(r: Reservation, fallback = "Vehicle") {
  if (r.vehicle?.name) return r.vehicle.name;
  if (r.vehicle?.brand && r.vehicle?.model)
    return `${r.vehicle.brand} ${r.vehicle.model}`;
  return fallback;
}

function vehicleImage(r: Reservation) {
  return r.vehicle?.image_url ?? r.vehicle?.image ?? "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80";
}

function refCode(r: Reservation) {
  return r.reference ?? `#CFF-${String(r.id).padStart(4, "0")}`;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string; glow: string }> = {
  confirmée: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-l-emerald-500", glow: "shadow-emerald-500/5" },
  annulée: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-l-rose-500", glow: "shadow-rose-500/5" },
  terminée: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", border: "border-l-slate-400", glow: "shadow-slate-500/5" },
  en_attente: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-l-amber-400", glow: "shadow-amber-500/5" },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.terminée;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const c = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {statusLabel(status, t)}
    </span>
  );
}

function StatCard({ icon, label, value, gradient, delay }: { icon: React.ReactNode; label: string; value: number; gradient: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-white/40 rounded-2xl blur-xl" />
      <div className="relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-5 flex items-center gap-4 shadow-lg shadow-black/5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em]">{label}</div>
          <div className="text-2xl font-black text-[#395886] mt-0.5 tabular-nums">{value}</div>
        </div>
      </div>
    </motion.div>
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
  const { t, locale } = useI18n();
  const cancelled = isCancelled(res.status);
  const s = res.status.toLowerCase();
  const completed = s === "terminée";
  const upcoming = !cancelled && !completed;
  const cancellable = upcoming && canCancel(res.pickup_date);
  const config = getStatusConfig(res.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl border border-[#D5DEEF]/50 bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${config.glow} overflow-hidden`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.border.replace("border-l-", "bg-")}`} />
      <div className="p-5 pl-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F0F3FA] shrink-0 ring-2 ring-[#D5DEEF]/30 group-hover:ring-[#638ECB]/30 transition-all">
            <img
              src={vehicleImage(res)}
              alt={vehicleName(res, t("vehicle.default_name"))}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${cancelled ? "grayscale opacity-60" : ""}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80";
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-base font-extrabold truncate ${cancelled ? "text-gray-400" : "text-[#395886]"}`}>
                {vehicleName(res, t("vehicle.default_name"))}
              </h3>
              <span className="text-[11px] font-bold text-[#638ECB]/60 bg-[#F0F3FA] px-2 py-0.5 rounded-md shrink-0">
                {refCode(res)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#395886]">
                <Calendar className="w-3.5 h-3.5 text-[#638ECB]" />
                <span>{formatDate(res.pickup_date, locale)}</span>
                <ArrowRight className="w-3 h-3 text-[#638ECB]/40" />
                <span>{formatDate(res.dropoff_date, locale)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#395886]">
                <DollarSign className="w-3.5 h-3.5 text-[#638ECB]" />
                {cancelled ? "0,00 DH" : `${Number(res.total_price).toLocaleString(locale)} DH`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={res.status} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cancelled ? (
            <span className="text-xs font-bold text-gray-400 italic">{t("reservations.status.cancelled")}</span>
          ) : upcoming ? (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onShowDetails(res)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f39c12] to-[#e08e0b] text-white text-xs font-extrabold tracking-wider shadow-md shadow-[#f39c12]/20 hover:shadow-lg hover:shadow-[#f39c12]/30 transition-all cursor-pointer"
              >
                {t("reservations.details_button")}
              </motion.button>
              {cancellable && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onCancel(res.id)}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-extrabold border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
                >
                  {t("reservations.cancel_button")}
                </motion.button>
              )}
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onBookAgain(res.vehicle?.id ?? res.id)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f39c12] to-[#e08e0b] text-white text-xs font-extrabold tracking-wider shadow-md shadow-[#f39c12]/20 hover:shadow-lg hover:shadow-[#f39c12]/30 transition-all cursor-pointer"
              >
                {t("reservations.rebook_button")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-xl bg-white text-[#475569] text-xs font-extrabold border border-[#D5DEEF] hover:bg-[#F0F3FA] transition-all cursor-pointer"
              >
                {t("reservations.receipt_button")}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FilterDropdown({ filter, onChange }: { filter: string; onChange: (v: string) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const labels: Record<string, string> = {
    all: t("reservations.total"),
    upcoming: t("reservations.upcoming"),
    completed: t("reservations.completed"),
    cancelled: t("reservations.cancelled"),
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-[#D5DEEF]/60 rounded-xl px-5 py-2.5 text-sm font-bold text-[#395886] hover:bg-white hover:border-[#638ECB]/30 transition-all shadow-sm"
      >
        <Clock className="w-4 h-4 text-[#638ECB]" />
        <span>{labels[filter]}</span>
        <svg className={`w-3.5 h-3.5 text-[#638ECB] transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 bg-white/90 backdrop-blur-xl border border-[#D5DEEF]/60 rounded-xl shadow-xl shadow-black/5 p-1.5 flex flex-col gap-0.5 z-20 min-w-[180px]"
          >
            {(["all", "upcoming", "completed", "cancelled"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  filter === opt
                    ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                    : "text-[#395886] hover:bg-[#F0F3FA]"
                }`}
              >
                {labels[opt]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PER_PAGE = 4;

  const [modal, setModal] = useState<{ type: "confirm" | "error" | "success"; message: string; resId?: number } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);

  async function fetchReservations(pageNum = 1) {
    const token = getToken();
    if (!token) {
      setError(t("reservations.auth_error"));
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
        pickup_location: t("reservations.agency_pickup"),
        dropoff_location: t("reservations.agency_return"),
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
      setError((e as { message?: string })?.message || "Échec du chargement des réservations.");
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
    setModal({ type: "confirm", message: t("reservations.cancel_confirm"), resId: reservationId });
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
        setModal({ type: "error", message: json.message || t("reservations.cancel_error") });
        return;
      }

      setModal({ type: "success", message: t("reservations.cancel_success") });
      fetchReservations(page);
    } catch (err) {
      setModal({ type: "error", message: t("reservations.error_default") });
    } finally {
      setCancelling(false);
    }
  }

  const stats = useMemo(() => {
    const total = reservations.length;
    const upcoming = reservations.filter((r) => {
      const s = r.status.toLowerCase();
      return s === "confirmée" || s === "en_attente";
    }).length;
    const completed = reservations.filter((r) => r.status.toLowerCase() === "terminée").length;
    const cancelled = reservations.filter((r) => r.status.toLowerCase() === "annulée").length;
    return { total, upcoming, completed, cancelled };
  }, [reservations]);

  const filtered = useMemo(() => {
    if (!search.trim()) return reservations;
    const q = search.toLowerCase();
    return reservations.filter((r) => {
      return vehicleName(r, t("vehicle.default_name")).toLowerCase().includes(q)
        || r.vehicle?.brand?.toLowerCase().includes(q)
        || r.vehicle?.model?.toLowerCase().includes(q);
    });
  }, [reservations, search]);

  return (
    <RequireClient>
      <div className="min-h-screen bg-[#F0F3FA]">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="relative max-w-7xl mx-auto px-6 py-14">
            <BackButton />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("reservations.dashboard")}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {t("reservations.title")}
              </h1>
              <p className="text-white/70 text-base font-semibold mt-2 max-w-xl">
                {t("reservations.subtitle")}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Car className="w-5 h-5 text-white" />} label={t("reservations.total")} value={stats.total} gradient="bg-gradient-to-br from-[#638ECB] to-[#395886]" delay={0} />
            <StatCard icon={<Calendar className="w-5 h-5 text-white" />} label={t("reservations.upcoming")} value={stats.upcoming} gradient="bg-gradient-to-br from-amber-400 to-amber-600" delay={0.1} />
            <StatCard icon={<CheckCircle className="w-5 h-5 text-white" />} label={t("reservations.completed")} value={stats.completed} gradient="bg-gradient-to-br from-emerald-400 to-emerald-600" delay={0.2} />
            <StatCard icon={<AlertTriangle className="w-5 h-5 text-white" />} label={t("reservations.cancelled")} value={stats.cancelled} gradient="bg-gradient-to-br from-rose-400 to-rose-600" delay={0.3} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[#638ECB]" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("reservations.search_placeholder")}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D5DEEF]/60 bg-white/80 backdrop-blur-sm text-sm text-[#395886] font-semibold placeholder:text-[#638ECB]/50 focus:outline-none focus:ring-2 focus:ring-[#638ECB]/20 focus:border-[#638ECB]/40 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <FilterDropdown filter={filter} onChange={setFilter} />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50/80 backdrop-blur-sm text-rose-600 border border-rose-200/60 rounded-xl p-4 mb-8 text-sm font-bold"
            >
              {error}
            </motion.div>
          )}

          {/* Reservation List */}
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((res, i) => (
                  <ReservationCard
                    key={res.id}
                    res={res}
                    onBookAgain={handleBookAgain}
                    onCancel={handleCancelReservation}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : !loading && !error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white/50 backdrop-blur-sm border border-[#D5DEEF]/40 rounded-3xl shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F0F3FA] flex items-center justify-center mx-auto mb-5">
                <Car className="w-8 h-8 text-[#638ECB]" />
              </div>
              <p className="text-xl font-black text-[#395886]">
                {search ? t("reservations.no_results") : t("reservations.no_reservations")}
              </p>
              <p className="text-sm font-semibold text-[#638ECB] mt-1.5">
                {search ? t("reservations.no_results_search") : t("reservations.no_reservations_cta")}
              </p>
            </motion.div>
          ) : null}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-[#D5DEEF] rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-t-[#638ECB] rounded-full animate-spin" />
              </div>
              <span className="ml-4 text-sm font-extrabold text-[#638ECB]">{t("reservations.loading")}</span>
            </div>
          )}

          {/* Load More */}
          {!loading && hasMore && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 text-center pb-12"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                className="inline-flex items-center gap-2.5 bg-white border-2 border-[#D5DEEF]/60 text-[#395886] font-extrabold text-sm tracking-wider px-10 py-3.5 rounded-xl hover:border-[#638ECB]/30 hover:bg-white hover:shadow-lg transition-all"
              >
                {t("reservations.load_more")}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
            />

            <motion.div
              className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 max-w-sm w-full p-8 flex flex-col items-center gap-5 border border-white/50"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {modal.type === "confirm" && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-bold text-center">{modal.message}</p>
                  <div className="flex gap-3 w-full mt-1">
                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 border-2 border-[#D5DEEF] text-[#395886] font-extrabold text-sm py-3 rounded-xl hover:bg-[#F0F3FA] transition-all"
                    >
                      {t("reservations.cancel_modal_keep")}
                    </button>
                    <button
                      onClick={confirmCancel}
                      disabled={cancelling}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {cancelling ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t("reservations.cancel_modal_cancelling")}</>
                      ) : (
                        t("reservations.cancel_yes")
                      )}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "error" && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-bold text-center">{modal.message}</p>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-[#395886]/20 hover:shadow-xl transition-all"
                  >
                    OK
                  </button>
                </>
              )}

              {modal.type === "success" && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-800 font-bold text-center">{modal.message}</p>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-[#395886]/20 hover:shadow-xl transition-all"
                  >
                    OK
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
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
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailReservation(null)}
            />

            <motion.div
              className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 w-full max-w-3xl flex flex-col max-h-[90vh] border border-white/50"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-[#dde4ef] to-[#e8edf5] px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl">
                <span className="text-sm font-extrabold text-[#395886]">{t("reservations.details_title")}</span>
                <button
                  onClick={() => setDetailReservation(null)}
                  className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-[#395886] hover:text-[#1d3560] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-8 py-8 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  <div className="w-full md:w-[340px] flex-shrink-0 rounded-2xl overflow-hidden bg-[#1a1e2e] ring-2 ring-[#D5DEEF]/30" style={{ minHeight: 200 }}>
                    <img
                      src={vehicleImage(detailReservation)}
                      alt={vehicleName(detailReservation, t("vehicle.default_name"))}
                      className="w-full h-full object-cover"
                      style={{ minHeight: 200 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=700&q=80";
                      }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#638ECB]">{t("reservations.ref_label")} {refCode(detailReservation).replace("#", "")}</span>
                      <StatusBadge status={detailReservation.status} />
                    </div>

                    <div className="mb-4">
                      <h2 className="text-3xl font-black text-[#395886] leading-tight">{vehicleName(detailReservation, t("vehicle.default_name"))}</h2>
                      <p className="text-[#638ECB] text-sm font-semibold mt-1">{detailReservation.vehicle?.brand} {detailReservation.vehicle?.model}</p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center justify-between mt-auto shadow-sm">
                      <span className="text-sm font-bold text-gray-600">{t("reservations.total_amount")}</span>
                      <span className="text-2xl font-black text-[#395886]">{Number(detailReservation.total_price).toLocaleString(locale)} DH</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col md:flex-row mb-8 shadow-sm">
                  <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-100 bg-white/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#F0F3FA] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#395886]" />
                      </div>
                      <span className="text-[#395886] font-extrabold text-sm">{t("reservations.pickup_label")}</span>
                    </div>
                    <div className="border-l-2 border-[#D5DEEF] pl-4">
                      <p className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-widest mb-1">{t("reservations.date_label")}</p>
                      <p className="text-base font-bold text-[#395886]">
                        {formatDate(detailReservation.pickup_date, locale)}
                      </p>
                      {detailReservation.pickup_location && (
                        <p className="text-xs font-semibold text-[#638ECB] mt-1">{detailReservation.pickup_location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 px-6 py-5 bg-white/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#F0F3FA] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#395886]" />
                      </div>
                      <span className="text-[#395886] font-extrabold text-sm">{t("reservations.return_label")}</span>
                    </div>
                    <div className="border-l-2 border-[#D5DEEF] pl-4">
                      <p className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-widest mb-1">{t("reservations.date_label")}</p>
                      <p className="text-base font-bold text-[#395886]">
                        {formatDate(detailReservation.dropoff_date, locale)}
                      </p>
                      {detailReservation.dropoff_location && (
                        <p className="text-xs font-semibold text-[#638ECB] mt-1">{detailReservation.dropoff_location}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-base font-extrabold text-[#395886] mb-4">{t("reservations.specs_title")}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: t("reservations.fuel_label"), value: detailReservation.vehicle?.fuelType ?? "—", icon: "fuel" },
                      { label: t("reservations.gearbox_label"), value: "Automatique", icon: "gear" },
                      { label: t("reservations.seats_label"), value: detailReservation.vehicle?.Occupants ?? "—", icon: "seat" },
                      { label: t("reservations.year_label"), value: detailReservation.vehicle?.year?.toString() ?? "—", icon: "year" },
                    ].map((spec) => (
                      <div key={spec.label} className="bg-white/70 border border-[#D5DEEF]/40 rounded-xl px-4 py-5 flex flex-col items-center gap-2.5 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-[#F0F3FA] flex items-center justify-center">
                          <Car className="w-4 h-4 text-[#395886]" />
                        </div>
                        <p className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-wider">{spec.label}</p>
                        <p className="text-sm font-black text-[#395886]">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setDetailReservation(null);
                      handleCancelReservation(detailReservation.id);
                    }}
                    className="px-6 py-3 rounded-xl border-2 border-[#D5DEEF] text-sm font-extrabold text-[#395886] hover:bg-[#F0F3FA] transition-all"
                  >
                    {t("reservations.cancel_in_detail")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDetailReservation(null)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-sm font-extrabold shadow-lg shadow-[#395886]/20 hover:shadow-xl transition-all"
                  >
                    {t("reservations.back_to_history")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RequireClient>
  );
}
