"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { listVehicles, fetchCategories, filterVehicles } from "@/lib/vehiclesApi";
import type { Vehicle, Category, Marque, Country, City } from "@/lib/types";
import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getBrandLogo } from "@/lib/brandLogos";
import { getPublicMarques } from "@/lib/marquesApi";
import { fetchCountries, fetchCitiesByCountry } from "@/lib/locationApi";
import Image from "next/image";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, PAGE_DESCRIPTIONS, SITE_URL } from "@/lib/seo";

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
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({
    title: PAGE_TITLES.vehicules[typedLocale] || PAGE_TITLES.vehicules.fr,
    description: PAGE_DESCRIPTIONS.vehicules[typedLocale] || PAGE_DESCRIPTIONS.vehicules.fr,
  });
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

  const [countries, setCountries] = useState<Country[]>([]);
  const [filterCountryId, setFilterCountryId] = useState<number | null>(null);
  const [filterCities, setFilterCities] = useState<City[]>([]);
  const [filterCityId, setFilterCityId] = useState<number | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadVehicles = useCallback(async (pickup?: string, ret?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (pickup) params.pickup_date = pickup;
      if (ret) params.return_date = ret;
      if (filterCountryId) params.country_id = filterCountryId;
      if (filterCityId) params.city_id = filterCityId;
      const hasFilters = pickup || ret || filterCountryId || filterCityId;
      const data = hasFilters
        ? await filterVehicles(params as any)
        : await listVehicles();
      setVehicles(data);
    } catch (e) {
      const msg = (e as { message?: string })?.message || t("vehicles.error_load");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t, filterCountryId, filterCityId]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    getPublicMarques().then(setMarques);
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (filterCountryId) {
      fetchCitiesByCountry(filterCountryId).then(setFilterCities).catch(() => setFilterCities([]));
    } else {
      setFilterCities([]);
    }
    setFilterCityId(null);
  }, [filterCountryId]);

  // Read URL search params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pu = params.get("pickup_date");
    const rt = params.get("return_date");
    const mq = params.get("marque");
    const md = params.get("model");
    const minP = params.get("min_price");
    const maxP = params.get("max_price");
    const ci = params.get("country_id");
    const cti = params.get("city_id");
    if (pu) setPickupDate(pu);
    if (rt) setReturnDate(rt);
    const searchParts: string[] = [];
    if (mq) searchParts.push(mq);
    if (md) searchParts.push(md);
    if (searchParts.length > 0) setSearchText(searchParts.join(" "));
    if (minP) setMinPrice(Number(minP));
    if (maxP) setMaxPrice(Number(maxP));
    if (ci) setFilterCountryId(Number(ci));
    if (cti) setFilterCityId(Number(cti));

    const id = setTimeout(() => { void loadVehicles(pu ?? undefined, rt ?? undefined); }, 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when dates change
  useEffect(() => {
    const id = setTimeout(() => { void loadVehicles(pickupDate, returnDate); }, 300);
    return () => clearTimeout(id);
  }, [pickupDate, returnDate, loadVehicles]);

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
    setFilterCountryId(null);
    setFilterCityId(null);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
    selectedFuelTypes.length > 0 || minPrice !== undefined || maxPrice !== undefined ||
    selectedSeats.length > 0 || pickupDate || returnDate || searchText ||
    filterCountryId !== null || filterCityId !== null;

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

      if (filterCountryId !== null && v.country_id !== filterCountryId) return false;
      if (filterCityId !== null && v.city_id !== filterCityId) return false;

      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [vehicles, searchText, selectedCategories, selectedBrands, selectedFuelTypes, selectedSeats, minPrice, maxPrice, filterCountryId, filterCityId]);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);

  // Use event delegation on the cards container – no re-registration needed on filter changes
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    let ticking = false;
    const onMove = (e: MouseEvent) => {
      const card = (e.target as Element).closest<HTMLDivElement>('[data-tilt]');
      if (!card) return;
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
    const onLeave = (e: MouseEvent) => {
      const card = (e.target as Element).closest<HTMLDivElement>('[data-tilt]');
      if (card) card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave, true);
    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave, true);
    };
  }, []); // ← empty: only runs once, no re-registration on filter changes


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

      {/* Country / City */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.country")}
        </h4>
        <select
          value={filterCountryId ?? ""}
          onChange={(e) => setFilterCountryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF]"
        >
          <option value="">{t("vehicles.all_types")}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-[#94A3B8] mb-1.5">
          {t("vehicles.city")}
        </h4>
        <select
          value={filterCityId ?? ""}
          onChange={(e) => setFilterCityId(e.target.value ? Number(e.target.value) : null)}
          disabled={!filterCountryId}
          className="w-full h-[42px] bg-gray-50 dark:bg-[#1e293b]/60 border border-gray-200 dark:border-[#1e293b]/80 rounded-xl px-3 outline-none text-[14px] text-gray-700 dark:text-[#D5DEEF] disabled:opacity-50"
        >
          <option value="">{t("vehicles.all_types")}</option>
          {filterCities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
    <div className="bg-gray-50/50 dark:bg-[#070b14] transition-colors duration-500">
      <JsonLd
        id="ld-breadcrumb-vehicules"
        data={breadcrumbLD([
          { name: "CARFORFAR", url: SITE_URL },
          { name: "Véhicules", url: `${SITE_URL}/vehicules` },
        ])}
      />
      {/* Hero */}
        <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[320px] sm:min-h-[380px] flex items-center">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80)` }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f4276]/95 via-[#2d5a8e]/80 to-[#395886]/50 dark:from-[#050a14]/98 dark:via-[#0a1628]/95 dark:to-[#0d1b3e]/85" />

          {/* Animated gradient accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent bg-[length:200%_200%] animate-[gradient-shift_12s_ease_infinite] pointer-events-none" />

          {/* Floating glowing orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-[float-slow_12s_ease-in-out_infinite]" />
            <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-[float-slow_16s_ease-in-out_infinite_reverse]" />
            <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-cyan-400/[0.08] dark:bg-cyan-500/[0.04] rounded-full blur-3xl animate-[float-slow_20s_ease-in-out_infinite]" />
            <div className="absolute top-[60%] left-[10%] w-48 h-48 bg-violet-400/15 dark:bg-violet-500/8 rounded-full blur-3xl animate-[float-drift-alt_14s_ease-in-out_infinite]" />
            <div className="absolute top-[5%] left-[40%] w-36 h-36 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-[float-drift-alt_11s_ease-in-out_infinite_reverse]" />
          </div>

          {/* Pulse rings */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-[20%] left-[15%] w-32 h-32 border border-white/10 rounded-full animate-[ring-expand_4s_ease-out_infinite]" />
            <div className="absolute top-[20%] left-[15%] w-32 h-32 border border-white/10 rounded-full animate-[ring-expand_4s_ease-out_infinite_1.5s]" />
            <div className="absolute top-[65%] right-[20%] w-24 h-24 border border-white/10 rounded-full animate-[ring-expand_5s_ease-out_infinite_0.8s]" />
            <div className="absolute top-[65%] right-[20%] w-24 h-24 border border-white/10 rounded-full animate-[ring-expand_5s_ease-out_infinite_2.5s]" />
          </div>

          {/* Twinkling stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-[15%] left-[8%] w-[3px] h-[3px] bg-white/40 rounded-full animate-[twinkle_3s_ease-in-out_infinite_0s]" />
            <div className="absolute top-[28%] left-[88%] w-[2px] h-[2px] bg-white/30 rounded-full animate-[twinkle_4s_ease-in-out_infinite_1.2s]" />
            <div className="absolute top-[55%] left-[4%] w-[3px] h-[3px] bg-white/35 rounded-full animate-[twinkle_3.5s_ease-in-out_infinite_0.6s]" />
            <div className="absolute top-[72%] left-[78%] w-[2px] h-[2px] bg-white/25 rounded-full animate-[twinkle_5s_ease-in-out_infinite_2s]" />
            <div className="absolute top-[42%] left-[50%] w-[4px] h-[4px] bg-white/20 rounded-full animate-[twinkle_4.5s_ease-in-out_infinite_1.8s]" />
            <div className="absolute top-[82%] left-[25%] w-[2px] h-[2px] bg-white/30 rounded-full animate-[twinkle_3.2s_ease-in-out_infinite_2.8s]" />
            <div className="absolute top-[10%] left-[65%] w-[3px] h-[3px] bg-white/25 rounded-full animate-[twinkle_4.2s_ease-in-out_infinite_0.9s]" />
            <div className="absolute top-[62%] left-[60%] w-[2px] h-[2px] bg-white/20 rounded-full animate-[twinkle_3.8s_ease-in-out_infinite_3.2s]" />
            <div className="absolute top-[35%] left-[20%] w-[5px] h-[5px] bg-white/15 rounded-full animate-[twinkle_6s_ease-in-out_infinite_4s]" />
            <div className="absolute top-[50%] left-[75%] w-[3px] h-[3px] bg-white/20 rounded-full animate-[twinkle_3s_ease-in-out_infinite_4.5s]" />
            <div className="absolute top-[75%] left-[45%] w-[2px] h-[2px] bg-white/35 rounded-full animate-[twinkle_5.5s_ease-in-out_infinite_3.5s]" />
          </div>

          {/* Floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="absolute top-[25%] left-[12%] w-6 h-6 border border-white/10 animate-[rotate-slow_20s_linear_infinite] rounded-sm"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
            <div
              className="absolute top-[70%] left-[85%] w-8 h-8 border border-white/10 animate-[rotate-slow_25s_linear_infinite_reverse]"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
            <div
              className="absolute top-[40%] left-[55%] w-4 h-4 bg-white/10 animate-[float-drift-alt_18s_ease-in-out_infinite]"
              style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
            />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Noise texture */}
          <div className="absolute inset-0 noise-bg opacity-50 pointer-events-none" />

          {/* Driving car silhouette */}
          <div className="absolute bottom-3 left-0 right-0 h-8 overflow-hidden pointer-events-none opacity-[0.07] dark:opacity-[0.1]" aria-hidden="true">
            <svg className="absolute bottom-0 animate-[car-drive_14s_linear_infinite]" width="96" height="32" viewBox="0 0 96 32" fill="white">
              <path d="M12 24H0v-5l5-7h10l7-7h30l10 7h16l5 5v7H12zm5-5h66v-3H17v3zm5-10l-5 7h66l-5-7H22zM20 26a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM72 26a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Content */}
          <div className="relative z-10 w-full">
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-white/15 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-[glow-pulse_2s_ease-in-out_infinite]" />
                  {t("vehicles.featured_subtitle")}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.02em] text-white"
              >
                {t("vehicles.page_title")}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-4 text-base md:text-lg text-white/70 max-w-xl leading-relaxed"
              >
                {t("vehicles.featured_subtitle")}
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="origin-left mt-6 h-1 w-20 bg-gradient-to-r from-[#f39c12] to-transparent rounded-full"
              />
            </div>
          </div>
        </section>

        {/* Main layout */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-7">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                       className="bg-white dark:bg-[#0f1729] rounded-[18px] overflow-hidden border border-gray-100/60 dark:border-[#1e293b]/60"
                    >
                      <div className="h-[200px] sm:h-[240px] bg-gray-200/60 dark:bg-[#1e293b]/60 animate-pulse" />
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
                <div ref={cardsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-7">
                  {filteredVehicles.map((v, idx) => {
                    const picturePath = v.pictures?.[0]?.path;
                    const isNew = idx < NEW_COUNT;

                    return (
                      <motion.div
                        key={v.id}
                        data-tilt
                        initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
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
                          className="h-[200px] sm:h-[240px] lg:h-[260px] bg-cover bg-center relative overflow-hidden"
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
                              draggable={false}
                              priority={false}
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
  );
}
