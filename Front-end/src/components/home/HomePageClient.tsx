"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import type { Vehicle, Marque, Country, City, CityLocation } from "@/lib/types";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { getBrandLogo } from "@/lib/brandLogos";
import Image from "next/image";
import { Search, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useSettings } from "@/lib/SettingsContext";
import { toLocalDateString } from "@/lib/dateUtils";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { fetchCountries, fetchCitiesByCountry } from "@/lib/locationApi";
import { fetchCategories, filterVehicles } from "@/lib/vehiclesApi";
import type { Category } from "@/lib/types";
import { VerticalImageStack } from "@/components/ui/vertical-image-stack";


const MapSection = dynamic(() => import("@/components/HomeMap"), { ssr: false });
const LazyVehiclesMarquee = dynamic(() => import("@/components/home/VehiclesMarqueeSection"), { ssr: false, loading: () => <div className="h-96 bg-[#F3F3F3] dark:bg-[#070b14] animate-pulse" /> });
const LazyAtmosphericMist = dynamic(() => import("@/components/home/AtmosphericMist"), { ssr: false });
const LazyMarquesSection = dynamic(() => import("@/components/home/MarquesSection"), { ssr: false, loading: () => <div className="h-64 bg-white dark:bg-[#070b14] animate-pulse" /> });
const LazyServicesSection = dynamic(() => import("@/components/home/ServicesSection"), { ssr: false, loading: () => <div className="h-96 bg-[#F0F3FA] dark:bg-[#070b14] animate-pulse" /> });
const LazyHowItWorksSection = dynamic(() => import("@/components/home/HowItWorksSection"), { ssr: false, loading: () => <div className="h-96 bg-white dark:bg-[#0b1121] animate-pulse" /> });
const LazyStatsSection = dynamic(() => import("@/components/home/StatsSection"), { ssr: false, loading: () => <div className="h-48 bg-[#395886] dark:bg-[#0b1121] animate-pulse" /> });
const LazyCTASection = dynamic(() => import("@/components/home/CTASection"), { ssr: false, loading: () => <div className="h-64 bg-[#D5DEEF] dark:bg-[#0b1121] animate-pulse" /> });
const LazyAboutSection = dynamic(() => import("@/components/home/AboutSection"), { ssr: false, loading: () => <div className="h-96 bg-[#f7f7fa] dark:bg-[#0b1121] animate-pulse" /> });

const countryFlags: Record<string, string> = {
  "Maroc": "🇲🇦",
  "France": "🇫🇷",
  "Espagne": "🇪🇸",
  "Algérie": "🇩🇿",
  "Tunisie": "🇹🇳",
  "États-Unis": "🇺🇸",
  "Royaume-Uni": "🇬🇧",
  "Allemagne": "🇩🇪",
  "Italie": "🇮🇹",
  "Belgique": "🇧🇪",
  "Pays-Bas": "🇳🇱",
  "Portugal": "🇵🇹",
  "Suisse": "🇨🇭",
  "Canada": "🇨🇦",
};

function getCountryFlag(name: string): string {
  return countryFlags[name] || "🌍";
}

const cars = Array.from({ length: 6 }, (_, i) => `/background_vehicles/bg${`0${i + 1}`.slice(-2)}.webp`);


