"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { listVehicles, fetchTypeVehicules } from "@/lib/vehiclesApi";
import { getPublicMarques } from "@/lib/marquesApi";
import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import type { Vehicle, Marque, TypeVehicule } from "@/lib/types";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getBrandLogo } from "@/lib/brandLogos";
import Image from "next/image";
import { Search, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useSettings } from "@/lib/SettingsContext";
import Header from "@/components/Header";
import ResumeReservationBanner from "@/components/ResumeReservationBanner";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { organizationLD, websiteLD, localBusinessLD, breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/seo";

const MapSection = dynamic(() => import("@/components/HomeMap"), { ssr: false });

const cars = Array.from({ length: 6 }, (_, i) => `/background_vehicles/bg${`0${i + 1}`.slice(-2)}.jpg`);

const services = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    titleKey: "home.services.premium",
    descKey: "home.services.premium.desc",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    titleKey: "home.services.delivery",
    descKey: "home.services.delivery.desc",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    titleKey: "home.services.concierge",
    descKey: "home.services.concierge.desc",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    titleKey: "home.services.insurance",
    descKey: "home.services.insurance.desc",
  },
];

const steps = [
  { num: "01", titleKey: "home.how.step1.title", descKey: "home.how.step1.desc" },
  { num: "02", titleKey: "home.how.step2.title", descKey: "home.how.step2.desc" },
  { num: "03", titleKey: "home.how.step3.title", descKey: "home.how.step3.desc" },
];



function CarLogo({ className, dark: forceDark }: { className?: string; dark?: boolean }) {
  if (forceDark) {
    return (
      <div className={`flex items-center ${className ?? ""}`}>
        <img src="/logo-dark.png" alt="CARFORFAR logo" className="h-36 w-auto object-contain select-none" />
      </div>
    );
  }
  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <img src="/logo.png" alt="CARFORFAR logo" className="h-36 w-auto object-contain select-none dark:hidden" />
      <img src="/logo-dark.png" alt="CARFORFAR logo" className="h-36 w-auto object-contain select-none hidden dark:block" />
    </div>
  );
}

