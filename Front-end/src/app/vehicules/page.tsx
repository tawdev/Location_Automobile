"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ClientOnly } from "@/components/ClientOnly";
import { listVehicles, fetchCategories } from "@/lib/vehiclesApi";
import type { Vehicle, Category, Marque } from "@/lib/types";
import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getBrandLogo } from "@/lib/brandLogos";
import { getPublicMarques } from "@/lib/marquesApi";
import Image from "next/image";

const NEW_COUNT = 10;

const LazyVehicleImage = memo(function LazyVehicleImage({
  picturePath,
  children,
  className,
}: {
  picturePath: string | undefined;
  children: React.ReactNode;
  className: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundImage: picturePath && loaded
          ? `url(${vehicleImageUrl(picturePath)})`
          : picturePath
            ? undefined
            : "linear-gradient(135deg, #2a2e3a, #1c2033)",
        backgroundColor: picturePath && !loaded ? "#f1f4f9" : undefined,
      }}
    >
      {children}
    </div>
  );
});

export default function VehiculesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);

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

  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listVehicles();
      setVehicles(data);
    } catch (e) {
      const msg = (e as { message?: string })?.message || t("vehicles.error_load");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const id = setTimeout(() => { void loadInitial(); }, 0);
    return () => clearTimeout(id);
  }, [loadInitial]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    getPublicMarques().then(setMarques);
  }, []);

  // Read URL search params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pu = params.get("pickup_date");
    const rt = params.get("return_date");
    const mq = params.get("marque");
    const md = params.get("model");
    const minP = params.get("min_price");
    const maxP = params.get("max_price");
    if (pu) setPickupDate(pu);
    if (rt) setReturnDate(rt);
    const searchParts: string[] = [];
    if (mq) searchParts.push(mq);
    if (md) searchParts.push(md);
    if (searchParts.length > 0) setSearchText(searchParts.join(" "));
    if (minP) setMinPrice(Number(minP));
    if (maxP) setMaxPrice(Number(maxP));
  }, []);

  // Derived filter options
  const brands = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => { if (v.marque) set.add(v.marque); });
    return Array.from(set).sort();
  }, [vehicles]);

  const fuelTypes = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => { if (v.fuelType) set.add(v.fuelType); });
    return Array.from(set).sort();
  }, [vehicles]);

  const seatsOptions = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => { if (v.Occupants) set.add(v.Occupants); });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [vehicles]);

  // Toggle helpers
  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };
  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };
  const toggleFuelType = (type: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };
  const toggleSeats = (val: string) => {
    setSelectedSeats((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedFuelTypes([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedSeats([]);
    setPickupDate("");
    setReturnDate("");
    setSearchText("");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
    selectedFuelTypes.length > 0 || minPrice !== undefined || maxPrice !== undefined ||
    selectedSeats.length > 0 || pickupDate || returnDate || searchText;

  // Client-side filtering
  const filteredVehicles = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    return list.filter((v) => {
      if (!v.marque) return false;

      if (searchText) {
        const q = searchText.toLowerCase();
        if (!v.marque.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q)) return false;
      }

      if (selectedCategories.length > 0) {
        const catName = v.category?.name;
        if (!catName || !selectedCategories.includes(catName)) return false;
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(v.marque)) return false;

      if (selectedFuelTypes.length > 0 && !selectedFuelTypes.includes(v.fuelType)) return false;

      if (selectedSeats.length > 0 && !selectedSeats.includes(v.Occupants)) return false;

      if (minPrice !== undefined && v.pricePerDay < minPrice) return false;
      if (maxPrice !== undefined && v.pricePerDay > maxPrice) return false;

      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [vehicles, searchText, selectedCategories, selectedBrands, selectedFuelTypes, selectedSeats, minPrice, maxPrice]);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const refs = cardsRef.current;
    const handlers: (() => void)[] = [];
    refs.forEach((card) => {
      if (!card) return;
      let ticking = false;
      const onMove = (e: MouseEvent) => {
        if (ticking) return;
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rx = ((y - cy) / cy) * -8;
          const ry = ((x - cx) / cx) * 8;
          card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
          ticking = false;
        });
        ticking = true;
      };
      const onLeave = () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      handlers.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); });
    });
    return () => handlers.forEach(h => h());
  }, [filteredVehicles]);

  // Sidebar filter content (reused in both desktop sidebar and mobile drawer)
  const filterPanel = (
    <div className="space-y-3">
      {/* Search */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.search_label")}
        </label>
        <div className="h-[44px] bg-white dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl flex items-center px-4">
          <Search className="w-[16px] h-[16px] text-gray-400 dark:text-[#64748b]" />
          <input
            type="text"
            placeholder={t("vehicles.search_placeholder")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-transparent outline-none ml-2.5 w-full text-[14px] text-gray-700 dark:text-[#D5DEEF] placeholder:text-gray-400 dark:placeholder:text-[#64748b]"
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.dates")}
        </h4>
        <div className="space-y-2">
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => {
              const val = e.target.value;
              setPickupDate(val);
              if (returnDate && val && returnDate < val) setReturnDate("");
            }}
            className="w-full h-[44px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-4 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF] [color-scheme:light] dark:[color-scheme:dark]"
          />
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={pickupDate || undefined}
            className="w-full h-[44px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-4 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF] [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {/* Price range */}
      {(() => {
        const maxPriceFromData = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.pricePerDay)) : 1000;
        const sliderMax = Math.max(maxPriceFromData, 100);
        const rangeMin = minPrice ?? 0;
        const rangeMax = maxPrice ?? sliderMax;
        const leftPct = (rangeMin / sliderMax) * 100;
        const rightPct = 100 - (rangeMax / sliderMax) * 100;
        return (
          <div>
            <div>
              <h4 className="text-[14px] font-bold text-gray-700 dark:text-white mb-3">
                {t("vehicles.price_range")}
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    aria-label={t("vehicles.min_price")}
                    placeholder="Min"
                    type="number"
                    value={rangeMin}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= rangeMax) {
                        setMinPrice(val);
                      }
                    }}
                    className="w-full h-[38px] rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-center text-[13px] font-bold text-gray-700 dark:text-white outline-none focus:border-[#99cc00] dark:focus:border-[#99cc00] transition-colors"
                  />
                </div>
                <span className="text-gray-300 dark:text-white/20 font-bold">—</span>
                <div className="relative flex-1">
                  <input
                    aria-label={t("vehicles.max_price")}
                    placeholder="Max"
                    type="number"
                    value={rangeMax}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= rangeMin && val <= sliderMax) {
                        setMaxPrice(val);
                      }
                    }}
                    className="w-full h-[38px] rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-center text-[13px] font-bold text-gray-700 dark:text-white outline-none focus:border-[#99cc00] dark:focus:border-[#99cc00] transition-colors"
                  />
                </div>
              </div>
              <div className="relative h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full mb-2">
                <div
                  className="absolute h-full bg-[#99cc00] rounded-full"
                  style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  value={rangeMin}
                  aria-label={t("vehicles.min_price")}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= (maxPrice ?? sliderMax)) setMinPrice(val);
                  }}
                  className="dual-range-input z-30"
                />
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  value={rangeMax}
                  aria-label={t("vehicles.max_price")}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= (minPrice ?? 0)) setMaxPrice(val);
                  }}
                  className="dual-range-input z-40"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Category */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.category")}
        </h4>
        <select
          value={selectedCategories[0] || ""}
          onChange={(e) => setSelectedCategories(e.target.value ? [e.target.value] : [])}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF]"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.brand")}
        </h4>
        <select
          value={selectedBrands[0] || ""}
          onChange={(e) => setSelectedBrands(e.target.value ? [e.target.value] : [])}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF]"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Fuel type */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.fuel_type")}
        </h4>
        <select
          value={selectedFuelTypes[0] || ""}
          onChange={(e) => setSelectedFuelTypes(e.target.value ? [e.target.value] : [])}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF]"
        >
          <option value="">All fuel types</option>
          {fuelTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Seats */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.seats_label")}
        </h4>
        <select
          value={selectedSeats[0] || ""}
          onChange={(e) => setSelectedSeats(e.target.value ? [e.target.value] : [])}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF]"
        >
          <option value="">All seats</option>
          {seatsOptions.map((s) => (
            <option key={s} value={s}>{s} {t("vehicles.seats")}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#475569] text-gray-400 dark:text-[#94A3B8] text-[12px] font-semibold hover:bg-gray-50 dark:hover:bg-[#1e293b]/60 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          {t("vehicles.clear_filters")}
        </button>
      )}
    </div>
  );

  return (
    <ClientOnly>
      <div className="bg-gray-50/50 dark:bg-[#070b14] transition-colors duration-500">
        {/* Banner */}
        <section className="relative pt-24 pb-14 px-8 bg-gradient-to-br from-[#1f4276] via-[#2d5a8e] to-[#395886] dark:from-[#050a14] dark:to-[#0d1b3e]">
          <div className="px-8">
            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-extrabold text-white"
            >
              {t("vehicles.page_title")}
            </motion.h1>
            <motion.p
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
               className="mt-2 text-white/60 text-base max-w-xl font-medium"
            >
              {t("vehicles.featured_subtitle")}
            </motion.p>
          </div>
        </section>

        {/* Main layout */}
        <div className="px-8 py-8">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <p className="text-sm text-gray-500 dark:text-[#94A3B8]">
              {filteredVehicles.length} {t("vehicles.vehicles_found")}
            </p>
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 px-4 rounded-xl bg-white dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 text-gray-700 dark:text-[#D5DEEF] text-[13px] font-semibold flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("vehicles.filters")}
            </button>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-[320px] shrink-0">
              <div className="sticky top-28 bg-white dark:bg-[#0f1729]/60 rounded-2xl border border-gray-200/80 dark:border-[#1e293b]/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold text-gray-500 dark:text-[#D5DEEF] uppercase tracking-[0.15em] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    {t("vehicles.filters")}
                  </h3>
                </div>
                {filterPanel}
              </div>
            </aside>

            {/* Mobile filter drawer */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[90vw] bg-white dark:bg-[#0f1729] shadow-2xl overflow-y-auto p-6 border-l border-gray-100 dark:border-[#1e293b]/60">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[11px] font-bold text-gray-500 dark:text-[#D5DEEF] uppercase tracking-[0.15em] flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      {t("vehicles.filters")}
                    </h3>
                    <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b]/60">
                      <X className="w-5 h-5 text-gray-500 dark:text-[#94A3B8]" />
                    </button>
                  </div>
                  {filterPanel}
                </div>
              </div>
            )}

            {/* Vehicle grid */}
            <div className="flex-1 min-w-0">
              {/* Result count (desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-gray-400 dark:text-[#94A3B8]">
                  {filteredVehicles.length} {t("vehicles.vehicles_found")}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/60 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </motion.div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                       className="bg-white dark:bg-[#0f1729] rounded-[18px] overflow-hidden border border-gray-100/60 dark:border-[#1e293b]/60"
                    >
                      <div className="h-[240px] bg-gray-200/60 dark:bg-[#1e293b]/60 animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-6 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/3" />
                        <div className="h-4 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/2" />
                        <div className="border-t border-[#d5deeF]/40 dark:border-[#1e293b]/60 pt-4 flex justify-between">
                          <div className="h-7 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/3" />
                          <div className="h-10 w-24 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-xl animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-[#1e293b]/60 mb-6 shadow-sm">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-[#64748b]">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-[#94A3B8] text-lg font-medium">{t("vehicles.no_results")}</p>
                  <p className="text-gray-400 dark:text-[#64748b] text-sm mt-2">Essayez de modifier vos filtres</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                  {filteredVehicles.map((v, idx) => {
                    const picturePath = v.pictures?.[0]?.path;
                    const isNew = idx < NEW_COUNT;

                    return (
                      <motion.div
                        key={v.id}
                        ref={(el) => { cardsRef.current[idx] = el; }}
                        initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={prefersReducedMotion ? {} : { y: -8, boxShadow: "0 25px 60px rgba(31,66,118,0.15)" }}
                        onClick={() => router.push(`/vehicules/${v.id}`)}
                        className="group bg-white dark:bg-[#0f1729] rounded-[18px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-100/80 dark:border-[#1e293b]/60 hover:shadow-[0_12px_40px_rgba(31,66,118,0.08)] dark:hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer relative flex flex-col transition-all duration-300"
                        style={{ contentVisibility: 'auto', contain: 'layout style paint' }}
                      >
                        {/* Shimmer border overlay on hover */}
                        <div className="absolute inset-0 rounded-[18px] p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" style={{
                          background: 'linear-gradient(135deg, transparent, #f39c12, #1f4276, transparent)',
                          backgroundSize: '300% 300%',
                          animation: 'border-shimmer 3s ease infinite',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }} />

                        <LazyVehicleImage
                          picturePath={picturePath}
                          className="h-[260px] bg-cover bg-center relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: picturePath
                                ? `url(${vehicleImageUrl(picturePath)})`
                                : undefined,
                            }}
                            whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-[#0f1729]/95 via-transparent to-transparent pointer-events-none" />

                          <div className="flex gap-2 absolute top-4 right-4 z-10">
                            {isNew && (
                              <motion.span
                                initial={prefersReducedMotion ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: idx * 0.06 + 0.2, type: "spring", stiffness: 300 }}
                                className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold shadow-[0_4px_10px_rgba(34,197,94,0.3)]"
                              >
                                {t("vehicles.new_badge")}
                              </motion.span>
                            )}
                            <motion.span
                              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.06 + 0.3, type: "spring", stiffness: 300 }}
                              className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#1e293b]/90 backdrop-blur-sm text-gray-500 dark:text-[#94A3B8] text-[10px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-gray-100/60 dark:border-transparent"
                            >
                              {t("vehicles.available_badge")}
                            </motion.span>
                          </div>

                          <div className="absolute bottom-4 left-4 z-10">
                            <motion.div
                              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06 + 0.3 }}
                              className="bg-white/95 dark:bg-[#1e293b]/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/60 dark:border-transparent"
                            >
                              <span className="text-[18px] font-extrabold text-[#1f4276] dark:text-[#f39c12]">{v.pricePerDay.toLocaleString()} DH</span>
                            </motion.div>
                          </div>

                          <motion.div
                            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-[2px] rounded-2xl px-6 py-3 border border-white/20 dark:border-white/10">
                              <span className="text-white text-sm font-bold tracking-wider flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                </svg>
                                Voir d&eacute;tails
                              </span>
                            </div>
                          </motion.div>
                        </LazyVehicleImage>

                        <motion.div
                          className="p-6 relative z-10 flex flex-col flex-1 overflow-hidden"
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: idx * 0.06 + 0.15 }}
                        >
                          {/* Brand watermark background */}
                          {marqueImg(v.marque) && (
                            <Image
                              src={marqueImg(v.marque)!}
                              alt=""
                              width={220}
                              height={220}
                              className="absolute -bottom-6 -right-6 w-[180px] h-[180px] opacity-[0.08] -rotate-[15deg] pointer-events-none select-none z-0"
                              draggable={true}
                              priority={true}
                              unoptimized
                            />
                          )}
                          <div className="flex items-center gap-2 relative z-10">
                            {marqueImg(v.marque) ? (
                              <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-[#1f4276] flex items-center justify-center p-1.5 shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-sm ring-1 ring-gray-100 dark:ring-transparent">
                                <Image
                                  src={marqueImg(v.marque)!}
                                  alt={v.marque}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-contain"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <span className="text-[18px] font-bold text-[#1f4276] dark:text-[#D5DEEF] shrink-0">{v.marque}</span>
                            )}
                            <h3 className="text-[22px] font-extrabold text-[#1f4276] dark:text-[#D5DEEF] leading-tight transition-colors duration-300 group-hover:text-[#f39c12]">
                              {v.model}
                            </h3>
                          </div>
                          <p className="mt-1 text-[13px] text-gray-400 dark:text-[#94A3B8]">
                            {v.year} &bull; {t("vehicles.automatic")}
                          </p>
                          <div className="flex items-center gap-2 mt-4 text-[13px] text-gray-600 dark:text-[#94A3B8] flex-wrap flex-1">
                            <span className="flex items-center gap-1.5 bg-blue-50/60 dark:bg-[#1e293b]/80 text-blue-700 dark:text-[#94A3B8] px-3 py-1.5 rounded-lg text-[13px] border border-blue-100/60 dark:border-transparent">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 dark:text-[#94A3B8]">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              {v.Occupants} {t("vehicles.seats")}
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-50/60 dark:bg-[#1e293b]/80 text-amber-700 dark:text-[#94A3B8] px-3 py-1.5 rounded-lg text-[13px] border border-amber-100/60 dark:border-transparent">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 dark:text-[#94A3B8]">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                              </svg>
                              {v.fuelType}
                            </span>
                            {!!v.air_conditioner && (
                              <span className="flex items-center gap-1.5 bg-sky-50/60 dark:bg-[#1e293b]/80 text-sky-700 dark:text-[#94A3B8] px-3 py-1.5 rounded-lg text-[13px] border border-sky-100/60 dark:border-transparent">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500 dark:text-[#94A3B8]">
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                {t("vehicles.air_conditioner")}
                              </span>
                            )}
                            {!!v.gps && (
                              <span className="flex items-center gap-1.5 bg-violet-50/60 dark:bg-[#1e293b]/80 text-violet-700 dark:text-[#94A3B8] px-3 py-1.5 rounded-lg text-[13px] border border-violet-100/60 dark:border-transparent">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500 dark:text-[#94A3B8]">
                                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                GPS
                              </span>
                            )}
                          </div>

                          <motion.div
                            className="mt-4 border-t border-gray-100/80 dark:border-[#1e293b]/80 pt-4 flex items-center justify-between relative overflow-hidden"
                          >
                            <motion.div
                              className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#f39c12] to-[#e67e22]"
                              initial={prefersReducedMotion ? { width: '100%' } : { width: '0%' }}
                              whileHover={{ width: '100%' }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                            <motion.button
                              whileHover={prefersReducedMotion ? {} : { scale: 1.06, boxShadow: "0 8px 20px rgba(243,156,18,0.3)" }}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/vehicules/${v.id}`);
                              }}
                              className="relative overflow-hidden h-10 px-6 rounded-xl bg-gradient-to-r from-[#f39c12] to-[#e67e22] text-white dark:text-[#0f1729] text-[13px] font-bold tracking-wide transition-all duration-300 shadow-[0_4px_12px_rgba(243,156,18,0.2)] dark:shadow-[0_4px_12px_rgba(243,156,18,0.3)] hover:shadow-[0_8px_25px_rgba(243,156,18,0.35)] shimmer-btn"
                            >
                              <span className="relative z-10">{t("vehicles.book_button")}</span>
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
