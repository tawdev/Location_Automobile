"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { vehicleImageUrl } from "@/lib/media";
import { getAuthToken } from "@/lib/tokenStorage";
import { makeReservation } from "@/lib/reservationsApi";
import { loadReservationProgress } from "@/lib/reservationStorage";
import BackButton from "@/components/BackButton";
import ReservationFlowModal from "@/components/ReservationFlowModal";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { API_BASE_URL } from "@/lib/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Vehicle = {
  id: number;
  marque: string;
  model: string;
  year: number;
  registration: string;
  km: number;
  pricePerDay: number;
  fuelType: string;
  category_id: number;
  Occupants: string;
  air_conditioner?: boolean;
  gps?: boolean;
  pictures?: { id: number; path: string }[];
  created_at?: string;
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Reservation
  const [reserveStartDate, setReserveStartDate] = useState<Date>();
  const [reserveEndDate, setReserveEndDate] = useState<Date>();

  useEffect(() => {
    if (reserveEndDate && reserveStartDate) {
      const minEnd = new Date(reserveStartDate);
      minEnd.setDate(minEnd.getDate() + 3);
      if (reserveEndDate < minEnd) {
        setReserveEndDate(undefined);
      }
    }
  }, [reserveStartDate]);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationChoice, setReservationChoice] = useState<"one" | "two" | null>(null);

  // Auto-open modal when resuming a saved reservation
  useEffect(() => {
    if (!vehicle) return;
    const saved = loadReservationProgress();
    if (saved && saved.vehicleId === vehicle.id) {
      setReserveStartDate(new Date(saved.startDate + "T00:00:00"));
      setReserveEndDate(new Date(saved.endDate + "T00:00:00"));
      setShowReservationModal(true);
    }
  }, [vehicle]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchVehicle() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/Vehicles/${id}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(t("vehicle.error.not_found"));
        const json = await res.json();
        if (!cancelled) setVehicle(json.data);
      } catch (e) {
        if (!cancelled) setError((e as { message?: string })?.message || t("vehicle.error.load_failed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVehicle();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!vehicle) return;
    const vehicleId = vehicle.id;
    let cancelled = false;

    async function fetchReservedDates() {
      const token = getAuthToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/Vehicles/${vehicleId}/reserved-dates`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch reserved dates");
        const json = await res.json();
        console.log("RAW reserved API response:", JSON.stringify(json));
        const dates: Date[] = [];
        for (const range of json.data ?? []) {
          if (!range.start_date || !range.end_date) continue;
          const startDateStr = range.start_date.split("T")[0];
          const endDateStr = range.end_date.split("T")[0];
          const start = new Date(startDateStr + "T00:00:00");
          const end = new Date(endDateStr + "T00:00:00");
          const current = new Date(start);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        }
        console.log("Reserved dates parsed:", dates.map(d => d.toDateString()));
        if (!cancelled) setReservedDates(dates);
      } catch (err) {
        console.error("Reserved-dates error:", err);
        if (!cancelled) setReservedDates([]);
      }
    }

    fetchReservedDates();
    return () => { cancelled = true; };
  }, [vehicle]);

  const images = vehicle?.pictures?.map(p => vehicleImageUrl(p.path)) ?? [];
  const days = reserveStartDate && reserveEndDate
    ? Math.max(3, Math.ceil((reserveEndDate.getTime() - reserveStartDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const minDropoffDate = reserveStartDate
    ? (() => { const d = new Date(reserveStartDate); d.setDate(d.getDate() + 3); return d; })()
    : new Date();
  const subtotal = days && vehicle ? days * vehicle.pricePerDay : 0;
  const total = subtotal;

  function handleReserve() {
    if (!vehicle || !reserveStartDate || !reserveEndDate) {
      setReserveError(t("vehicle.error.select_dates"));
      return;
    }
    const token = getAuthToken();
    if (!token) {
      localStorage.setItem("pendingVehicleRedirect", `/vehicles/${id}`);
      router.push("/register");
      return;
    }
    setReserveError(null);
    setShowReservationModal(true);
  }

  if (loading) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#16386b] border-t-transparent rounded-full animate-spin" />
        </div>
      </ClientOnly>
    );
  }

  if (error || !vehicle) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">{error || t("vehicle.error.not_found")}</p>
            <button onClick={() => router.push("/vehicles")} className="mt-4 text-[#16386b] hover:underline">
              {t("vehicle.back")}
            </button>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="bg-[#F0F3FA] dark:bg-[#070b14] min-h-screen">
        <main className="pt-14 pb-24 bg-[#F0F3FA] dark:bg-[#070b14]">
          <div className="max-w-[1180px] mx-auto px-7">

            <BackButton />

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[60px] leading-none font-extrabold tracking-[-0.03em] text-[#16386b] dark:text-[#D5DEEF] mb-4"
            >
              {vehicle.marque} {vehicle.model}
            </motion.h1>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-2 text-gray-500 dark:text-[#94A3B8] text-[18px] mb-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t("vehicle.available_in")}</span>
            </motion.div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

              {/* LEFT */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full h-[560px] rounded-[34px] overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: images[activeImage]
                      ? `linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.15) 100%), url(${images[activeImage]})`
                      : "linear-gradient(135deg, #2a2e3a 0%, #1c2033 50%, #232840 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Thumbnails */}
                {images.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="flex gap-5 mt-6"
                  >
                    {images.map((url, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveImage(i)}
                        className={`w-[148px] h-[102px] rounded-[18px] overflow-hidden cursor-pointer transition-opacity ${
                          i === activeImage
                            ? "border-[3px] border-[#16386b] p-[2px]"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div
                          className="w-full h-full rounded-[13px] bg-cover bg-center"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* BOOKING CARD */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white dark:bg-[#0f1729] rounded-[30px] p-8 border border-[#eef0f4] dark:border-[#1e293b] shadow-[0_10px_35px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]"
              >
                {/* Price */}
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-end gap-2">
                    <h2 className="text-[36px] leading-none font-extrabold tracking-[-0.04em] text-[#d08a1b]">
                      {vehicle.pricePerDay} DH
                    </h2>
                    <span className="text-gray-500 dark:text-[#94A3B8] text-[18px] mb-1">{t("vehicle.per_day")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#e8f8ec] dark:bg-emerald-950/30 border border-[#cfeeda] dark:border-emerald-800/50 text-[#1f8f4d] dark:text-emerald-300 px-4 py-2 rounded-full text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#20b15a]" />
                    {t("vehicle.available")}
                  </div>
                </div>

                <div className="h-px bg-[#eceff3] mb-6" />

                {/* Pickup */}
                <div className="mb-6">
                  <label className="block mb-3 text-[14px] font-bold text-gray-700 dark:text-[#D5DEEF]">{t("vehicle.pickup_date")}</label>
                  <Popover>
                    <PopoverTrigger className="w-full h-[62px] rounded-[18px] border border-[#d9dee6] dark:border-[#1e293b] px-5 text-[16px] outline-none focus:border-[#16386b] transition text-left flex items-center gap-3 bg-white dark:bg-[#0f1729] dark:text-[#D5DEEF]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {reserveStartDate ? reserveStartDate.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US") : <span className="text-gray-400">{t("vehicle.choose_date")}</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-[310px] p-0 overflow-hidden bg-white dark:bg-[#0f1729] z-[200]" align="start">
                      <div className="w-[310px] min-h-[350px] flex justify-center bg-white dark:bg-[#1e293b] rounded-md">
                        <Calendar
                          mode="single"
                          selected={reserveStartDate}
                          onSelect={(d: Date | undefined) => d && setReserveStartDate(d)}
                          disabled={[
                            { before: new Date() },
                            (date: Date) =>
                              reservedDates.some(
                                (r) => r.toDateString() === date.toDateString()
                              )
                          ]}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Dropoff */}
                <div className="mb-6">
                  <label className="block mb-3 text-[14px] font-bold text-gray-700 dark:text-[#D5DEEF]">{t("vehicle.dropoff_date")}</label>
                  <Popover>
                    <PopoverTrigger className="w-full h-[62px] rounded-[18px] border border-[#d9dee6] dark:border-[#1e293b] px-5 text-[16px] outline-none focus:border-[#16386b] transition text-left flex items-center gap-3 bg-white dark:bg-[#0f1729] dark:text-[#D5DEEF]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {reserveEndDate ? reserveEndDate.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US") : <span className="text-gray-400">{t("vehicle.choose_date")}</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-[310px] p-0 overflow-hidden bg-white dark:bg-[#0f1729] z-[200]" align="start">
                      <div className="w-[310px] min-h-[350px] flex justify-center bg-white dark:bg-[#1e293b] rounded-md">
                        <Calendar
                          mode="single"
                          selected={reserveEndDate}
                          onSelect={(d: Date | undefined) => d && setReserveEndDate(d)}
                          disabled={[
                            { before: minDropoffDate },
                            (date: Date) =>
                              reservedDates.some(
                                (r) => r.toDateString() === date.toDateString()
                              )
                          ]}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="h-px bg-[#eceff3] mb-6" />

                {/* Costs */}
                {days > 0 && (
                  <div className="flex flex-col gap-5 mb-6">
                    <div className="flex items-center justify-between text-[18px] text-gray-500 dark:text-[#94A3B8]">
                      <span>{vehicle.pricePerDay} DH × {days} {days === 1 ? t("vehicle.day") : t("vehicle.days")}</span>
                      <strong className="text-gray-700 dark:text-[#D5DEEF] font-semibold">{subtotal.toLocaleString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US")} DH</strong>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                      <p className="text-[14px] text-amber-800 font-medium mb-1">
                        <span className="font-bold">{t("vehicle.km_included")}</span> 200 km/{t("vehicle.day")}
                      </p>
                      <p className="text-[13px] text-amber-700">
                        {t("vehicle.km_detail", { amount: "100 DH/jour" })}
                      </p>
                    </div>
                  </div>
                )}

                {reserveError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-300 text-sm">{reserveError}</div>
                )}

                {days > 0 && <div className="h-px bg-[#eceff3] mb-6" />}

                {/* Total */}
                {days > 0 && (
                  <div className="flex items-center justify-between mb-7">
                    <span className="text-[#16386b] dark:text-[#D5DEEF] text-[22px] font-bold">{t("vehicle.total_estimate")}</span>
                    <h3 className="text-[36px] font-extrabold tracking-[-0.03em] text-[#d08a1b] dark:text-[#f0b24a]">{total.toLocaleString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US")} DH</h3>
                  </div>
                )}

                {/* Button */}
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="w-full h-[68px] rounded-[18px] bg-[#16386b] hover:bg-[#102b54] transition text-white text-[20px] font-bold disabled:opacity-50"
                >
                  {reserving ? t("vehicle.reserving") : t("vehicle.reserve")}
                </button>
              </motion.div>
            </div>

            {/* SPECS */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-12 border border-[#edf0f4] dark:border-[#1e293b] rounded-[30px] p-10 bg-white dark:bg-[#0f1729]"
            >
              <h2 className="text-[28px] font-extrabold text-[#16386b] dark:text-[#D5DEEF] mb-10">{t("vehicle.specs")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Fuel */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6M9 11h6m-6 4h6M5 3h14a2 2 0 012 2v16l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 012-2z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.fuel")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{vehicle.fuelType}</div>
                </motion.div>
                {/* Gearbox */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.48 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.gearbox")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{t("vehicle.automatic")}</div>
                </motion.div>
                {/* Seats */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.56 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.seats")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{vehicle.Occupants}</div>
                </motion.div>
                {/* Year */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.64 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.year")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{vehicle.year}</div>
                </motion.div>
                {/* Air Conditioner */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.72 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.air_conditioner")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{vehicle.air_conditioner ? "✓" : "—"}</div>
                </motion.div>
                {/* GPS */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500 dark:text-[#94A3B8]">{t("vehicle.gps")}</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 dark:text-[#D5DEEF] leading-none">{vehicle.gps ? "✓" : "—"}</div>
                </motion.div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1729] border border-[#d9dee6] dark:border-[#1e293b] rounded-[30px] max-w-md w-full p-10 shadow-2xl flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#16386b] dark:text-[#D5DEEF]">{t("vehicle.success_title")}</h2>
            <p className="text-gray-500 dark:text-[#94A3B8] text-center text-sm">
              {t("vehicle.success_msg", { vehicle: `${vehicle.marque} ${vehicle.model}` })}
            </p>
            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={() => router.push("/MyReservations")}
                className="w-full h-14 rounded-[16px] bg-[#16386b] hover:bg-[#102b54] text-white font-bold text-[16px] transition"
              >
                {t("vehicle.view_reservations")}
              </button>
              <button
                onClick={() => router.push("/vehicles")}
                className="w-full h-14 rounded-[16px] border border-[#d9dee6] dark:border-[#1e293b] text-gray-700 dark:text-[#94A3B8] font-bold text-[16px] hover:bg-gray-50 dark:hover:bg-[#0f1729] transition"
              >
                {t("vehicle.continue_browsing")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReservationModal && vehicle && reserveStartDate && reserveEndDate && (
        <ReservationFlowModal
          vehicleId={vehicle.id}
          vehicleName={`${vehicle.marque} ${vehicle.model}`}
          startDate={reserveStartDate.toISOString().split("T")[0]}
          endDate={reserveEndDate.toISOString().split("T")[0]}
          defaultChoice={reservationChoice}
          onClose={(choice) => {
            if (choice) setReservationChoice(choice);
            setShowReservationModal(false);
          }}
          onSuccess={() => {
            setShowReservationModal(false);
            setReservationChoice(null);
            setShowSuccess(true);
          }}
        />
      )}
    </ClientOnly>
  );
}