function HeroSection({ vehicles: showcaseVehicles, marques: propMarques = [] }: { vehicles?: Vehicle[]; marques?: Marque[] }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(true);
  const { t } = useI18n();

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [catCarouselPage, setCatCarouselPage] = useState(0);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filterCountryId, setFilterCountryId] = useState<number | null>(null);
  const [filterCities, setFilterCities] = useState<City[]>([]);
  const [filterCityId, setFilterCityId] = useState<number | null>(null);
  const [filterLocationType, setFilterLocationType] = useState("");

  const [returnCountryId, setReturnCountryId] = useState<number | null>(null);
  const [returnCities, setReturnCities] = useState<City[]>([]);
  const [returnCityId, setReturnCityId] = useState<number | null>(null);
  const [returnLocationType, setReturnLocationType] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdownId(prev => prev === id ? null : id);
  }, []);
  const closeDropdown = useCallback(() => setOpenDropdownId(null), []);
  const [confirmData, setConfirmData] = useState<{ type: string; name: string; price: number } | null>(null);

  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [heroNextBgIndex, setHeroNextBgIndex] = useState<number | null>(null);
  const [heroBgFading, setHeroBgFading] = useState(false);
  const displayVehicles = useMemo(() => showcaseVehicles?.slice(0, 5) ?? [], [showcaseVehicles]);

  const brandModels = useMemo(() => {
    if (!brand || !showcaseVehicles) return [];
    const models = new Set<string>();
    for (const v of showcaseVehicles) {
      if (v.marque === brand && v.model) models.add(v.model);
    }
    return Array.from(models).sort();
  }, [brand, showcaseVehicles]);

  const [vehicleType, setVehicleType] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [noResults, setNoResults] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLocationVal, setPickupLocationVal] = useState("");
  const [returnLocationVal, setReturnLocationVal] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");


  const locations = useMemo(() => {
    const result: { value: string; label: string; icon: string; key: string }[] = [];
    let targetCities: { id: number; name: string; country_id: number; locations?: CityLocation[] }[] = [];

    if (filterCityId) {
      const allCities = countries.flatMap(c => c.cities || []);
      const selected = allCities.find(c => c.id === filterCityId);
      if (selected) targetCities = [selected];
    } else if (filterCountryId) {
      const country = countries.find(c => c.id === filterCountryId);
      if (country) targetCities = country.cities || [];
    } else {
      targetCities = countries.flatMap(c => c.cities || []);
    }

    for (const city of targetCities) {
      if (city.locations && city.locations.length > 0) {
        for (const loc of city.locations) {
            result.push({
            key: `city-${city.id}-loc-${loc.id}`,
            value: loc.name,
            label: loc.name,
            icon: loc.type === "airport" ? "plane" : "city",
          });
        }
      } else {
        result.push({
          key: `city-${city.id}-default`,
          value: `${city.name} Centre Ville`,
          label: `${city.name} Centre Ville`,
          icon: "city",
        });
      }
    }
    return result;
  }, [countries, filterCountryId, filterCityId]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const categoryIcons: Record<string, string> = {
    economy: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    standard: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    suv: "M1 16V7a2 2 0 012-2h11.86a4 4 0 013.328 1.781L21 11a2 2 0 012 2v3h-2a3 3 0 11-6 0H8a3 3 0 11-6 0H1zm7-9h5v4H8V7zM6 7H3v4h3V7zm9 4V7.005a2 2 0 011.523.886L18.596 11H15zM4 16a1 1 0 102 0 1 1 0 00-2 0zm13 0a1 1 0 102 0 1 1 0 00-2 0z",
    premium: "M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4-6.2-4.5h7.6z",
    luxury: "M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4-6.2-4.5h7.6z",
  };

  function getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("suv")) return categoryIcons.suv;
    if (lower.includes("premium") || lower.includes("luxe") || lower.includes("luxury")) return categoryIcons.premium;
    if (lower.includes("van")) return "M1 16V7a2 2 0 012-2h11.86a4 4 0 013.328 1.781L21 11a2 2 0 012 2v3h-2a3 3 0 11-6 0H8a3 3 0 11-6 0H1zm7-9h5v4H8V7zM6 7H3v4h3V7zm9 4V7.005a2 2 0 011.523.886L18.596 11H15zM4 16a1 1 0 102 0 1 1 0 00-2 0zm13 0a1 1 0 102 0 1 1 0 00-2 0z";
    return categoryIcons.economy;
  }

  useEffect(() => {
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

  useEffect(() => {
    setModel("");
  }, [brand]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdownId(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const city = filterCityId ? filterCities.find(c => c.id === filterCityId) : null;
    if (city && filterLocationType && city.locations) {
      const loc = city.locations.find(l => l.type === filterLocationType);
      if (loc) {
        setPickupLocation(loc.name);
        setPickupLocationVal(loc.name);
        return;
      }
    }
    setPickupLocation("");
    setPickupLocationVal("");
  }, [filterCityId, filterLocationType, filterCities]);

  useEffect(() => {
    if (returnCountryId) {
      fetchCitiesByCountry(returnCountryId).then(setReturnCities).catch(() => setReturnCities([]));
    } else {
      setReturnCities([]);
    }
    setReturnCityId(null);
  }, [returnCountryId]);

  useEffect(() => {
    const city = returnCityId ? returnCities.find(c => c.id === returnCityId) : null;
    if (city && returnLocationType && city.locations) {
      const loc = city.locations.find(l => l.type === returnLocationType);
      if (loc) {
        setReturnLocation(loc.name);
        setReturnLocationVal(loc.name);
        return;
      }
    }
    setReturnLocation("");
    setReturnLocationVal("");
  }, [returnCityId, returnLocationType, returnCities]);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (heroBgIndex + 1) % cars.length;
      setHeroNextBgIndex(next);
      setHeroBgFading(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeroBgFading(true);
        });
      });
      setTimeout(() => {
        setHeroBgIndex(next);
        setHeroNextBgIndex(null);
        setHeroBgFading(false);
      }, 2000);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBgIndex]);

  function handleReturnLocationSelect(type: string, name: string, price?: number | null) {
    setOpenDropdownId(null);
    if (price && Number(price) > 0) {
      setConfirmData({ type, name, price: Number(price) });
      setConfirmOpen(true);
    } else {
      setReturnLocationType(type);
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setNoResults(false);
    try {
      const results = await filterVehicles({
        marque: brand.trim() || undefined,
        model: model.trim() || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        min_price: minPrice,
        max_price: maxPrice,
        current_country_id: filterCountryId ?? undefined,
        current_city_id: filterCityId ?? undefined,
        location_type: filterLocationType || undefined,
      });
      if (!results || results.length === 0) {
        setNoResults(true);
        return;
      }
      if (vehicleType) {
        const cat = categories.find(c => c.id === vehicleType);
        if (cat && !results.some(v => v.category?.name === cat.name)) {
          setNoResults(true);
          return;
        }
      }
    } catch {
      setNoResults(true);
      return;
    }
    const params = new URLSearchParams();
    if (pickupLocationVal) params.set("pickup_location", pickupLocationVal);
    if (returnLocationVal) params.set("dropoff_location", returnLocationVal);
    if (pickupDate) params.set("start_date", pickupDate);
    if (pickupTime) params.set("pickup_time", pickupTime);
    if (returnDate) params.set("end_date", returnDate);
    if (returnTime) params.set("dropoff_time", returnTime);
    if (vehicleType) { const cat = categories.find(c => c.id === vehicleType); if (cat) params.set("category_name", cat.name); }
    if (brand.trim()) params.set("marque", brand.trim());
    if (model.trim()) params.set("model", model.trim());
    if (minPrice !== undefined) params.set("min_price", String(minPrice));
    if (maxPrice !== undefined) params.set("max_price", String(maxPrice));
    if (fuelType) params.set("fuel_type", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (filterCountryId) params.set("current_country_id", String(filterCountryId));
    if (filterCityId) params.set("current_city_id", String(filterCityId));
    if (filterLocationType) params.set("location_type", filterLocationType);
    const returnInfo: { returnCountryId?: number | null; returnCityId?: number | null; returnLocationType?: string } = {};
    if (returnCountryId) returnInfo.returnCountryId = returnCountryId;
    if (returnCityId) returnInfo.returnCityId = returnCityId;
    if (returnLocationType) returnInfo.returnLocationType = returnLocationType;
    if (Object.keys(returnInfo).length > 0) {
      try { localStorage.setItem("homeReturnLocation", JSON.stringify(returnInfo)); } catch {}
    } else {
      try { localStorage.removeItem("homeReturnLocation"); } catch {}
    }
    const qs = params.toString();
    router.push(qs ? `/vehicules?${qs}` : "/vehicules");
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cars[heroBgIndex]})` }}
        />
        {heroNextBgIndex !== null && (
          <div
            key={heroNextBgIndex}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2000ms] ease-in-out"
            style={{
              backgroundImage: `url(${cars[heroNextBgIndex]})`,
              opacity: heroBgFading ? 1 : 0,
            }}
        />
      )}
      </div>
      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-24">
          {/* Headline */}
          <div className="mb-8">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-4 sm:px-8 sm:py-5 inline-block">
              <m.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-bebas tracking-widest leading-none text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] text-[#FF7B00]"
              >
                <div>{t("home.hero.title1")}</div>
                <div className="text-[#FF7B00]">{t("home.hero.title2")}</div>
              </m.h1>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
              {/* Left: badge + search form */}
              <div className="flex-1 min-w-0">
              {/* Badge */}
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <span className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F39C12]" />
                  {t("home.badge")}
                </span>
              </m.div>

              {/* Search form */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <form onSubmit={handleSearch} className="hero-search-form bg-black backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]">
                  {/* Row 1: Country + City */}
                  <div className="filter-grid grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.country")}</label>
                      <Popover open={openDropdownId === "pickup-country"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "pickup-country" : null)}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {filterCountryId ? (
                              <><span className="text-lg">{getCountryFlag(countries.find(c => c.id === filterCountryId)?.name ?? "")}</span><span className="font-medium text-white">{countries.find(c => c.id === filterCountryId)?.name}</span></>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(280px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setFilterCountryId(null); setFilterCityId(null); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {countries.map(c => (
                            <button key={c.id} type="button" onClick={() => { setFilterCountryId(c.id); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${filterCountryId === c.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="text-lg">{getCountryFlag(c.name)}</span>
                              <span className="font-medium">{c.name}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.city")}</label>
                      <Popover open={openDropdownId === "pickup-city"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "pickup-city" : null)}>
                        <PopoverTrigger className="w-full" disabled={!filterCountryId}>
                          <div className={`w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40 ${!filterCountryId ? "opacity-50 pointer-events-none" : ""}`}>
                            {filterCityId ? (
                              <span className="font-medium text-white">{filterCities.find(c => c.id === filterCityId)?.name}</span>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(280px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setFilterCityId(null); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {filterCities.map(c => (
                            <button key={c.id} type="button" onClick={() => { setFilterCityId(c.id); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${filterCityId === c.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{c.name}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Row 2: Pickup Location */}
                  <div className="mb-3">
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.pickup_location")}</label>
                    <Popover open={openDropdownId === "pickup-loc"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "pickup-loc" : null)}>
                      <PopoverTrigger className="w-full" disabled={!filterCityId}>
                        <div className={`w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40 ${!filterCityId ? "opacity-50 pointer-events-none" : ""}`}>
                          {pickupLocation ? (
                            <><span className="font-medium text-white">{pickupLocation}</span></>
                          ) : (
                            <span className="text-white/40">{t("vehicles.all_types")}</span>
                          )}
                        </div>
                      </PopoverTrigger>
                       <PopoverContent align="start" sideOffset={4} className="w-[min(320px,calc(100vw-3rem))] p-3 max-h-96 overflow-y-auto">
                         <button type="button" onClick={() => { setFilterLocationType(""); setOpenDropdownId(null); }} className="w-full flex items-center gap-4 px-5 py-4 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                           <span>{t("vehicles.all_types")}</span>
                         </button>
                         {(() => {
                           const city = filterCityId ? filterCities.find(c => c.id === filterCityId) : null;
                          const locs = city?.locations?.length ? city.locations : null;
                          if (locs) {
                            return locs.map(loc => (
                              <button key={loc.id} type="button" onClick={() => { setFilterLocationType(loc.type); setOpenDropdownId(null); }} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${filterLocationType === loc.type ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${loc.type === "airport" ? "bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/5" : "bg-gradient-to-br from-blue-500/20 to-blue-500/5"}`}>
                                  {loc.type === "airport" ? (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#F39C12" className="opacity-90"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                  ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" className="opacity-90"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{loc.name}</span>
                                  <span className="text-xs text-white/40">{loc.type === "airport" ? "Prise en charge à l'aéroport" : "Prise en charge en centre-ville"}</span>
                                </div>
                              </button>
                            ));
                          }
                          return (
                            <>
                              <button type="button" onClick={() => { setFilterLocationType("airport"); setOpenDropdownId(null); }} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${filterLocationType === "airport" ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/5 flex items-center justify-center shrink-0">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F39C12" className="opacity-90"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{t("vehicles.location_airport")}</span>
                                  <span className="text-xs text-white/40">Prise en charge à l'aéroport</span>
                                </div>
                              </button>
                              <button type="button" onClick={() => { setFilterLocationType("citycenter"); setOpenDropdownId(null); }} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${filterLocationType === "citycenter" ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shrink-0">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" className="opacity-90"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{t("vehicles.location_citycenter")}</span>
                                  <span className="text-xs text-white/40">Prise en charge en centre-ville</span>
                                </div>
                              </button>
                            </>
                          );
                        })()}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Row 3: Dates */}
                  <div className="mb-3">
                    <input type="hidden" name="pickup_location" value={pickupLocationVal} />
                    <input type="hidden" name="dropoff_location" value={returnLocationVal} />
                    <div className="date-time-row flex flex-col sm:flex-row items-stretch gap-2">
                      {/* Pickup Date + Time joined */}
                      <div className="date-time-composite flex-1 min-w-0 flex items-stretch bg-white/15 border border-white/20 rounded-xl overflow-hidden">
                        <Popover open={openDropdownId === "pickup-date"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "pickup-date" : null)}>
                          <PopoverTrigger className="flex-1 min-w-0">
                            <span className="block w-full bg-transparent px-3 py-2.5 text-sm text-white text-left leading-normal">
                              {pickupDate ? new Date(pickupDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : <span className="text-white/40">Date</span>}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <Calendar size="lg" mode="single" className="pickup-calendar" selected={pickupDate ? new Date(pickupDate + "T00:00:00") : undefined} onSelect={(d: Date | undefined) => { if (d) { const val = toLocalDateString(d); setPickupDate(val); if (returnDate && returnDate < val) setReturnDate(""); setOpenDropdownId(null); } }} disabled={{ before: new Date() }} />
                          </PopoverContent>
                        </Popover>
                        <div className="w-px bg-white/10 self-stretch" />
                        <input type="time" name="pickup_time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-20 bg-transparent px-2 py-2.5 text-sm text-white outline-none border-none text-center cursor-pointer [color-scheme:dark]" />
                      </div>

                      <span className="hidden sm:flex items-center text-white/15 text-lg select-none">-</span>

                      {/* Return Date + Time joined */}
                      <div className="date-time-composite flex-1 min-w-0 flex items-stretch bg-white/15 border border-white/20 rounded-xl overflow-hidden">
                        <Popover open={openDropdownId === "return-date"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "return-date" : null)}>
                          <PopoverTrigger className={`flex-1 min-w-0 ${!pickupDate ? "pointer-events-none" : ""}`} disabled={!pickupDate}>
                            <span className={`block w-full bg-transparent px-3 py-2.5 text-sm text-left leading-normal ${!pickupDate ? "text-white/40" : "text-white"}`}>
                              {returnDate ? new Date(returnDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : <span className="text-white/40">{!pickupDate ? "Choisir d'abord" : "Date"}</span>}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <Calendar size="lg" mode="single" selected={returnDate ? new Date(returnDate + "T00:00:00") : undefined} onSelect={(d: Date | undefined) => { if (d) { setReturnDate(toLocalDateString(d)); setOpenDropdownId(null); } }} disabled={pickupDate ? (() => { const d = new Date(pickupDate + "T00:00:00"); d.setDate(d.getDate() + 1); return { before: d }; })() : undefined} />
                          </PopoverContent>
                        </Popover>
                        <div className="w-px bg-white/10 self-stretch" />
                        <input type="time" name="dropoff_time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="w-20 bg-transparent px-2 py-2.5 text-sm text-white outline-none border-none text-center cursor-pointer [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Return Country + City */}
                  <div className="filter-grid grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.return_country") || "Pays de restitution"}</label>
                      <Popover open={openDropdownId === "return-country"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "return-country" : null)}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {returnCountryId ? (
                              <><span className="text-lg">{getCountryFlag(countries.find(c => c.id === returnCountryId)?.name ?? "")}</span><span className="font-medium text-white">{countries.find(c => c.id === returnCountryId)?.name}</span></>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(280px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setReturnCountryId(null); setReturnCityId(null); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {countries.map(c => (
                            <button key={c.id} type="button" onClick={() => { setReturnCountryId(c.id); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${returnCountryId === c.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="text-lg">{getCountryFlag(c.name)}</span>
                              <span className="font-medium">{c.name}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.return_city") || "Ville de restitution"}</label>
                      <Popover open={openDropdownId === "return-city"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "return-city" : null)}>
                        <PopoverTrigger className="w-full" disabled={!returnCountryId}>
                          <div className={`w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40 ${!returnCountryId ? "opacity-50 pointer-events-none" : ""}`}>
                            {returnCityId ? (
                              <span className="font-medium text-white">{returnCities.find(c => c.id === returnCityId)?.name}</span>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(280px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setReturnCityId(null); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {returnCities.map(c => (
                            <button key={c.id} type="button" onClick={() => { setReturnCityId(c.id); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${returnCityId === c.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{c.name}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Row 5: Return Location Type */}
                  <div className="mb-3">
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Return location</label>
                    <Popover open={openDropdownId === "return-loc"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "return-loc" : null)}>
                      <PopoverTrigger className="w-full" disabled={!returnCityId}>
                        <div className={`w-full h-14 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40 ${!returnCityId ? "opacity-50 pointer-events-none" : ""}`}>
                          {returnLocation ? (
                            <><span className="font-medium text-white">{returnLocation}</span></>
                          ) : (
                            <span className="text-white/40">{t("vehicles.all_types")}</span>
                          )}
                        </div>
                      </PopoverTrigger>
                       <PopoverContent align="start" sideOffset={4} className="w-[min(320px,calc(100vw-3rem))] p-3 max-h-96 overflow-y-auto">
                         <button type="button" onClick={() => { setReturnLocationType(""); setOpenDropdownId(null); }} className="w-full flex items-center gap-4 px-5 py-4 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                           <span>{t("vehicles.all_types")}</span>
                         </button>
                         {(() => {
                           const city = returnCityId ? returnCities.find(c => c.id === returnCityId) : null;
                          const locs = city?.locations?.length ? city.locations : null;
                          if (locs) {
                            return locs.map(loc => (
                              <button key={loc.id} type="button" onClick={() => handleReturnLocationSelect(loc.type, loc.name, loc.price)} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${returnLocationType === loc.type ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${loc.type === "airport" ? "bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/5" : "bg-gradient-to-br from-blue-500/20 to-blue-500/5"}`}>
                                  {loc.type === "airport" ? (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#F39C12" className="opacity-90"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                  ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" className="opacity-90"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{loc.name}</span>
                                  <span className="text-xs text-white/40">{loc.type === "airport" ? "Restitution à l'aéroport" : "Restitution en centre-ville"}</span>
                                </div>
                              </button>
                            ));
                          }
                          return (
                            <>
                              <button type="button" onClick={() => handleReturnLocationSelect("airport", t("vehicles.location_airport"), 0)} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${returnLocationType === "airport" ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/5 flex items-center justify-center shrink-0">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F39C12" className="opacity-90"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{t("vehicles.location_airport")}</span>
                                  <span className="text-xs text-white/40">Restitution à l'aéroport</span>
                                </div>
                              </button>
                              <button type="button" onClick={() => handleReturnLocationSelect("citycenter", t("vehicles.location_citycenter"), 0)} className={`w-full flex items-center gap-4 px-5 py-4 text-base rounded-xl transition-all ${returnLocationType === "citycenter" ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shrink-0">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" className="opacity-90"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{t("vehicles.location_citycenter")}</span>
                                  <span className="text-xs text-white/40">Restitution en centre-ville</span>
                                </div>
                              </button>
                            </>
                          );
                        })()}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Extra fee display */}
                  {(() => {
                    const pickupCity = filterCityId ? filterCities.find(c => c.id === filterCityId) : null;
                    const pickupLoc = pickupCity?.locations?.find(l => l.type === filterLocationType);
                    const returnCity = returnCityId ? returnCities.find(c => c.id === returnCityId) : null;
                    const returnLoc = returnCity?.locations?.find(l => l.type === returnLocationType);
                    const fee = returnLoc?.price && Number(returnLoc.price) > 0 ? Number(returnLoc.price) : null;
                    if (!fee) return null;
                    return (
                      <div className="mb-3 flex items-center gap-2 bg-[#F39C12]/10 border border-[#F39C12]/20 rounded-xl px-4 py-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F39C12"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                        <span className="text-sm font-bold text-[#F39C12]">
                          Supplément {returnLoc?.name}: {fee.toFixed(2)} DH
                        </span>
                      </div>
                    );
                  })()}

                  {/* Confirmation popup */}
                  {confirmOpen && confirmData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmOpen(false)}>
                      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F39C12]/20 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F39C12"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                          </div>
                          <h3 className="text-lg font-bold text-white">Supplément de restitution</h3>
                        </div>
                        <p className="text-sm text-white/70 mb-6 leading-relaxed">
                          Un supplément de <span className="font-bold text-[#F39C12]">{confirmData.price.toFixed(2)} DH</span> sera ajouté pour la restitution à <span className="font-bold text-white">{confirmData.name}</span>.
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setReturnLocationType(confirmData.type); setConfirmOpen(false); setConfirmData(null); }}
                            className="flex-1 h-11 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold text-sm transition-all active:scale-95 cursor-pointer"
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => { setConfirmOpen(false); setConfirmData(null); }}
                            className="h-11 px-6 rounded-xl border border-white/20 text-white/70 hover:text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Row 6: Brand + Model + Fuel type + Transmission + Vehicle type */}
                  <div className="filter-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.brand")}</label>
                      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {brand ? (<>{getBrandLogo(brand) && <img src={getBrandLogo(brand)!} alt={brand} className="w-5 h-5 object-contain" />}<span className="font-medium text-white">{brand}</span></>) : (<span className="text-white/40">{t("vehicles.all_types")}</span>)}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(340px,calc(100vw-3rem))] p-4 max-h-80 overflow-y-auto">
                          <button type="button" onClick={() => { setBrand(""); setBrandOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">{t("vehicles.all_types")}</button>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {propMarques.map((m) => {
                              const logoUrl = m.logo ? `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}` : getBrandLogo(m.name);
                              return (
                                <button key={m.id} type="button" onClick={() => { setBrand(m.name); setBrandOpen(false); setTimeout(() => setModelOpen(true), 100); }} className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm transition-all ${brand === m.name ? "bg-[#F39C12]/20 text-[#F39C12] ring-2 ring-[#F39C12]/40" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"}`}>
                                  {logoUrl && <img src={logoUrl} alt={m.name} className="w-8 h-8 object-contain shrink-0" />}
                                  <span className="text-xs font-medium text-center leading-tight">{m.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.category")}</label>
                      <Popover open={openDropdownId === "category"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "category" : null)}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {vehicleType ? <span className="font-medium text-white">{categories.find(c => c.id === vehicleType)?.name}</span> : <span className="text-white/40">{t("vehicles.all_types")}</span>}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(200px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setVehicleType(null); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {categories.map((cat) => (
                            <button key={cat.id} type="button" onClick={() => { setVehicleType(cat.id); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${vehicleType === cat.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{cat.name}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.model")}</label>
                      <Popover open={modelOpen} onOpenChange={setModelOpen}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {model ? <span className="font-medium text-white">{model}</span> : <span className="text-white/40">{brand ? t("vehicles.model_placeholder") : t("vehicles.all_types")}</span>}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(200px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setModel(""); setModelOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {brandModels.map((m) => (
                            <button key={m} type="button" onClick={() => { setModel(m); setModelOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${model === m ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{m}</span>
                            </button>
                          ))}
                          {brand && brandModels.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-400">No models found</div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Transmission</label>
                      <Popover open={openDropdownId === "transmission"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "transmission" : null)}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {transmission ? (
                              <span className="font-medium text-white">{transmission}</span>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(200px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setTransmission(""); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {[["Automatic","Automatique"],["Manual","Manuelle"]].map(([val,label]) => (
                            <button key={val} type="button" onClick={() => { setTransmission(val); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${transmission === val ? "bg-[#FF7B00]/20 text-[#FF7B00]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.fuel_type")}</label>
                      <Popover open={openDropdownId === "fuel"} onOpenChange={(open: boolean) => setOpenDropdownId(open ? "fuel" : null)}>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {fuelType ? (
                              <span className="font-medium text-white">{fuelType === "Gasoline" ? "Essence" : fuelType === "Electricity" ? "Électrique" : fuelType}</span>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(240px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => { setFuelType(""); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {[["Gasoline","Essence"],["Diesel","Diesel"],["Electricity","Électrique"],["Hybrid","Hybride"]].map(([val,label]) => (
                            <button key={val} type="button" onClick={() => { setFuelType(val); setOpenDropdownId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${fuelType === val ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Row 8: Price range + Search */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <div className="price-inputs flex gap-3 flex-1">
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Min</label>
                        <input type="number" placeholder="0 DH" value={minPrice ?? ""} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all" />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Max</label>
                        <input type="number" placeholder="1000 DH" value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all" />
                      </div>
                    </div>
                    <m.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch} className="search-button w-full sm:w-auto h-11 px-8 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-[#FF7B00]/20">
                      <Search className="w-4 h-4" />
                      {t("vehicles.filter_button")}
                    </m.button>
                  </div>
                </form>
                {noResults && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-black backdrop-blur-md border border-[#F39C12]/30 rounded-xl px-5 py-4 text-center"
                  >
                    <p className="text-[#F39C12] font-semibold text-sm">{t("home.no_results")}</p>
                    <p className="text-white/50 text-xs mt-1">{t("home.no_results_hint")}</p>
                  </m.div>
                )}
              </m.div>
              </div>

              {/* Right: Vehicle showcase */}
              {displayVehicles.length > 0 && (
                <m.div
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="flex-1 relative group w-full min-w-0"
                >
                  <div className="relative w-full max-w-[700px] mx-auto flex items-center justify-center">
                    {/* Ambient rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full border border-[#F39C12]/10" style={{animation:'pulse-ring 3s ease-in-out infinite'}} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] aspect-square rounded-full border border-[#F39C12]/15" style={{animation:'pulse-ring 3s ease-in-out infinite 0.5s'}} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full bg-[#F39C12]/[0.04] blur-[60px]" />
                    <div className="absolute top-1/2 left-1/2 w-[70%] aspect-square rounded-full border border-[#F39C12]/10 z-0 pulse-scale" />
                    <div className="absolute top-1/2 left-1/2 w-[60%] aspect-square rounded-full border border-[#F39C12]/10 z-0 pulse-scale-reverse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-[#F39C12]/[0.06] blur-[70px] z-0 pointer-events-none" />

                    <div className="relative z-10 floating">
                      <VerticalImageStack
                        items={displayVehicles.map((v) => ({
                          id: v.id,
                          title: `${v.marque} ${v.model}`,
                          imageSrc: vehicleImageUrl(v.pictures?.[0]?.path ?? "") || "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
                          href: `/vehicules/${v.id}`,
                          year: v.year,
                          fuelType: v.fuelType,
                          pricePerDay: v.pricePerDay,
                          Occupants: v.Occupants,
                          km: v.km,
                        }))}
                        cardWidth={660}
                        cardHeight={620}
                      />
                    </div>
                  </div>
                </m.div>
              )}
          </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ animation: 'fade-in 0.6s ease-out 1.5s both' }}
        >
          <div
            className="cursor-pointer"
            style={{ animation: 'bounce-y 2s ease-in-out infinite' }}
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#D5DEEF" strokeWidth="2" opacity="0.6" />
              <circle cx="12" cy="12" r="3" fill="#F39C12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[5]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F0F3FA]/70 to-[#F0F3FA]" />
        <div className="hidden dark:block absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(5,8,15,.35) 15%, rgba(5,8,15,.70) 45%, rgba(5,8,15,.95) 100%)" }} />
      </div>
    </section>
  );
}

export default function HomePageClient({ vehicles: propVehicles = [], marques = [] }: { vehicles?: Vehicle[]; marques?: Marque[] }) {
  const { locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";

  const [vehicles] = useState<Vehicle[]>(propVehicles);

  const breadcrumbItems = [
    { name: "CARFORFAR", url: "https://www.carforfar.com/" },
    { name: "Accueil", url: "https://www.carforfar.com/" },
  ];

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] font-sans overflow-x-hidden transition-colors duration-500">
      <JsonLd id="ld-breadcrumb" data={breadcrumbLD(breadcrumbItems)} />
      <HeroSection vehicles={vehicles} marques={marques} />
      <div className="relative w-full h-32 mt-10 pointer-events-none z-[5]">
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-[#F0F3FA]" />
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-[#070b14]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,0,0,0.5),transparent)]" />
      </div>
      <LazyVehiclesMarquee vehicles={vehicles} marques={marques} />
      <LazyAtmosphericMist />
      <div className="relative w-full h-32 z-10 pointer-events-none">
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-[#F0F3FA] via-white/60 to-[#F0F3FA]" />
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black/40 to-[#0a0a0a]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(20,20,20,0.9),transparent)]" />
      </div>
      <LazyMarquesSection marques={marques} />
      <LazyServicesSection />
      <LazyHowItWorksSection />
      <LazyStatsSection />
      <LazyCTASection />
      <LazyAboutSection />
      <MapSection />
    </div>
    </LazyMotion>
  );
}
