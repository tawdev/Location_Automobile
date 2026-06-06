"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";
import { RequireClient } from "@/components/RequireClient";
import { filterVehicles, listVehicles, fetchCategories } from "@/lib/vehiclesApi";
import type { Vehicle, Category } from "@/lib/types";
import { vehicleImageUrl } from "@/lib/media";
import { Search } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const NEW_COUNT = 10;

type VehiclesQuery = {
  marque?: string;
  model?: string;
  Occupants?: string;
  fuelType?: string;
  min_price?: number;
  max_price?: number;
  pickup_date?: string;
  return_date?: string;
};

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
        backgroundColor: picturePath && !loaded ? "#edf0f5" : undefined,
      }}
    >
      {children}
    </div>
  );
});

export default function VehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<VehiclesQuery>({
    marque: "",
    model: "",
    Occupants: "",
    fuelType: "",
    min_price: undefined,
    max_price: undefined,
  });

  const [pickupDate, setPickupDateState] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  const setPickupDate = useCallback((value: string) => {
    setPickupDateState(value);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const doFilter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: VehiclesQuery = {
        marque: query.marque?.trim() ? query.marque.trim() : undefined,
        model: query.model?.trim() ? query.model.trim() : undefined,
        Occupants: query.Occupants?.trim() ? query.Occupants.trim() : undefined,
        fuelType: query.fuelType?.trim() ? query.fuelType.trim() : undefined,
        min_price: query.min_price !== undefined && query.min_price !== null ? query.min_price : undefined,
        max_price: query.max_price !== undefined && query.max_price !== null ? query.max_price : undefined,
        pickup_date: pickupDate || undefined,
        return_date: returnDate || undefined,
      };
      const data = await filterVehicles(params);
      setVehicles(data);
    } catch (e) {
      const msg = (e as { message?: string })?.message || t("vehicles.error_filter");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [query, pickupDate, returnDate, t]);

  const onFilterSubmit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    doFilter();
  }, [doFilter]);

  useEffect(() => {
    const id = setTimeout(() => { void loadInitial(); }, 0);
    return () => clearTimeout(id);
  }, [loadInitial]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Auto-filter when both dates are selected
  useEffect(() => {
    if (pickupDate && returnDate) {
      doFilter();
    }
  }, [pickupDate, returnDate, doFilter]);

  const filteredVehicles = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
<<<<<<< HEAD
    return list
      .filter(vehicle => {
        const categoryMap: Record<string, string[]> = {
          'SUV': ['Bentayga', 'Range Rover'],
          'Sports': ['911', '488', 'RS7'],
        };
        const matchesCategory = selectedCategory === 'All' ||
          (categoryMap[selectedCategory]?.some(cat =>
            vehicle.model.includes(cat) || vehicle.marque.includes(cat)
          ) ?? false);
        const matchesSearch = !searchQuery ||
          vehicle.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [vehicles, selectedCategory, searchQuery]);

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

  const prefersReducedMotion = useReducedMotion();

  return (
    <RequireClient>
      <div className="bg-[#f6f6f8] dark:bg-[#070b14] overflow-hidden transition-colors duration-500">
        <Head>
          <link rel="preload" href="/CarBackGround.png" as="image" />
        </Head>

        {/* HERO */}
        <section className="relative min-h-[600px] overflow-hidden bg-cover bg-center flex items-start"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.3), rgba(246,246,248,0.98)), url('/CarBackGround.png')",
          }}
        >
          {/* Ken Burns background zoom */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/CarBackGround.png')",
            }}
            animate={prefersReducedMotion ? {} : { scale: [1, 1.06, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-30 dark:opacity-40"
            style={{
              background: 'linear-gradient(-45deg, #1f4276, #4c6797, #f39c12, #1f4276)',
              backgroundSize: '400% 400%',
              backgroundPosition: '0% 50%',
            }}
            animate={prefersReducedMotion ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Dark mode overlay adjustment */}
          <div className="absolute inset-0 bg-[#f6f6f8]/0 dark:bg-[#070b14]/40 pointer-events-none" />

          {/* Driving car silhouette */}
          <div className="absolute bottom-[35%] left-0 pointer-events-none z-10" style={{ animation: 'drive 12s linear infinite' }}>
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" className="opacity-20 dark:opacity-10">
              <path d="M10 30 C10 20, 20 10, 35 10 L45 10 L55 4 L75 4 L85 10 L100 10 C110 10, 118 18, 118 28 L118 30 L110 30 C110 26, 105 24, 100 24 C95 24, 90 26, 90 30 L40 30 C40 26, 35 24, 30 24 C25 24, 20 26, 20 30 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-24 left-[18%] w-2 h-2 rounded-full bg-[#f39c12]/30 dark:bg-[#f39c12]/20" style={{ animation: 'float-drift 7s ease-in-out infinite' }} />
            <div className="absolute top-44 right-[22%] w-3 h-3 rounded-full bg-white/20 dark:bg-white/10" style={{ animation: 'float-slow 9s ease-in-out infinite 1s' }} />
            <div className="absolute bottom-36 left-[32%] w-1.5 h-1.5 rounded-full bg-[#f39c12]/20 dark:bg-[#f39c12]/15" style={{ animation: 'float-drift 6s ease-in-out infinite 2s' }} />
            <div className="absolute bottom-52 right-[38%] w-2.5 h-2.5 rounded-full bg-white/15 dark:bg-white/10" style={{ animation: 'float-slow 8s ease-in-out infinite 0.5s' }} />
          </div>

          {/* Twinkling dots */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30 dark:bg-[#f39c12]/20 pointer-events-none"
              style={{
                top: `${10 + i * 16}%`,
                left: `${6 + i * 17}%`,
                animation: `twinkle ${2.5 + i * 0.4}s ease-in-out infinite ${i * 0.3}s`,
              }}
            />
          ))}

          <div className="absolute top-6 left-8 z-30">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <BackButton />
            </motion.div>
          </div>

          <div
            className="absolute bottom-0 left-0 w-full h-[200px]"
            style={{ background: "linear-gradient(to bottom, rgba(246,246,248,0), rgba(246,246,248,1))" }}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-[200px] dark:block hidden"
            style={{ background: "linear-gradient(to bottom, transparent, #070b14)" }}
          />

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 pt-16 pb-28" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="text-center text-white text-[56px] md:text-[64px] font-extrabold tracking-[-0.04em] drop-shadow-2xl"
            >
              <span className="relative inline-block">
                {t("vehicles.page_title")}
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-[#f39c12]/60 rounded-full"
                  initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  style={{ transformOrigin: 'left' }}
                />
              </span>
            </motion.h1>

            {/* Animated scroll indicator */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex justify-center mt-6"
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
              >
                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-[#f39c12]"
                />
              </motion.div>
            </motion.div>

            {/* SEARCH CARD */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 max-w-[980px] mx-auto rounded-[24px] border border-white/30 dark:border-[#1e293b]/50 bg-white/25 dark:bg-[#0f1729]/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 relative overflow-hidden"
            >
              {/* Subtle inner glow */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f39c12]/5 dark:bg-[#f39c12]/[0.03] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1f4276]/5 dark:bg-[#1f4276]/[0.03] rounded-full blur-3xl pointer-events-none" />

              {/* Search */}
              <div className="mb-6 relative z-10">
                {/* CHANGED: label color to white */}
                <label className="block text-[11px] uppercase tracking-[0.15em] font-bold text-white dark:text-white mb-2.5">
                  {t("vehicles.search_label")}
                </label>
                <div className="h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl flex items-center px-5 input-focus-ring transition-all duration-300">
                  <Search className="w-[18px] h-[18px] text-[#8b94a9] dark:text-[#64748b]" />
                  <input
                    type="text"
                    placeholder={t("vehicles.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700 dark:text-[#D5DEEF] placeholder:text-gray-400 dark:placeholder:text-[#64748b]"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.pickup_date")}
                  </label>
                  <div className="h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl flex items-center px-5 input-focus-ring transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b94a9" className="dark:stroke-[#64748b]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPickupDate(val);
                        if (returnDate && val && returnDate < val) {
                          setReturnDate("");
                        }
                      }}
                      className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700 dark:text-[#D5DEEF] [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.return_date")}
                  </label>
                  <div className="h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl flex items-center px-5 input-focus-ring transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b94a9" className="dark:stroke-[#64748b]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={pickupDate || undefined}
                      className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700 dark:text-[#D5DEEF] [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.brand")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("vehicles.brand_placeholder")}
                    value={query.marque ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, marque: e.target.value }))}
                    className="w-full h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl px-5 outline-none text-[15px] text-gray-700 dark:text-[#D5DEEF] placeholder:text-gray-400 dark:placeholder:text-[#64748b] transition-all duration-300 focus:border-[#1f4276]/30 dark:focus:border-[#f39c12]/30 focus:shadow-[0_0_0_3px_rgba(31,66,118,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(243,156,18,0.1)]"
                  />
                </div>

                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.category")}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl px-5 outline-none text-[15px] text-gray-700 dark:text-[#D5DEEF] transition-all duration-300 focus:border-[#1f4276]/30 dark:focus:border-[#f39c12]/30 focus:shadow-[0_0_0_3px_rgba(31,66,118,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(243,156,18,0.1)]"
                  >
                    <option value="All">{t("vehicles.all")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.min_price")}
                  </label>
                  <input
                    type="number"
                    placeholder="0 DH"
                    value={query.min_price ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, min_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl px-5 outline-none text-[15px] text-gray-700 dark:text-[#D5DEEF] placeholder:text-gray-400 dark:placeholder:text-[#64748b] transition-all duration-300 focus:border-[#1f4276]/30 dark:focus:border-[#f39c12]/30 focus:shadow-[0_0_0_3px_rgba(31,66,118,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(243,156,18,0.1)]"
                  />
                </div>

                <div>
                  {/* CHANGED: label color to white */}
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-white dark:text-white mb-2">
                    {t("vehicles.max_price")}
                  </label>
                  <input
                    type="number"
                    placeholder="1000 DH"
                    value={query.max_price ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, max_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl px-5 outline-none text-[15px] text-gray-700 dark:text-[#D5DEEF] placeholder:text-gray-400 dark:placeholder:text-[#64748b] transition-all duration-300 focus:border-[#1f4276]/30 dark:focus:border-[#f39c12]/30 focus:shadow-[0_0_0_3px_rgba(31,66,118,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(243,156,18,0.1)]"
                  />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end mt-6 relative z-10">
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.04, boxShadow: "0 8px 25px rgba(31,66,118,0.3)" }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                  onClick={onFilterSubmit}
                  disabled={loading}
                  className="relative overflow-hidden h-[52px] px-10 rounded-xl bg-gradient-to-r from-[#4c6797] to-[#395784] dark:from-[#f39c12] dark:to-[#d68910] hover:from-[#395784] hover:to-[#2d4670] dark:hover:from-[#d68910] dark:hover:to-[#c47a0a] transition-all duration-300 text-white dark:text-[#0f1729] text-[14px] font-semibold flex items-center gap-3 disabled:opacity-50 shadow-[0_4px_15px_rgba(31,66,118,0.2)] dark:shadow-[0_4px_15px_rgba(243,156,18,0.25)] shimmer-btn"
                >
                  <Search className="w-[17px] h-[17px]" />
                  {t("vehicles.filter_button")}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Animated wave divider */}
        <div className="relative h-20 -mt-2 overflow-hidden pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1200 80" className="w-full h-full text-[#f6f6f8] dark:text-[#070b14] fill-current" preserveAspectRatio="none">
            <path
              d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
            />
          </svg>
        </div>

        {/* FEATURED */}
        <section className="max-w-[1280px] mx-auto px-8 pb-28 -mt-12">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>


            </div>

            <div className="flex items-center gap-2 p-1.5 bg-[#e8ebf0] dark:bg-[#1e293b]/60 rounded-full">
              <motion.button
                key="All"
                onClick={() => setSelectedCategory("All")}
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className={`relative px-5 h-9 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                  selectedCategory === "All"
                    ? "bg-[#1f4276] dark:bg-[#f39c12] text-white dark:text-[#0f1729] shadow-[0_4px_12px_rgba(31,66,118,0.25)] dark:shadow-[0_4px_12px_rgba(243,156,18,0.25)]"
                    : "text-gray-600 dark:text-[#94A3B8] hover:text-[#1f4276] dark:hover:text-[#D5DEEF]"
                }`}
              >
                {t("vehicles.all")}
              </motion.button>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  className={`relative px-5 h-9 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                    selectedCategory === cat.name
                      ? "bg-[#1f4276] dark:bg-[#f39c12] text-white dark:text-[#0f1729] shadow-[0_4px_12px_rgba(31,66,118,0.25)] dark:shadow-[0_4px_12px_rgba(243,156,18,0.25)]"
                      : "text-gray-600 dark:text-[#94A3B8] hover:text-[#1f4276] dark:hover:text-[#D5DEEF]"
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-[#edf0f5] dark:bg-[#0f1729] rounded-[18px] overflow-hidden"
                >
                  <div className="h-[280px] bg-gray-200/60 dark:bg-[#1e293b]/60 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-7 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/3" />
                    <div className="h-4 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/2" />
                    <div className="border-t border-[#d5deeF]/40 dark:border-[#1e293b]/60 pt-5 flex justify-between">
                      <div className="h-8 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-lg animate-pulse w-1/3" />
                      <div className="h-11 w-24 bg-gray-200/60 dark:bg-[#1e293b]/60 rounded-xl animate-pulse" />
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1e293b] mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-[#64748b]">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-[#94A3B8] text-lg font-medium">{t("vehicles.no_results")}</p>
              <p className="text-gray-400 dark:text-[#64748b] text-sm mt-2">Essayez de modifier vos filtres</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                    className="group bg-[#edf0f5] dark:bg-[#0f1729] rounded-[18px] overflow-hidden shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-xl dark:hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] cursor-pointer card-3d relative flex flex-col"
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
                      className="h-[280px] bg-cover bg-center relative overflow-hidden"
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
                      {/* Bottom fade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#edf0f5]/90 dark:from-[#0f1729]/95 via-transparent to-transparent pointer-events-none" />

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
                          className="px-3 py-1 rounded-full bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm text-[#6d7da2] dark:text-[#94A3B8] text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                        >
                          {t("vehicles.available_badge")}
                        </motion.span>
                      </div>

                      {/* Price floating on image */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 + 0.3 }}
                          className="bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                        >
                          <span className="text-[18px] font-extrabold text-[#1f4276] dark:text-[#f39c12]">{v.pricePerDay.toLocaleString()} DH</span>
                        </motion.div>
                      </div>

                      {/* Quick view overlay on hover */}
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
                      className="p-6 relative z-10 flex flex-col flex-1"
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06 + 0.15 }}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-[24px] font-extrabold text-[#1f4276] dark:text-[#D5DEEF] leading-tight transition-colors duration-300 group-hover:text-[#f39c12]">
                          {v.marque} {v.model}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-[14px] text-gray-500 dark:text-[#94A3B8]">
                        {v.year} &bull; {t("vehicles.automatic")}
                      </p>
                      <div className="flex items-center gap-4 mt-5 text-[13px] text-gray-600 dark:text-[#94A3B8] flex-wrap flex-1">
                        <span className="flex items-center gap-1.5 bg-[#e2e6ed] dark:bg-[#1e293b]/80 px-3 py-1.5 rounded-lg">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#637093] dark:text-[#94A3B8]">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {v.Occupants} {t("vehicles.seats")}
                        </span>
                          <span className="flex items-center gap-1.5 bg-[#e2e6ed] dark:bg-[#1e293b]/80 px-3 py-1.5 rounded-lg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#637093] dark:text-[#94A3B8]">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                            {v.fuelType}
                          </span>
                          {!!v.air_conditioner && (
                            <span className="flex items-center gap-1.5 bg-[#e2e6ed] dark:bg-[#1e293b]/80 px-3 py-1.5 rounded-lg">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#637093] dark:text-[#94A3B8]">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              </svg>
                              {t("vehicles.air_conditioner")}
                            </span>
                          )}
                          {!!v.gps && (
                            <span className="flex items-center gap-1.5 bg-[#e2e6ed] dark:bg-[#1e293b]/80 px-3 py-1.5 rounded-lg">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#637093] dark:text-[#94A3B8]">
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" />
                              </svg>
                              GPS
                            </span>
                          )}
                        </div>

                        {/* Animated bottom accent bar on hover */}
                        <motion.div
                          className="mt-5 border-t border-[#d5deeF]/50 dark:border-[#1e293b]/80 pt-5 flex items-center justify-between relative overflow-hidden"
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
                            router.push(`/vehicles/${v.id}`);
                          }}
                          className="relative overflow-hidden h-11 px-7 rounded-xl bg-gradient-to-r from-[#f39c12] to-[#e67e22] text-white dark:text-[#0f1729] text-[13px] font-bold tracking-wide transition-all duration-300 shadow-[0_4px_12px_rgba(243,156,18,0.2)] dark:shadow-[0_4px_12px_rgba(243,156,18,0.3)] hover:shadow-[0_8px_25px_rgba(243,156,18,0.35)] shimmer-btn"
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
        </section>



      </div>
    </RequireClient>
  );
}