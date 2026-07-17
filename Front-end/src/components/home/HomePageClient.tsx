"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import type { Vehicle, Marque, TypeVehicule, Country, City, CityLocation } from "@/lib/types";
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
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { VerticalImageStack } from "@/components/ui/vertical-image-stack";
import { CircularGallery, type BrandItem } from "@/components/ui/circular-gallery";


const MapSection = dynamic(() => import("@/components/HomeMap"), { ssr: false });

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
        <Image src="/logo-dark.png" alt="CARFORFAR logo" width={500} height={144} className="h-36 w-auto object-contain select-none" unoptimized />
      </div>
    );
  }
  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <Image src="/logo.png" alt="CARFORFAR logo" width={500} height={144} className="h-36 w-auto object-contain select-none dark:hidden" unoptimized />
      <Image src="/logo-dark.png" alt="CARFORFAR logo" width={500} height={144} className="h-36 w-auto object-contain select-none hidden dark:block" unoptimized />
    </div>
  );
}

function HeroSection({ vehicles: showcaseVehicles, marques: propMarques = [], typeVehicules: propTypeVehicules = [] }: { vehicles?: Vehicle[]; marques?: Marque[]; typeVehicules?: TypeVehicule[] }) {
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
  const [typeVehiculeId, setTypeVehiculeId] = useState<number | null>(null);
  const [typeCarouselPage, setTypeCarouselPage] = useState(0);
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

  const brandTypes = useMemo(() => {
    if (!brand || !showcaseVehicles) return propTypeVehicules;
    const typeIds = new Set<number>();
    for (const v of showcaseVehicles) {
      if (v.marque === brand && v.typeVehicule) typeIds.add(v.typeVehicule.id);
    }
    if (typeIds.size === 0) return propTypeVehicules;
    return propTypeVehicules.filter(tv => typeIds.has(tv.id));
  }, [brand, showcaseVehicles, propTypeVehicules]);

  useEffect(() => { setTypeCarouselPage(0); }, [brandTypes]);
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
    setTypeVehiculeId(null);
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
    if (typeVehiculeId) params.set("type_vehicule_id", String(typeVehiculeId));
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
                className="font-cinzel leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] text-[#FF7B00]"
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
                <form onSubmit={handleSearch} className="bg-black backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]">
                  {/* Row 1: Country + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      {/* Pickup Date + Time joined */}
                      <div className="flex-1 min-w-0 flex items-stretch bg-white/15 border border-white/20 rounded-xl overflow-hidden">
                        <Popover>
                          <PopoverTrigger className="flex-1 min-w-0">
                            <span className="block w-full bg-transparent px-3 py-2.5 text-sm text-white text-left leading-normal">
                              {pickupDate ? new Date(pickupDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : <span className="text-white/40">Date</span>}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <Calendar size="lg" mode="single" selected={pickupDate ? new Date(pickupDate + "T00:00:00") : undefined} onSelect={(d: Date | undefined) => { if (d) { const val = toLocalDateString(d); setPickupDate(val); if (returnDate && returnDate < val) setReturnDate(""); } }} fromDate={new Date()} />
                          </PopoverContent>
                        </Popover>
                        <div className="w-px bg-white/10 self-stretch" />
                        <input type="time" name="pickup_time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-20 bg-transparent px-2 py-2.5 text-sm text-white outline-none border-none text-center cursor-pointer [color-scheme:dark]" />
                      </div>

                      <span className="hidden sm:flex items-center text-white/15 text-lg select-none">-</span>

                      {/* Return Date + Time joined */}
                      <div className="flex-1 min-w-0 flex items-stretch bg-white/15 border border-white/20 rounded-xl overflow-hidden">
                        <Popover>
                          <PopoverTrigger className={`flex-1 min-w-0 ${!pickupDate ? "pointer-events-none" : ""}`} disabled={!pickupDate}>
                            <span className={`block w-full bg-transparent px-3 py-2.5 text-sm text-left leading-normal ${!pickupDate ? "text-white/40" : "text-white"}`}>
                              {returnDate ? new Date(returnDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : <span className="text-white/40">{!pickupDate ? "Choisir d'abord" : "Date"}</span>}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <Calendar size="lg" mode="single" selected={returnDate ? new Date(returnDate + "T00:00:00") : undefined} onSelect={(d: Date | undefined) => { if (d) setReturnDate(toLocalDateString(d)); }} disabled={pickupDate ? (() => { const d = new Date(pickupDate + "T00:00:00"); d.setDate(d.getDate() + 1); return { before: d }; })() : undefined} />
                          </PopoverContent>
                        </Popover>
                        <div className="w-px bg-white/10 self-stretch" />
                        <input type="time" name="dropoff_time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="w-20 bg-transparent px-2 py-2.5 text-sm text-white outline-none border-none text-center cursor-pointer [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Return Country + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
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
                                <button key={m.id} type="button" onClick={() => { setBrand(m.name); setBrandOpen(false); }} className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm transition-all ${brand === m.name ? "bg-[#F39C12]/20 text-[#F39C12] ring-2 ring-[#F39C12]/40" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"}`}>
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
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.vehicle_type")}</label>
                      <Popover>
                        <PopoverTrigger className="w-full">
                          <div className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:border-white/40">
                            {typeVehiculeId ? (
                              <span className="font-medium text-white">{propTypeVehicules.find(tv => tv.id === typeVehiculeId)?.name}</span>
                            ) : (
                              <span className="text-white/40">{t("vehicles.all_types")}</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" sideOffset={4} className="w-[min(240px,calc(100vw-3rem))] p-3 max-h-72 overflow-y-auto">
                          <button type="button" onClick={() => setTypeVehiculeId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {brandTypes.map(tv => (
                            <button key={tv.id} type="button" onClick={() => setTypeVehiculeId(tv.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${typeVehiculeId === tv.id ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{tv.name}</span>
                            </button>
                          ))}
                          {brand && brandTypes.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-400">No types found</div>
                          )}
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
                      <Popover>
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
                          <button type="button" onClick={() => setTransmission("")} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {[["Automatic","Automatique"],["Manual","Manuelle"]].map(([val,label]) => (
                            <button key={val} type="button" onClick={() => setTransmission(val)} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${transmission === val ? "bg-[#FF7B00]/20 text-[#FF7B00]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.fuel_type")}</label>
                      <Popover>
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
                          <button type="button" onClick={() => setFuelType("")} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span>{t("vehicles.all_types")}</span>
                          </button>
                          {[["Gasoline","Essence"],["Diesel","Diesel"],["Electricity","Électrique"],["Hybrid","Hybride"]].map(([val,label]) => (
                            <button key={val} type="button" onClick={() => setFuelType(val)} className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all ${fuelType === val ? "bg-[#F39C12]/20 text-[#F39C12]" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                              <span className="font-medium">{label}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Row 7: Category carousel */}
                  {categories.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">{t("vehicles.category")}</label>
                      <div className="relative">
                        <div ref={categoryScrollRef} className="flex items-center justify-center gap-2 pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setVehicleType(vehicleType === cat.id ? null : cat.id)}
                              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                vehicleType === cat.id
                                  ? "bg-[#FF7B00] text-[#1f2124] shadow-lg shadow-[#FF7B00]/20"
                                  : "bg-white/15 text-white/80 hover:bg-white/25 border border-white/20"
                              }`}
                            >
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d={getCategoryIcon(cat.name)} />
                              </svg>
                              <span>{cat.name}</span>
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => categoryScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })} className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => categoryScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })} className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Row 8: Price range + Search */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-3 flex-1">
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Min</label>
                        <input type="number" placeholder="0 DH" value={minPrice ?? ""} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all" />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 mb-1.5">Max</label>
                        <input type="number" placeholder="1000 DH" value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full h-11 bg-white/15 border border-white/20 rounded-xl px-4 outline-none text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/20 transition-all" />
                      </div>
                    </div>
                    <m.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch} className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-[#FF7B00]/20">
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
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-20" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F0F3FA]/60 to-[#F0F3FA] dark:via-[#070b14]/60 dark:to-[#070b14]" />
      </div>
    </section>
  );
}

function ServicesSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useI18n();
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (isTouchDevice) return;
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
      <div className="absolute bottom-40 right-16 text-[#F39C12]/10 dark:text-[#F39C12]/5 text-4xl pointer-events-none" style={{ animation: 'float-drift 12s ease-in-out infinite' }}>&#9679;</div>
      <div className="absolute top-60 right-20 text-[#395886]/8 dark:text-[#395886]/5 text-5xl pointer-events-none" style={{ animation: 'float-slow 9s ease-in-out infinite 2s' }}>&#9641;</div>

      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1200 64" className="w-full h-full text-white fill-current">
          <path d="M0,32 C300,64 600,0 1200,32 L1200,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase bg-[#F39C12]/10 px-4 py-2 rounded-full border border-[#F39C12]/20">{t("home.services.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.services.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.services.subtitle")}
          </p>
        </m.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <m.div
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D5DEEF] to-[#c5d0e4] dark:from-[#1e293b] dark:to-[#253249] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-6 transition-all duration-500 group-hover:from-[#395886] group-hover:to-[#2d4670] dark:group-hover:from-[#F39C12] dark:group-hover:to-[#d68910] group-hover:text-white group-hover:shadow-[0_8px_25px_rgba(57,88,134,0.3)] dark:group-hover:shadow-[0_8px_25px_rgba(243,156,18,0.3)]">
                <m.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  {svc.icon}
                </m.div>
              </div>
              <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#F39C12] group-hover:translate-x-1">{t(svc.titleKey)}</h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed mb-4">{t(svc.descKey)}</p>
              <div className="flex items-center gap-2 text-[#F39C12] text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <span>{t("home.services.learn_more")}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </m.div>
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
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#F39C12]/5 dark:bg-[#F39C12]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#395886 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase bg-[#F39C12]/10 px-4 py-2 rounded-full border border-[#F39C12]/20">{t("home.how.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6">
            {t("home.how.title")}
          </h2>
        </m.div>

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
            <m.div
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
              <m.div
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#395886] to-[#2d4670] flex items-center justify-center text-[#F39C12] text-xl font-black mb-6 relative z-10 shadow-[0_8px_25px_rgba(57,88,134,0.2)] transition-all duration-500 group-hover:shadow-[0_12px_40px_rgba(57,88,134,0.4)]"
              >
                <m.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: i * 0.2 + 0.3 }}
                >
                  {step.num}
                </m.span>
                {/* Glow ring */}
                <m.div
                  animate={activeStep === i ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-2xl ring-2 ring-[#F39C12]/30"
                />
              </m.div>

              {/* Content */}
              <m.h3
                className="text-xl font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#F39C12]"
                animate={activeStep === i ? { x: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {t(step.titleKey)}
              </m.h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed max-w-xs">{t(step.descKey)}</p>

              {/* Bottom indicator line */}
              <m.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#638ECB] to-[#F39C12] origin-left"
              />
            </m.div>
          ))}
        </div>

        {/* Bottom note */}
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-xs text-[#638ECB]/50 dark:text-[#638ECB]/30 mt-12 tracking-widest uppercase"
        >
          &mdash; {t("home.how.ready")} &mdash;
        </m.p>
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
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#638ECB]/20 dark:border-[#638ECB]/10"
        style={{ animation: 'spin-slow 80s linear infinite' }}
      />
      <div
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full border border-[#F39C12]/10 dark:border-[#F39C12]/5"
        style={{ animation: 'spin-slow 60s linear infinite reverse' }}
      />
      <div className="absolute inset-0" style={{ background: '#666A6D' }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_KEYS.map((stat, i) => (
            <m.div
              key={stat.valueKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center group"
            >
              <m.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-5 transition-all duration-500 group-hover:bg-[#F39C12]/20 group-hover:border-[#F39C12]/30 group-hover:shadow-[0_0_30px_rgba(243,156,18,0.15)]"
              >
                <m.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  className="text-3xl md:text-4xl font-black text-[#F39C12] block"
                >
                  {getStatValue(stat.valueKey)}
                </m.span>
              </m.div>
              <span className="text-sm text-[#D5DEEF] font-medium block transition-colors duration-300 group-hover:text-white">{getStatLabel(stat)}</span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const fuelTypeIcon: Record<string, React.ReactNode> = {
  Diesel: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 10h2a2 2 0 012 2v4a2 2 0 002 2H5"/><circle cx="7.5" cy="19.5" r="2.5"/><circle cx="17.5" cy="19.5" r="2.5"/></svg>
  ),
  Gasoline: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 10h2a2 2 0 012 2v4a2 2 0 002 2H5"/><circle cx="7.5" cy="19.5" r="2.5"/><circle cx="17.5" cy="19.5" r="2.5"/></svg>
  ),
  Electricity: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Hybrid: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
};



function VehiclesMarquee({ vehicles: propVehicles = [], marques: propMarques = [] }: { vehicles?: Vehicle[]; marques?: Marque[] }) {
  const router = useRouter();
  const [vehicles] = useState<Vehicle[]>(propVehicles);
  const [marques] = useState<Marque[]>(propMarques);
  const { t } = useI18n();

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

  const [dims, setDims] = useState(() => ({
    cardWidth: 420,
    cardHeight: 440,
    maxVisible: 5,
  }));

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDims({ cardWidth: 280, cardHeight: 380, maxVisible: 3 });
      } else if (w < 1024) {
        setDims({ cardWidth: 360, cardHeight: 410, maxVisible: 5 });
      } else {
        setDims({ cardWidth: 420, cardHeight: 440, maxVisible: 5 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  type VehicleStackItem = CardStackItem & {
    vehicle: Vehicle;
    brandLogoSrc: string | null;
  };

  const stackItems: VehicleStackItem[] = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.id,
        title: `${v.marque} ${v.model}`,
        imageSrc: v.pictures?.[0]
          ? vehicleImageUrl(v.pictures[0].path)
          : "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
        href: `/vehicules/${v.id}`,
        vehicle: v,
        brandLogoSrc: marqueImg(v.marque),
      })),
    [vehicles, marqueImg],
  );

  const fuelLabel = (ft: string) =>
    ft === "Gasoline"
      ? "Essence"
      : ft === "Electricity"
        ? "Électrique"
        : ft === "Hybrid"
          ? "Hybride"
          : ft;

  const renderVehicleCard = useCallback(
    (item: VehicleStackItem) => {
      const v = item.vehicle;
      return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-[#0c1322] group">
          <div className="relative h-[55%] w-full overflow-hidden">
            <img
              src={item.imageSrc}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#395886]/70 dark:bg-[#0f1729]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-white/10">
                {v.year}
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#F39C12]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-[#F39C12]/20 inline-flex items-center gap-1">
                {fuelTypeIcon[v.fuelType]}
                {v.fuelType}
              </span>
              {v.category && (
                <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#638ECB]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-white/10">
                  {v.category.name}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="flex items-baseline gap-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                <span className="text-[28px] font-black leading-none tracking-tight">
                  {v.pricePerDay.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  DH / jour
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-[45%] flex flex-col overflow-hidden">
            {item.brandLogoSrc && (
              <img
                src={item.brandLogoSrc}
                alt=""
                className="absolute -bottom-6 -right-6 w-[120px] h-[120px] opacity-[0.04] dark:opacity-[0.06] -rotate-12 pointer-events-none select-none z-0"
                draggable={false}
              />
            )}

            <div className="flex-1 p-4 flex flex-col relative z-10">
              <div className="flex items-center gap-2.5 mb-2.5">
                {item.brandLogoSrc ? (
                  <div className="w-9 h-9 rounded-[10px] bg-[#F0F3FA] dark:bg-[#1a2438] flex items-center justify-center p-1.5 shrink-0 border border-[#D5DEEF]/30 dark:border-[#1e293b]/50">
                    <img
                      src={item.brandLogoSrc}
                      alt={v.marque}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#395886] to-[#2d4670] flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-white">
                      {v.marque.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-[#395886] dark:text-[#D5DEEF] leading-tight truncate">
                    {v.marque} {v.model}
                  </h3>
                  <p className="text-[10px] text-[#638ECB] dark:text-[#94A3B8] mt-0.5 font-medium">
                    {v.year} &middot; {fuelLabel(v.fuelType)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#D5DEEF]/40 dark:via-[#1e293b]/60 to-transparent mb-2.5" />

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {v.Occupants} places
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {v.km.toLocaleString()} km
                </span>
                {v.air_conditioner && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7V4h16v3" />
                      <path d="M9 20h6" />
                      <path d="M12 4v8" />
                      <path d="M4 14h16" />
                      <rect x="4" y="11" width="16" height="3" rx="1" />
                    </svg>
                    Clim
                  </span>
                )}
                {v.gps && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
                    </svg>
                    GPS
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/vehicules/${v.id}`);
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Réserv. →
              </button>
            </div>
          </div>
        </div>
      );
    },
    [router],
  );

  return (
    <section className="bg-[#F3F3F3] dark:bg-[#070b14] py-28 md:py-32 px-4 sm:px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-[#F39C12]/[0.03] dark:bg-[#F39C12]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-7xl mx-auto mb-16 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2.5 text-[#F39C12] text-[11px] font-bold tracking-[0.25em] uppercase bg-[#F39C12]/[0.08] px-5 py-2.5 rounded-full border border-[#F39C12]/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F39C12] animate-pulse" />
            {t("home.marquee.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-[1.1] tracking-tight">
            {t("home.marquee.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            {t("home.marquee.subtitle")}
          </p>
        </div>
      </m.div>

      {vehicles.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <CardStack
            items={stackItems}
            initialIndex={0}
            cardWidth={dims.cardWidth}
            cardHeight={dims.cardHeight}
            maxVisible={dims.maxVisible}
            autoAdvance
            intervalMs={3000}
            pauseOnHover
            showDots
            overlap={0.42}
            spreadDeg={42}
            activeScale={1.04}
            inactiveScale={0.92}
            renderCard={renderVehicleCard}
          />
        </m.div>
      )}
    </section>
  );
}

function MarquesSection({ marques: propMarques = [] }: { marques?: Marque[] }) {
  const { t } = useI18n();

  const brandItems: BrandItem[] = useMemo(
    () =>
      propMarques.map((m) => ({
        id: m.id,
        name: m.name,
        logoSrc: m.logo
          ? `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}`
          : getBrandLogo(m.name),
      })),
    [propMarques],
  );

  return (
    <section className="bg-white dark:bg-[#070b14] py-28 px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-6 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase bg-[#F39C12]/10 px-4 py-2 rounded-full">
            {t("home.brands.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.brands.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.brands.subtitle")}
          </p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-center"
      >
        <CircularGallery
          items={brandItems}
          circleSize={1000}
          itemWidth={180}
          itemHeight={200}
          autoRotateSpeed={0.12}
          pauseOnHover
        />
      </m.div>
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
          background: 'linear-gradient(135deg, #D5DEEF, #b0c4de, #F39C12, #395886, #D5DEEF)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 12s ease infinite',
        }}
      />
      {/* Overlay to keep readability */}
      <div className="absolute inset-0 bg-[#D5DEEF]/60 dark:bg-[#0b1121]/80 backdrop-blur-[2px]" />

      {/* Floating geometric shapes */}
      <div className="absolute top-16 left-1/4 w-4 h-4 rounded-full bg-[#F39C12]/40 pointer-events-none" style={{ animation: 'float-slow 5s ease-in-out infinite' }} />
      <div className="absolute top-32 right-1/3 w-3 h-3 bg-[#395886]/30 pointer-events-none" style={{ animation: 'float-drift 8s ease-in-out infinite 1s', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute bottom-20 left-1/3 w-6 h-6 rounded-full bg-[#638ECB]/20 pointer-events-none" style={{ animation: 'float-slow 6s ease-in-out infinite 2s' }} />
      <div className="absolute top-1/2 right-1/4 w-5 h-5 border-2 border-[#F39C12]/20 pointer-events-none" style={{ animation: 'spin-slow 20s linear infinite', transformOrigin: 'center' }} />
      <div className="absolute bottom-1/3 left-[15%] w-8 h-8 border border-[#395886]/15 pointer-events-none" style={{ animation: 'spin-slow 25s linear infinite reverse', transformOrigin: 'center', borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%' }} />

      {/* Twinkling sparkle dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#F39C12]/40 pointer-events-none"
          style={{
            top: `${15 + i * 12}%`,
            left: `${10 + i * 15}%`,
            animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <m.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase bg-white/70 dark:bg-[#1e293b]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#F39C12]/20 shadow-[0_2px_10px_rgba(243,156,18,0.1)] dark:shadow-[0_2px_10px_rgba(243,156,18,0.05)]"
          >
            <m.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#F39C12]"
            />
            {t("home.cta.ready")}
          </m.span>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 mb-6 leading-tight flex flex-wrap items-center justify-center gap-x-3"
          >
            {t("home.cta.title1")}
            <span className="relative inline-flex items-center">
              <img
                src="/about-logo.png"
                alt="CARFORFAR"
                className="h-16 md:h-20 w-auto object-contain dark:hidden"
              />
              <img
                src="/about-logo-dark.png"
                alt="CARFORFAR"
                className="h-16 md:h-20 w-auto object-contain hidden dark:block"
              />
              <m.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-[#F39C12]/20 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            <span>{t("home.cta.title2")}</span>
          </m.h2>

          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[#638ECB] dark:text-[#94A3B8] text-lg mb-10 max-w-lg mx-auto"
          >
            {t("home.cta.subtitle")}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative inline-flex"
          >
            {/* Pulsing ring behind button */}
            <m.div
              className="absolute inset-0 rounded-2xl border-2 border-[#395886]/30 dark:border-[#F39C12]/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />

            <m.button
              whileHover={{ scale: 1.05, boxShadow: "0 15px 50px rgba(57,88,134,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="relative overflow-hidden bg-gradient-to-r from-[#FF7B00] via-[#e66f00] to-[#FF7B00] hover:from-[#e66f00] hover:to-[#cc6200] text-[#1f2124] font-black text-sm tracking-[0.15em] uppercase px-14 py-5 rounded-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(255,123,0,0.35)] shimmer-btn"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10">{t("home.cta.button")}</span>
            </m.button>
          </m.div>

          {/* Trust line */}
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-[11px] text-[#638ECB]/50 dark:text-[#94A3B8]/40 mt-8 tracking-wider"
          >
            {t("home.cta.trust")}
          </m.p>
        </m.div>
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F39C12]/30 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <m.div
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
          </m.div>
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
              <m.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <h4 className="text-[#F39C12] text-xs font-bold tracking-[0.15em] uppercase mb-4">{col.title}</h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((linkObj) => (
                    <a key={linkObj.label} href={linkObj.href} className="text-[#D5DEEF]/70 text-sm hover:text-[#F39C12] transition-all duration-300 hover:translate-x-1 inline-block w-fit">
                      {linkObj.label}
                    </a>
                  ))}
                </div>
              </m.div>
            ))}
          </div>
        </div>
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-[#638ECB]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-[#D5DEEF]/40 text-xs">&copy; {new Date().getFullYear()} <a href="https://cdigital.ma/" target="_blank" rel="noopener noreferrer" className="text-[#D5DEEF]/60 hover:text-[#F39C12] transition-colors duration-200">Cdigital</a>. {t("footer.rights")}</p>
          <div className="flex gap-4">
            {["Instagram", "Facebook", "LinkedIn"].map((s) => (
              <m.a
                key={s}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-[#D5DEEF]/40 text-xs hover:text-[#F39C12] transition-colors duration-300"
              >
                {s}
              </m.a>
            ))}
          </div>
        </m.div>
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
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#1f4276]/5 dark:border-[#F39C12]/5 pointer-events-none" style={{ animation: 'float-slow 12s ease-in-out infinite' }} />
      <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full border border-[#F39C12]/8 dark:border-[#638ECB]/8 pointer-events-none" style={{ animation: 'float-drift 15s ease-in-out infinite' }} />
      <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-[#1f4276]/10 dark:bg-[#F39C12]/10 pointer-events-none" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />

      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <m.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <m.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-[#7385a9] dark:text-[#94A3B8] bg-[#7385a9]/10 dark:bg-[#94A3B8]/10 px-4 py-2 rounded-full border border-[#7385a9]/10 dark:border-[#94A3B8]/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7385a9] dark:bg-[#94A3B8] animate-pulse" />
            {t("vehicles.about_label")}
          </m.div>

          <h2 className="mt-6 text-[56px] leading-[1.05] font-extrabold text-[#1f4276] dark:text-[#D5DEEF]">
            {t("vehicles.about_title")}
          </h2>
          <div className="w-16 h-1 bg-[#F39C12] rounded-full mt-6" />
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
              <m.div
                key={stat.label}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
              >
                <m.div
                  className="text-[56px] font-extrabold text-[#1f4276] dark:text-[#F39C12] leading-none"
                  initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: i * 0.15 + 0.5 }}
                >
                  {stat.value}
                </m.div>
                <div className="text-[13px] uppercase tracking-[0.12em] text-gray-500 dark:text-[#94A3B8] mt-2">{stat.label}</div>
              </m.div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <m.div
            whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: "0 20px 60px rgba(31,66,118,0.12)" }}
            className="bg-white dark:bg-[#0f1729] rounded-[26px] shadow-[0_12px_35px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] h-[480px] flex items-center justify-center overflow-hidden relative transition-all duration-500"
          >
            {/* Subtle gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f7f7fa] to-white dark:from-[#0f1729] dark:to-[#0b1121] opacity-60 dark:opacity-100" />
            <div className="text-center relative z-10 p-8">
              <m.img
                src="/about-logo.png"
                alt="CARFORFAR"
                className="w-full max-w-[420px] h-auto object-contain mx-auto dark:hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <m.img
                src="/about-logo-dark.png"
                alt="CARFORFAR"
                className="w-full max-w-[420px] h-auto object-contain mx-auto hidden dark:block"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}




function AtmosphericMist() {
  return (
    <div className="relative h-32 md:h-48 -my-16 md:-my-24 z-20 pointer-events-none overflow-hidden">
      {/* Base fog gradient - blends section bg colors */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            linear-gradient(to bottom,
              transparent 0%,
              rgba(7,11,20,0.3) 15%,
              rgba(7,11,20,0.5) 40%,
              rgba(7,11,20,0.7) 50%,
              rgba(7,11,20,0.5) 60%,
              rgba(7,11,20,0.3) 85%,
              transparent 100%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            linear-gradient(to bottom,
              transparent 0%,
              rgba(240,243,250,0.3) 15%,
              rgba(255,255,255,0.5) 40%,
              rgba(255,255,255,0.7) 50%,
              rgba(255,255,255,0.5) 60%,
              rgba(240,243,250,0.3) 85%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Soft center glow */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(7,11,20,0.35) 0%,
              rgba(7,11,20,0.15) 40%,
              transparent 70%
            )
          `,
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(255,255,255,0.35) 0%,
              rgba(240,243,250,0.15) 40%,
              transparent 70%
            )
          `,
          filter: "blur(30px)",
        }}
      />

      {/* Wide atmospheric spread */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 30% 50%,
              rgba(7,11,20,0.12) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 80% 45% at 70% 50%,
              rgba(7,11,20,0.10) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 30% 50%,
              rgba(243,245,250,0.12) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 80% 45% at 70% 50%,
              rgba(252,253,255,0.10) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
        }}
      />

      {/* Animated floating mist - left side */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 500px 180px at 25% 50%,
              rgba(7,11,20,0.08) 0%,
              transparent 60%
            )
          `,
          filter: "blur(60px)",
          animation: "mistDriftLeft 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 500px 180px at 25% 50%,
              rgba(255,255,255,0.08) 0%,
              transparent 60%
            )
          `,
          filter: "blur(60px)",
          animation: "mistDriftLeft 25s ease-in-out infinite",
        }}
      />

      {/* Animated floating mist - right side */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 400px 160px at 70% 50%,
              rgba(7,11,20,0.06) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
          animation: "mistDriftRight 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 400px 160px at 70% 50%,
              rgba(240,243,250,0.06) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
          animation: "mistDriftRight 30s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes mistDriftLeft {
          0%, 100% { transform: translateX(-15px) translateY(0); opacity: 0.7; }
          25% { transform: translateX(10px) translateY(-8px); opacity: 1; }
          50% { transform: translateX(-5px) translateY(5px); opacity: 0.8; }
          75% { transform: translateX(20px) translateY(-3px); opacity: 0.9; }
        }
        @keyframes mistDriftRight {
          0%, 100% { transform: translateX(10px) translateY(5px); opacity: 0.6; }
          25% { transform: translateX(-15px) translateY(-5px); opacity: 0.9; }
          50% { transform: translateX(5px) translateY(10px); opacity: 0.7; }
          75% { transform: translateX(-10px) translateY(0); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}


export default function HomePageClient({ vehicles: propVehicles = [], marques = [], typeVehicules = [] }: { vehicles?: Vehicle[]; marques?: Marque[]; typeVehicules?: TypeVehicule[] }) {
  const { locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";

  const [vehicles] = useState<Vehicle[]>(propVehicles);

  const breadcrumbItems = [
    { name: "CARFORFAR", url: "https://www.carforfar.ma/" },
    { name: "Accueil", url: "https://www.carforfar.ma/" },
  ];

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] font-sans overflow-x-hidden transition-colors duration-500">
      <JsonLd id="ld-breadcrumb" data={breadcrumbLD(breadcrumbItems)} />
      <HeroSection vehicles={vehicles} marques={marques} typeVehicules={typeVehicules} />
      <VehiclesMarquee vehicles={vehicles} marques={marques} />
      <AtmosphericMist />
      <MarquesSection marques={marques} />
      <ServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
      <AboutSection />
      <MapSection />
    </div>
    </LazyMotion>
  );
}