"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { vehicleImageUrl } from "@/lib/media";
import { getAuthToken } from "@/lib/tokenStorage";
import { makeReservation } from "@/lib/reservationsApi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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
  pictures?: { id: number; path: string }[];
  created_at?: string;
};

function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Reservation
  const [reserveStartDate, setReserveStartDate] = useState<Date>();
  const [reserveEndDate, setReserveEndDate] = useState<Date>();
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchVehicle() {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch(`${API_BASE}/Vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Vehicle not found");
        const json = await res.json();
        if (!cancelled) setVehicle(json.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load vehicle");
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
      try {
        const res = await fetch(`${API_BASE}/Vehicles/${vehicleId}/reserved-dates`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch reserved dates");
        const json = await res.json();
        const dates: Date[] = [];
        for (const range of json.data ?? []) {
          if (!range.start_date || !range.end_date) continue;
          const start = new Date(range.start_date + "T00:00:00");
          const end = new Date(range.end_date + "T00:00:00");
          const current = new Date(start);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        }
        if (!cancelled) setReservedDates(dates);
      } catch (err) {
        console.error(err);
        if (!cancelled) setReservedDates([]);
      }
    }

    fetchReservedDates();
    return () => { cancelled = true; };
  }, [vehicle]);

  const images = vehicle?.pictures?.map(p => vehicleImageUrl(p.path)) ?? [];
  const days = reserveStartDate && reserveEndDate
    ? Math.max(1, Math.ceil((reserveEndDate.getTime() - reserveStartDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const subtotal = days && vehicle ? days * vehicle.pricePerDay : 0;
  const total = subtotal;

  async function handleReserve() {
    if (!vehicle || !reserveStartDate || !reserveEndDate) {
      setReserveError("Please select both dates.");
      return;
    }
    setReserving(true);
    setReserveError(null);
    try {
      await makeReservation(vehicle.id, {
        start_date: reserveStartDate.toISOString().split("T")[0],
        end_date: reserveEndDate.toISOString().split("T")[0],
      });
      router.push("/MyReservations");
    } catch (e) {
      setReserveError(e instanceof Error ? e.message : "Reservation failed");
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#16386b] border-t-transparent rounded-full animate-spin" />
        </div>
      </RequireAuth>
    );
  }

  if (error || !vehicle) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">{error || "Vehicle not found"}</p>
            <button onClick={() => router.push("/vehicles")} className="mt-4 text-[#16386b] hover:underline">
              Back to vehicles
            </button>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="bg-white min-h-screen">
        <main className="pt-14 pb-24 bg-white">
          <div className="max-w-[1180px] mx-auto px-7">

            {/* Title */}
            <h1 className="text-[60px] leading-none font-extrabold tracking-[-0.03em] text-[#16386b] mb-4">
              {vehicle.marque} {vehicle.model}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 text-[18px] mb-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Available in Marrakech</span>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

              {/* LEFT */}
              <div>
                {/* Hero */}
                <div
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
                  <div className="flex gap-5 mt-6">
                    {images.map((url, i) => (
                      <div
                        key={i}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOOKING CARD */}
              <div className="bg-white rounded-[30px] p-8 border border-[#eef0f4] shadow-[0_10px_35px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)]">
                {/* Price */}
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-end gap-2">
                    <h2 className="text-[58px] leading-none font-extrabold tracking-[-0.04em] text-[#d08a1b]">
                      €{vehicle.pricePerDay}
                    </h2>
                    <span className="text-gray-500 text-[18px] mb-1">/ day</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#e8f8ec] border border-[#cfeeda] text-[#1f8f4d] px-4 py-2 rounded-full text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-[#20b15a]" />
                    Available
                  </div>
                </div>

                <div className="h-px bg-[#eceff3] mb-6" />

                {/* Pickup */}
                <div className="mb-6">
                  <label className="block mb-3 text-[14px] font-bold text-gray-700">Pick-up Date & Time</label>
                  <input
                    type="datetime-local"
                    value={reserveStartDate ? toDateTimeLocal(reserveStartDate).slice(0, 16) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) setReserveStartDate(d);
                      }
                    }}
                    className="w-full h-[62px] rounded-[18px] border border-[#d9dee6] px-5 text-[16px] outline-none focus:border-[#16386b] transition"
                  />
                </div>

                {/* Dropoff */}
                <div className="mb-6">
                  <label className="block mb-3 text-[14px] font-bold text-gray-700">Drop-off Date & Time</label>
                  <input
                    type="datetime-local"
                    value={reserveEndDate ? toDateTimeLocal(reserveEndDate).slice(0, 16) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) setReserveEndDate(d);
                      }
                    }}
                    className="w-full h-[62px] rounded-[18px] border border-[#d9dee6] px-5 text-[16px] outline-none focus:border-[#16386b] transition"
                  />
                </div>

                <div className="h-px bg-[#eceff3] mb-6" />

                {/* Costs */}
                {days > 0 && (
                  <div className="flex flex-col gap-5 mb-6">
                    <div className="flex items-center justify-between text-[18px] text-gray-500">
                      <span>€{vehicle.pricePerDay} × {days} {days === 1 ? "day" : "days"}</span>
                      <strong className="text-gray-700 font-semibold">€{subtotal.toLocaleString()}</strong>
                    </div>
                  </div>
                )}

                {reserveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{reserveError}</div>
                )}

                {days > 0 && <div className="h-px bg-[#eceff3] mb-6" />}

                {/* Total */}
                {days > 0 && (
                  <div className="flex items-center justify-between mb-7">
                    <span className="text-[#16386b] text-[22px] font-bold">Total Estimate</span>
                    <h3 className="text-[42px] font-extrabold tracking-[-0.03em] text-[#d08a1b]">€{total.toLocaleString()}</h3>
                  </div>
                )}

                {/* Button */}
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="w-full h-[68px] rounded-[18px] bg-[#16386b] hover:bg-[#102b54] transition text-white text-[20px] font-bold disabled:opacity-50"
                >
                  {reserving ? "Reserving..." : "Reserve Vehicle"}
                </button>
              </div>
            </div>

            {/* SPECS */}
            <section className="mt-12 border border-[#edf0f4] rounded-[30px] p-10 bg-white">
              <h2 className="text-[28px] font-extrabold text-[#16386b] mb-10">Vehicle Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Fuel */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6M9 11h6m-6 4h6M5 3h14a2 2 0 012 2v16l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 012-2z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500">Fuel</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 leading-none">{vehicle.fuelType}</div>
                </div>
                {/* Gearbox */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500">Gearbox</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 leading-none">Automatic</div>
                </div>
                {/* Seats */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500">Seats</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 leading-none">{vehicle.Occupants}</div>
                </div>
                {/* Year */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="uppercase tracking-[0.08em] text-[12px] font-bold text-gray-500">Year</span>
                  </div>
                  <div className="text-[30px] font-extrabold text-gray-900 leading-none">{vehicle.year}</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