function HeroSection({ vehicles: showcaseVehicles }: { vehicles?: Vehicle[] }) {
  const router = useRouter();
  const [currentImg, setCurrentImg] = useState(0);
  const { t } = useI18n();

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [fuelType, setFuelType] = useState("");
  const [typeVehicules, setTypeVehicules] = useState<TypeVehicule[]>([]);
  const [typeVehiculeId, setTypeVehiculeId] = useState<number | null>(null);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);

  const [vehicleIndex, setVehicleIndex] = useState(0);
  const displayVehicles = useMemo(() => showcaseVehicles?.slice(0, 5) ?? [], [showcaseVehicles]);

  useEffect(() => {
    if (displayVehicles.length < 2) return;
    const timer = setInterval(() => {
      setVehicleIndex((prev) => (prev + 1) % displayVehicles.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayVehicles.length]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupDate) params.set("pickup_date", pickupDate);
    if (returnDate) params.set("return_date", returnDate);
    if (brand.trim()) params.set("marque", brand.trim());
    if (model.trim()) params.set("model", model.trim());
    if (minPrice !== undefined) params.set("min_price", String(minPrice));
    if (maxPrice !== undefined) params.set("max_price", String(maxPrice));
    if (fuelType) params.set("fuel_type", fuelType);
    if (typeVehiculeId) params.set("type_vehicule_id", String(typeVehiculeId));
    const qs = params.toString();
    router.push(qs ? `/vehicules?${qs}` : "/vehicules");
  };

  useEffect(() => {
    fetchTypeVehicules().then(setTypeVehicules).catch(() => {});
    getPublicMarques().then(setMarques).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentImg((p) => (p + 1) % cars.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Background image slideshow */}
      <AnimatePresence>
        <motion.div
          key={currentImg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cars[currentImg]})` }}
        />
      </AnimatePresence>
      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-20 pt-28 pb-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              {/* Left: badge + headline + subtitle */}
            <div className="flex-1 text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <span className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12]" />
                  {t("home.badge")}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-[-0.03em] text-[#f39c12]"
              >
                {t("home.hero.title1")}
                <br />
                <span className="text-[#f39c12]">{t("home.hero.title2")}</span>
              </motion.h1>

              {/* Search form */}
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)]">
              {/* Row 1: Pickup + Return dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.pickup_date")}
                  </label>
                  <Popover>
                    <PopoverTrigger className="w-full">
                      <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                        <CalendarDays className="w-4 h-4 shrink-0 text-white/50" />
                        {pickupDate ? (
                          <span className="font-medium text-white">
                            {new Date(pickupDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-white/40">{t("vehicles.pickup_date")}</span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                      <Calendar
                        size="lg"
                        mode="single"
                        selected={pickupDate ? new Date(pickupDate + "T00:00:00") : undefined}
                        onSelect={(d: Date | undefined) => {
                          if (d) {
                            const val = d.toISOString().split("T")[0];
                            setPickupDate(val);
                            if (returnDate && returnDate < val) {
                              setReturnDate("");
                            }
                          }
                        }}
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.return_date")}
                  </label>
                  <Popover>
                    <PopoverTrigger className="w-full">
                      <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                        <CalendarDays className="w-4 h-4 shrink-0 text-white/50" />
                        {returnDate ? (
                          <span className="font-medium text-white">
                            {new Date(returnDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-white/40">{t("vehicles.return_date")}</span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                      <Calendar
                        size="lg"
                        mode="single"
                        selected={returnDate ? new Date(returnDate + "T00:00:00") : undefined}
                        onSelect={(d: Date | undefined) => {
                          if (d) {
                            setReturnDate(d.toISOString().split("T")[0]);
                          }
                        }}
                        fromDate={pickupDate ? new Date(new Date(pickupDate + "T00:00:00").getTime() + 86400000) : new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row 2: Brand + Model + Fuel type + Vehicle type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.brand")}
                  </label>
                  <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                    <PopoverTrigger className="w-full">
                      <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                        {brand ? (
                          <>
                            <img src={getBrandLogo(brand) ?? ""} alt={brand} className="w-5 h-5 object-contain" />
                            <span className="font-medium text-white">{brand}</span>
                          </>
                        ) : (
                          <span className="text-white/40">{t("vehicles.all_types")}</span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={4} className="w-[340px] p-4 max-h-80 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => { setBrand(""); setBrandOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                      >
                        {t("vehicles.all_types")}
                      </button>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {marques.map((m) => {
                          const logoUrl = m.logo
                            ? `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}`
                            : getBrandLogo(m.name);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setBrand(m.name); setBrandOpen(false); }}
                              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm transition-all ${
                                brand === m.name
                                  ? "bg-[#f39c12]/20 text-[#f39c12] ring-2 ring-[#f39c12]/40"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                              }`}
                            >
                              {logoUrl && (
                                <img src={logoUrl} alt={m.name} className="w-8 h-8 object-contain shrink-0" />
                              )}
                              <span className="text-xs font-medium text-center leading-tight">{m.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.model")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("vehicles.model_placeholder")}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.fuel_type")}
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white appearance-none cursor-pointer focus:border-white/40 focus:bg-white/20 transition-all"
                  >
                    <option value="" className="text-gray-800">{t("vehicles.all_types")}</option>
                    <option value="Gasoline" className="text-gray-800">Gasoline</option>
                    <option value="Diesel" className="text-gray-800">Diesel</option>
                    <option value="Electricity" className="text-gray-800">Electricity</option>
                    <option value="Hybrid" className="text-gray-800">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                    {t("vehicles.vehicle_type")}
                  </label>
                  <select
                    value={typeVehiculeId ?? ""}
                    onChange={(e) => setTypeVehiculeId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white appearance-none cursor-pointer focus:border-white/40 focus:bg-white/20 transition-all"
                  >
                    <option value="" className="text-gray-800">{t("vehicles.all_types")}</option>
                    {typeVehicules.map((tv) => (
                      <option key={tv.id} value={tv.id} className="text-gray-800">{tv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Price range + Search */}
              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                      Min
                    </label>
                    <input
                      type="number"
                      placeholder="0 DH"
                      value={minPrice ?? ""}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">
                      Max
                    </label>
                    <input
                      type="number"
                      placeholder="1000 DH"
                      value={maxPrice ?? ""}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="h-11 px-8 rounded-xl bg-[#f39c12] hover:bg-[#d68910] text-[#395886] font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-[#f39c12]/20"
                >
                  <Search className="w-4 h-4" />
                  {t("vehicles.filter_button")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

            {/* Right: Vehicle showcase */}
            {displayVehicles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-[560px] lg:max-w-[780px]"
              >
                <div className="relative aspect-[4/3] flex items-center justify-center p-2">
                  {/* Concentric rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full border border-[#f39c12]/10"
                      style={{ animation: "pulse-ring 3s ease-in-out infinite" }}
                    />
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] aspect-square rounded-full border border-[#f39c12]/15"
                      style={{ animation: "pulse-ring 3s ease-in-out infinite 0.5s" }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full bg-[#f39c12]/[0.04] blur-[60px]" />
                  </div>
                  {/* Vehicle images */}
                  {displayVehicles.map((v, i) => {
                    const imgSrc = v.pictures?.[0]
                      ? vehicleImageUrl(v.pictures[0].path)
                      : "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80";
                    return (
                    <motion.div
                      key={v.id}
                      className="absolute inset-0 flex items-center justify-center p-4"
                      initial={false}
                      animate={{
                        opacity: i === vehicleIndex ? 1 : 0,
                        scale: i === vehicleIndex ? 1 : 0.85,
                        x: i === vehicleIndex ? 0 : 40,
                      }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        onClick={() => router.push(`/vehicules/${v.id}`)}
                        className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.3)] cursor-pointer group"
                      >
                        {/* ── Image taller ── */}
                        <div className="h-72 lg:h-96 bg-[#F0F3FA]/10 overflow-hidden relative">
                          <img
                            src={imgSrc}
                            alt={`${v.marque} ${v.model}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="text-[11px] font-bold text-white bg-[#395886]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                              {v.year}
                            </span>
                            <span className="text-[11px] font-bold text-white bg-[#f39c12]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                              {v.fuelType}
                            </span>
                          </div>
                          {/* ── Price bigger ── */}
                          <div className="absolute bottom-3 left-3 flex items-baseline gap-1 text-white drop-shadow-lg">
                            <span className="text-4xl font-black">{v.pricePerDay.toLocaleString()}</span>
                            <span className="text-base font-semibold opacity-90">DH / jour</span>
                          </div>
                        </div>
                        {/* ── Card footer bigger ── */}
                        <div className="p-5 flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-base truncate">{v.marque} {v.model}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-white/60 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>
                                {v.Occupants}
                              </span>
                              <span className="text-xs text-white/60 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                {v.km.toLocaleString()} km
                              </span>
                            </div>
                          </div>
                          {/* ── Button bigger ── */}
                          <div className="bg-[#f39c12] hover:bg-[#d68910] text-[#395886] text-sm font-black px-5 py-3 rounded-xl transition-colors">
                            Réserver
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>

                {/* Dot indicators */}
                {displayVehicles.length > 1 && (
                  <div className="flex items-center justify-center gap-2.5 mt-4">
                    {displayVehicles.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setVehicleIndex(i)}
                        className={`rounded-full transition-all duration-500 ${
                          i === vehicleIndex
                            ? "w-7 h-2 bg-[#f39c12]"
                            : "w-2 h-2 bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#D5DEEF" strokeWidth="2" opacity="0.6" />
              <motion.circle
                cx="12" cy="12" r="3"
                fill="#f39c12"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    const refs = cardsRef.current;
    const handlers: (() => void)[] = [];

    refs.forEach((card) => {
      if (!card) return;
      const handler = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      };
      const reset = () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      };
      card.addEventListener('mousemove', handler);
      card.addEventListener('mouseleave', reset);
      handlers.push(() => { card.removeEventListener('mousemove', handler); card.removeEventListener('mouseleave', reset); });
    });
    return () => handlers.forEach(h => h());
  }, []);

  return (
    <section className="bg-[#F0F3FA] dark:bg-[#070b14] py-28 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#395886 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Floating decorative icons */}
      <div className="absolute top-20 left-10 text-[#638ECB]/10 dark:text-[#638ECB]/5 text-6xl pointer-events-none" style={{ animation: 'float-slow 7s ease-in-out infinite' }}>&#9670;</div>
      <div className="absolute bottom-40 right-16 text-[#f39c12]/10 dark:text-[#f39c12]/5 text-4xl pointer-events-none" style={{ animation: 'float-drift 12s ease-in-out infinite' }}>&#9679;</div>
      <div className="absolute top-60 right-20 text-[#395886]/8 dark:text-[#395886]/5 text-5xl pointer-events-none" style={{ animation: 'float-slow 9s ease-in-out infinite 2s' }}>&#9641;</div>

      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1200 64" className="w-full h-full text-white fill-current">
          <path d="M0,32 C300,64 600,0 1200,32 L1200,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full border border-[#f39c12]/20">{t("home.services.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.services.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.services.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.titleKey}
              ref={(el) => { cardsRef.current[i] = el; }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ boxShadow: "0 30px 70px rgba(57,88,134,0.18)" }}
              className="group gradient-border-card bg-white dark:bg-[#0f1729] rounded-3xl p-8 border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 transition-all duration-500 hover:border-transparent dark:hover:border-transparent cursor-default dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D5DEEF] to-[#c5d0e4] dark:from-[#1e293b] dark:to-[#253249] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-6 transition-all duration-500 group-hover:from-[#395886] group-hover:to-[#2d4670] dark:group-hover:from-[#f39c12] dark:group-hover:to-[#d68910] group-hover:text-white group-hover:shadow-[0_8px_25px_rgba(57,88,134,0.3)] dark:group-hover:shadow-[0_8px_25px_rgba(243,156,18,0.3)]">
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  {svc.icon}
                </motion.div>
              </div>
              <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#f39c12] group-hover:translate-x-1">{t(svc.titleKey)}</h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed mb-4">{t(svc.descKey)}</p>
              <div className="flex items-center gap-2 text-[#f39c12] text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <span>{t("home.services.learn_more")}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const { t } = useI18n();

  return (
    <section className="bg-white dark:bg-[#0b1121] py-28 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Background decorations */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#f39c12]/5 dark:bg-[#f39c12]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#395886 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full border border-[#f39c12]/20">{t("home.how.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6">
            {t("home.how.title")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Animated connector with dots */}
          <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%]">
            <div className="relative h-[3px] bg-gradient-to-r from-[#D5DEEF] via-[#638ECB] to-[#D5DEEF] dark:from-[#1e293b] dark:via-[#395886] dark:to-[#1e293b]" style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 4s ease infinite' }}>
              {/* Connection dots */}
              <div className="absolute -top-[5px] left-0 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite' }} />
              <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite 0.6s' }} />
              <div className="absolute -top-[5px] right-0 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite 1.2s' }} />
            </div>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              className="relative flex flex-col items-center text-center group bg-white/50 dark:bg-[#0f1729]/50 backdrop-blur-sm rounded-3xl p-8 border border-[#D5DEEF]/30 dark:border-[#1e293b]/50 transition-all duration-500 hover:bg-white dark:hover:bg-[#131c31] hover:border-[#638ECB]/20 dark:hover:border-[#638ECB]/10 hover:shadow-[0_20px_60px_rgba(57,88,134,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              {/* Step badge */}
              <div className="absolute top-4 right-4 text-[10px] font-bold text-[#638ECB]/40 dark:text-[#638ECB]/30 tracking-widest uppercase">
                {activeStep === i ? t("home.how.in_progress") : `${t("home.how.step")} ${i + 1}`}
              </div>

              {/* Number */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#395886] to-[#2d4670] flex items-center justify-center text-[#f39c12] text-xl font-black mb-6 relative z-10 shadow-[0_8px_25px_rgba(57,88,134,0.2)] transition-all duration-500 group-hover:shadow-[0_12px_40px_rgba(57,88,134,0.4)]"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: i * 0.2 + 0.3 }}
                >
                  {step.num}
                </motion.span>
                {/* Glow ring */}
                <motion.div
                  animate={activeStep === i ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-2xl ring-2 ring-[#f39c12]/30"
                />
              </motion.div>

              {/* Content */}
              <motion.h3
                className="text-xl font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#f39c12]"
                animate={activeStep === i ? { x: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {t(step.titleKey)}
              </motion.h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed max-w-xs">{t(step.descKey)}</p>

              {/* Bottom indicator line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#638ECB] to-[#f39c12] origin-left"
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-xs text-[#638ECB]/50 dark:text-[#638ECB]/30 mt-12 tracking-widest uppercase"
        >
          &mdash; {t("home.how.ready")} &mdash;
        </motion.p>
      </div>
    </section>
  );
}

const STAT_KEYS = [
  { valueKey: "stat_1_value", labelEnKey: "stat_1_label_en", labelFrKey: "stat_1_label_fr", labelArKey: "stat_1_label_ar", fallbackLabelKey: "home.stats.years" },
  { valueKey: "stat_2_value", labelEnKey: "stat_2_label_en", labelFrKey: "stat_2_label_fr", labelArKey: "stat_2_label_ar", fallbackLabelKey: "home.stats.vehicles" },
  { valueKey: "stat_3_value", labelEnKey: "stat_3_label_en", labelFrKey: "stat_3_label_fr", labelArKey: "stat_3_label_ar", fallbackLabelKey: "home.stats.clients" },
  { valueKey: "stat_4_value", labelEnKey: "stat_4_label_en", labelFrKey: "stat_4_label_fr", labelArKey: "stat_4_label_ar", fallbackLabelKey: "home.stats.support" },
];

const STAT_FALLBACK_VALUES: Record<string, string> = {
  stat_1_value: "15+",
  stat_1_label_en: "Years of expertise",
  stat_1_label_fr: "Années d'expertise",
  stat_1_label_ar: "سنوات من الخبرة",
  stat_2_value: "200+",
  stat_2_label_en: "Vehicles available",
  stat_2_label_fr: "Véhicules disponibles",
  stat_2_label_ar: "مركبة متاحة",
  stat_3_value: "5000+",
  stat_3_label_en: "Satisfied clients",
  stat_3_label_fr: "Clients satisfaits",
  stat_3_label_ar: "عميل راضٍ",
  stat_4_value: "24/7",
  stat_4_label_en: "Customer support",
  stat_4_label_fr: "Support client",
  stat_4_label_ar: "دعم العملاء",
};

function StatsSection() {
  const { t, locale } = useI18n();
  const { settings } = useSettings();

  const getStatValue = (key: string): string => {
    return (settings as Record<string, string>)[key] ?? STAT_FALLBACK_VALUES[key] ?? "";
  };

  const getStatLabel = (stat: (typeof STAT_KEYS)[number]): string => {
    const labelKey = locale === "en" ? stat.labelEnKey : locale === "fr" ? stat.labelFrKey : stat.labelArKey;
    const customLabel = (settings as Record<string, string>)[labelKey];
    if (customLabel) return customLabel;
    return t(stat.fallbackLabelKey);
  };

  return (
    <section className="bg-[#395886] dark:bg-[#0b1121] py-24 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#638ECB]/20 dark:border-[#638ECB]/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full border border-[#f39c12]/10 dark:border-[#f39c12]/5"
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(243,156,18,0.05) 0%, transparent 60%)' }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_KEYS.map((stat, i) => (
            <motion.div
              key={stat.valueKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-5 transition-all duration-500 group-hover:bg-[#f39c12]/20 group-hover:border-[#f39c12]/30 group-hover:shadow-[0_0_30px_rgba(243,156,18,0.15)]"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  className="text-3xl md:text-4xl font-black text-[#f39c12] block"
                >
                  {getStatValue(stat.valueKey)}
                </motion.span>
              </motion.div>
              <span className="text-sm text-[#D5DEEF] font-medium block transition-colors duration-300 group-hover:text-white">{getStatLabel(stat)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehicleFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#638ECB] dark:text-[#94A3B8]"
      whileHover={{ scale: 1.1, color: "#f39c12" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </motion.span>
  );
}

function VehiclesMarquee() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [marques, setMarques] = useState<Marque[]>([]);
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();

  const marqueLogoMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of marques) {
      const key = m.name.toLowerCase().trim();
      if (m.logo) {
        map.set(key, `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}`);
      }
    }
    return map;
  }, [marques]);

  const marqueImg = useCallback((name: string): string | null => {
    const key = name.toLowerCase().trim();
    return marqueLogoMap.get(key) ?? getBrandLogo(name);
  }, [marqueLogoMap]);

  useEffect(() => {
    listVehicles()
      .then((data) => { setVehicles(data); setLoading(false); })
      .catch(() => { setVehicles([]); setLoading(false); });
    getPublicMarques().then(setMarques);
  }, []);

  const duplicated = [...vehicles, ...vehicles];
  const cardWidth = 380 + 24;
  const scrollRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (prefersReduced || vehicles.length === 0 || !scrollRef.current) return;
    const el = scrollRef.current;
    let lastTime = performance.now();
    const speed = (vehicles.length * cardWidth) / 60;

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      if (!isHovering) {
        translateXRef.current -= speed * (delta / 1000);
        const resetPoint = -(vehicles.length * cardWidth);
        if (translateXRef.current <= resetPoint) {
          translateXRef.current += vehicles.length * cardWidth;
        }
        el.style.transform = `translateX(${translateXRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovering, prefersReduced, vehicles.length, cardWidth]);

  const scrollBy = (dir: -1 | 1) => {
    if (!scrollRef.current) return;
    translateXRef.current += dir * cardWidth;
    if (translateXRef.current > 0) translateXRef.current = -(vehicles.length * cardWidth);
    const resetPoint = -(vehicles.length * cardWidth);
    if (translateXRef.current <= resetPoint) translateXRef.current = 0;
    scrollRef.current.style.transform = `translateX(${translateXRef.current}px)`;
  };

  return (
    <section className="bg-white dark:bg-[#070b14] py-28 px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-14 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full">
            {t("home.marquee.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.marquee.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.marquee.subtitle")}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex gap-6 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[380px] rounded-3xl overflow-hidden">
              <div className="h-64 bg-[#F0F3FA] dark:bg-[#1e293b] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-3/4" />
                <div className="h-4 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-2/3" />
                <div className="h-4 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
            }}
          >
            <div ref={scrollRef} className="flex gap-6 pb-4" style={{ transform: 'translateX(0px)', willChange: 'transform', transition: isHovering ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none' }}>
              {duplicated.map((v, i) => {
                const imgSrc = v.pictures?.[0]
                  ? vehicleImageUrl(v.pictures[0].path)
                  : "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80";

                const features: { show: boolean; icon: React.ReactNode; label: string }[] = [
                  {
                    show: v.air_conditioner === true,
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v8" />
                        <path d="M4 14h16" /><rect x="4" y="11" width="16" height="3" rx="1" />
                      </svg>
                    ),
                    label: "Climatisation",
                  },
                  {
                    show: v.gps === true,
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
                      </svg>
                    ),
                    label: "GPS",
                  },
                  {
                    show: true,
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                    label: `${v.Occupants} places`,
                  },
                  {
                    show: true,
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    ),
                    label: `${v.km.toLocaleString()} km`,
                  },
                ];

                return (
                  <motion.button
                    key={`${v.id}-${i}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.05 * (i % vehicles.length) }}
                    whileHover={{ scale: 1.03, y: -10 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      router.push(`/vehicules/${v.id}`);
                    }}
                    className="shrink-0 w-[380px] bg-white dark:bg-[#0f1729] rounded-3xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 overflow-hidden text-left shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_70px_rgba(57,88,134,0.2)] dark:hover:shadow-[0_25px_70px_rgba(0,0,0,0.55)] transition-all duration-500 group cursor-pointer"
                  >
                    <div className="h-64 bg-[#F0F3FA] dark:bg-[#1e293b] overflow-hidden relative">
                      <motion.img
                        src={imgSrc}
                        alt={`${v.marque} ${v.model}`}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.12 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-[11px] font-bold text-white bg-[#395886]/80 dark:bg-[#0f1729]/80 backdrop-blur-sm px-2.5 py-1 rounded-full"
                        >
                          {v.year}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-[11px] font-bold text-white bg-[#f39c12]/80 backdrop-blur-sm px-2.5 py-1 rounded-full"
                        >
                          {v.fuelType}
                        </motion.span>
                        {v.category && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-[11px] font-bold text-white bg-[#638ECB]/80 backdrop-blur-sm px-2.5 py-1 rounded-full"
                          >
                            {v.category.name}
                          </motion.span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div className="flex items-baseline gap-1 text-white drop-shadow-lg">
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-black"
                          >
                            {v.pricePerDay.toLocaleString()}
                          </motion.span>
                          <span className="text-sm font-semibold opacity-90">DH / jour</span>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-400"
                        >
                          Réserver →
                        </motion.div>
                      </div>
                    </div>
                    <div className="p-5 overflow-hidden relative">
                      {marqueImg(v.marque) && (
                        <Image
                          src={marqueImg(v.marque)!}
                          alt=""
                          width={200}
                          height={200}
                          className="absolute -bottom-6 -right-6 w-[180px] h-[180px] opacity-[0.08] -rotate-[15deg] pointer-events-none select-none z-0"
                          draggable={false}
                          priority={false}
                          unoptimized
                        />
                      )}
                      <div className="flex items-center gap-2 mb-3 relative z-10">
                        {marqueImg(v.marque) ? (
                          <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1f4276] flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                            <Image
                              src={marqueImg(v.marque)!}
                              alt={v.marque}
                              width={28}
                              height={28}
                              className="w-full h-full object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] shrink-0">{v.marque}</span>
                        )}
                        <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#f39c12] transition-colors duration-300 leading-tight">
                          {v.model}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 relative z-10">
                        {features.filter((f) => f.show).map((f, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + idx * 0.05 }}
                          >
                            <VehicleFeature icon={f.icon} label={f.label} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          {isHovering && (
            <>
              <button
                onClick={() => scrollBy(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-md border border-gray-200 dark:border-[#1e293b] shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1e293b] transition-all duration-200"
                aria-label="Previous vehicles"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#395886] dark:text-[#D5DEEF]">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => scrollBy(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-md border border-gray-200 dark:border-[#1e293b] shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#1e293b] transition-all duration-200"
                aria-label="Next vehicles"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#395886] dark:text-[#D5DEEF]">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </motion.div>
      )}
    </section>
  );
}

function MarquesSection() {
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    getPublicMarques()
      .then((data) => { setMarques(data); setLoading(false); })
      .catch(() => { setMarques([]); setLoading(false); });
  }, []);

  const MIN_VISIBLE = 16;
  const repeatCount = marques.length === 0 ? 0 : Math.max(2, Math.ceil(MIN_VISIBLE / marques.length));
  const duplicated = Array.from({ length: repeatCount }, () => marques).flat();

  return (
    <section className="bg-white dark:bg-[#070b14] py-28 px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-14 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full">
            {t("home.brands.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.brands.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.brands.subtitle")}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex gap-6 justify-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shrink-0 w-40 h-40 rounded-3xl bg-[#F0F3FA] dark:bg-[#1e293b] animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div
            className="flex gap-16 w-max pb-4"
            style={{
              animation: prefersReduced ? "none" : "marquee-reverse 45s linear infinite",
              animationPlayState: "running",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
            onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
          >
            {duplicated.map((marque, i) => (
              <motion.div
                key={`${marque.id}-${i}`}
                whileHover={{ scale: 1.08 }}
                className="group shrink-0 flex flex-col items-center justify-center gap-3 cursor-default"
              >
                {marque.logo ? (
                  <img
                    src={vehicleImageUrl(marque.logo)}
                    alt={marque.name}
                    className="w-32 h-32 object-contain transition-all duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center">
                    <span className="text-5xl font-black text-[#638ECB] dark:text-[#D5DEEF]">
                      {marque.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-base font-bold text-[#395886] dark:text-[#D5DEEF] text-center transition-colors duration-300 group-hover:text-[#f39c12]">
                  {marque.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes marquee-reverse {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <section className="bg-[#D5DEEF] dark:bg-[#0b1121] py-32 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          background: 'linear-gradient(135deg, #D5DEEF, #b0c4de, #f39c12, #395886, #D5DEEF)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 12s ease infinite',
        }}
      />
      {/* Overlay to keep readability */}
      <div className="absolute inset-0 bg-[#D5DEEF]/60 dark:bg-[#0b1121]/80 backdrop-blur-[2px]" />

      {/* Floating geometric shapes */}
      <div className="absolute top-16 left-1/4 w-4 h-4 rounded-full bg-[#f39c12]/40 pointer-events-none" style={{ animation: 'float-slow 5s ease-in-out infinite' }} />
      <div className="absolute top-32 right-1/3 w-3 h-3 bg-[#395886]/30 pointer-events-none" style={{ animation: 'float-drift 8s ease-in-out infinite 1s', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute bottom-20 left-1/3 w-6 h-6 rounded-full bg-[#638ECB]/20 pointer-events-none" style={{ animation: 'float-slow 6s ease-in-out infinite 2s' }} />
      <div className="absolute top-1/2 right-1/4 w-5 h-5 border-2 border-[#f39c12]/20 pointer-events-none" style={{ animation: 'spin-slow 20s linear infinite', transformOrigin: 'center' }} />
      <div className="absolute bottom-1/3 left-[15%] w-8 h-8 border border-[#395886]/15 pointer-events-none" style={{ animation: 'spin-slow 25s linear infinite reverse', transformOrigin: 'center', borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%' }} />

      {/* Twinkling sparkle dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#f39c12]/40 pointer-events-none"
          style={{
            top: `${15 + i * 12}%`,
            left: `${10 + i * 15}%`,
            animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-white/70 dark:bg-[#1e293b]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#f39c12]/20 shadow-[0_2px_10px_rgba(243,156,18,0.1)] dark:shadow-[0_2px_10px_rgba(243,156,18,0.05)]"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#f39c12]"
            />
            {t("home.cta.ready")}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 mb-6 leading-tight flex flex-wrap items-center justify-center gap-x-3"
          >
            {t("home.cta.title1")}
            <span className="relative inline-flex items-center">
              <img
                src="/logo.png"
                alt="CARFORFAR"
                className="h-16 md:h-20 w-auto object-contain dark:hidden"
              />
              <img
                src="/logo-dark.png"
                alt="CARFORFAR"
                className="h-16 md:h-20 w-auto object-contain hidden dark:block"
              />
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-[#f39c12]/20 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            <span>{t("home.cta.title2")}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[#638ECB] dark:text-[#94A3B8] text-lg mb-10 max-w-lg mx-auto"
          >
            {t("home.cta.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative inline-flex"
          >
            {/* Pulsing ring behind button */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#395886]/30 dark:border-[#f39c12]/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 15px 50px rgba(57,88,134,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="relative overflow-hidden bg-gradient-to-r from-[#395886] via-[#2d4670] to-[#395886] hover:from-[#2d4670] hover:to-[#1e3560] text-white font-black text-sm tracking-[0.15em] uppercase px-14 py-5 rounded-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(57,88,134,0.35)] shimmer-btn"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10">{t("home.cta.button")}</span>
            </motion.button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-[11px] text-[#638ECB]/50 dark:text-[#94A3B8]/40 mt-8 tracking-wider"
          >
            {t("home.cta.trust")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  const { t } = useI18n();
  const { settings } = useSettings();

  return (
    <footer className="bg-[#395886] dark:bg-[#050a14] px-8 py-16 relative overflow-hidden transition-colors duration-500">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f39c12]/30 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <CarLogo dark />
            </div>
            <p className="text-[#D5DEEF]/60 text-sm max-w-xs mt-4 leading-relaxed">
              {t("footer.description")}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                title: t("footer.company"),
                links: [
                  { label: t("home.services.premium"), href: "/vehicules" },
                  { label: t("home.services.concierge"), href: "/settings" },
                  { label: t("home.services.insurance"), href: "/regles" },
                  { label: t("home.services.delivery"), href: "/vehicules" },
                ],
              },
              {
                title: t("footer.legal"),
                links: [
                  { label: t("rules.title"), href: "/regles" },
                  { label: t("footer.privacy"), href: "/privacy" },
                ],
              },
              {
                title: "Contact",
                links: [
                  { label: settings.email || "contact@carforfar.ma", href: `mailto:${settings.email || "contact@carforfar.ma"}` },
                  { label: settings.phone || "+212 5XX XX XX XX", href: `tel:${settings.phone?.replace(/\s/g, "") || "+2125XXXXXXXX"}` },
                  { label: settings.address || t("home.map.location_text"), href: "#" },
                ],
              },
            ].map((col, ci) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <h4 className="text-[#f39c12] text-xs font-bold tracking-[0.15em] uppercase mb-4">{col.title}</h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((linkObj) => (
                    <a key={linkObj.label} href={linkObj.href} className="text-[#D5DEEF]/70 text-sm hover:text-[#f39c12] transition-all duration-300 hover:translate-x-1 inline-block w-fit">
                      {linkObj.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-[#638ECB]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-[#D5DEEF]/40 text-xs">&copy; {new Date().getFullYear()} <a href="https://cdigital.ma/" target="_blank" rel="noopener noreferrer" className="text-[#D5DEEF]/60 hover:text-[#f39c12] transition-colors duration-200">Cdigital</a>. {t("footer.rights")}</p>
          <div className="flex gap-4">
            {["Instagram", "Facebook", "LinkedIn"].map((s) => (
              <motion.a
                key={s}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-[#D5DEEF]/40 text-xs hover:text-[#f39c12] transition-colors duration-300"
              >
                {s}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function AboutSection() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useI18n();

  return (
    <section className="bg-[#f7f7fa] dark:bg-[#0b1121] py-28 border-t border-[#ebedf2] dark:border-[#1e293b]/60 relative overflow-hidden transition-colors duration-500">
      {/* Noise texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#1f4276]/5 dark:border-[#f39c12]/5 pointer-events-none" style={{ animation: 'float-slow 12s ease-in-out infinite' }} />
      <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full border border-[#f39c12]/8 dark:border-[#638ECB]/8 pointer-events-none" style={{ animation: 'float-drift 15s ease-in-out infinite' }} />
      <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-[#1f4276]/10 dark:bg-[#f39c12]/10 pointer-events-none" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />

      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-[#7385a9] dark:text-[#94A3B8] bg-[#7385a9]/10 dark:bg-[#94A3B8]/10 px-4 py-2 rounded-full border border-[#7385a9]/10 dark:border-[#94A3B8]/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7385a9] dark:bg-[#94A3B8] animate-pulse" />
            {t("vehicles.about_label")}
          </motion.div>

          <h2 className="mt-6 text-[56px] leading-[1.05] font-extrabold text-[#1f4276] dark:text-[#D5DEEF]">
            {t("vehicles.about_title")}
          </h2>
          <div className="w-16 h-1 bg-[#f39c12] rounded-full mt-6" />
          <p className="mt-8 text-[18px] leading-[1.9] text-gray-600 dark:text-[#94A3B8]">
            {t("vehicles.about_text1")}
          </p>
          <p className="mt-6 text-[18px] leading-[1.9] text-gray-600 dark:text-[#94A3B8]">
            {t("vehicles.about_text2")}
          </p>

          <div className="flex gap-16 mt-14">
            {[
              { value: t("vehicles.stats_years_value"), label: t("vehicles.stats_years_label") },
              { value: t("vehicles.stats_concierge_value"), label: t("vehicles.stats_concierge_label") },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
              >
                <motion.div
                  className="text-[56px] font-extrabold text-[#1f4276] dark:text-[#f39c12] leading-none"
                  initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: i * 0.15 + 0.5 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-[13px] uppercase tracking-[0.12em] text-gray-500 dark:text-[#94A3B8] mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: "0 20px 60px rgba(31,66,118,0.12)" }}
            className="bg-white dark:bg-[#0f1729] rounded-[26px] shadow-[0_12px_35px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] h-[480px] flex items-center justify-center overflow-hidden relative transition-all duration-500"
          >
            {/* Subtle gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f7f7fa] to-white dark:from-[#0f1729] dark:to-[#0b1121] opacity-60 dark:opacity-100" />
            <div className="text-center relative z-10 p-8">
              <motion.img
                src="/about-logo.png"
                alt="CARFORFAR"
                className="w-full max-w-[420px] h-auto object-contain mx-auto dark:hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.img
                src="/about-logo-dark.png"
                alt="CARFORFAR"
                className="w-full max-w-[420px] h-auto object-contain mx-auto hidden dark:block"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


export default function HomePage() {
  const { locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  const pageTitle = PAGE_TITLES.home[typedLocale] || PAGE_TITLES.home.fr;
  const pageDesc = PAGE_DESCRIPTIONS.home[typedLocale] || PAGE_DESCRIPTIONS.home.fr;

  useClientMetadata({ title: pageTitle, description: pageDesc });

  const [vehicles, setHeroVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listVehicles()
      .then((data) => setHeroVehicles(data))
      .catch(() => setHeroVehicles([]));
  }, []);

  const breadcrumbItems = [
    { name: "CARFORFAR", url: "https://www.carforfar.ma/" },
    { name: "Accueil", url: "https://www.carforfar.ma/" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] font-sans overflow-x-hidden transition-colors duration-500">
      <JsonLd id="ld-organization" data={organizationLD(typedLocale)} />
      <JsonLd id="ld-website" data={websiteLD(typedLocale)} />
      <JsonLd id="ld-local-business" data={localBusinessLD(typedLocale)} />
      <JsonLd id="ld-breadcrumb" data={breadcrumbLD(breadcrumbItems)} />
      <style>{`
        html { scroll-behavior: smooth; }
        ::selection { background: #638ECB/30; color: #395886; }
        .dark ::selection { background: #f39c12/40; color: #fff; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(15px, -15px); }
          50% { transform: translate(30px, 0); }
          75% { transform: translate(15px, 15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(243,156,18,0.2); }
          50% { box-shadow: 0 0 40px rgba(243,156,18,0.5); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes border-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scale-bounce {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes reveal-up {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
          border-radius: inherit;
        }
        .gradient-border-card {
          position: relative;
          background-clip: padding-box;
          border: 1px solid transparent;
        }
        .gradient-border-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #D5DEEF, #638ECB, #f39c12, #D5DEEF);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .gradient-border-card:hover::before {
          opacity: 1;
          animation: border-shimmer 3s ease infinite;
        }
        .dark .gradient-border-card::before {
          background: linear-gradient(135deg, #1e293b, #638ECB, #f39c12, #1e293b);
        }
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-track { background: #0f1729; }
        .dark ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        /* Dark mode radial backgrounds */
        .dark .hero-gradient { background: radial-gradient(ellipse at 50% 50%, rgba(57,88,134,0.15) 0%, transparent 70%); }
        /* Dark glow for cards */
        .dark .card-glow { box-shadow: 0 0 30px rgba(57,88,134,0.05); }
      `}</style>
      <Header />
      <ResumeReservationBanner />
      <HeroSection vehicles={vehicles} />
      <VehiclesMarquee />
      <MarquesSection />
      <ServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
      <AboutSection />
      <MapSection />
    </div>
  );
}