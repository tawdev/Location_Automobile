"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RequireClient } from "@/components/RequireClient";
import { filterVehicles, listVehicles } from "@/lib/vehiclesApi";
import type { Vehicle } from "@/lib/types";
import { vehicleImageUrl } from "@/lib/media";
import { Search } from "lucide-react";
import BackButton from "@/components/BackButton";
import HomeMap from "@/components/HomeMap";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const NEW_COUNT = 10;

type VehiclesQuery = {
  marque?: string;
  model?: string;
  Occupants?: string;
  fuelType?: string;
  min_price?: number;
  max_price?: number;
};

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

  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  useEffect(() => {
    if (returnDate && pickupDate && returnDate < pickupDate) {
      setReturnDate("");
    }
  }, [pickupDate]);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "SUV", "Sports"];

  const hasAnyFilter = useMemo(() => {
    return Boolean(
      query.marque || query.model || query.Occupants || query.fuelType ||
      query.min_price !== undefined || query.max_price !== undefined
    );
  }, [query]);

  async function loadInitial() {
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
  }

  async function onFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      };
      const data = await filterVehicles(params);
      setVehicles(data);
    } catch (e) {
      const msg = (e as { message?: string })?.message || t("vehicles.error_filter");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => { void loadInitial(); }, 0);
    return () => clearTimeout(id);
  }, []);

  const filteredVehicles = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    return list.filter(vehicle => {
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
    });
  }, [vehicles, selectedCategory, searchQuery]);

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const refs = cardsRef.current;
    const handlers: (() => void)[] = [];
    refs.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rx = ((y - cy) / cy) * -8;
        const ry = ((x - cx) / cx) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
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

  return (
    <RequireClient>
      <div className="bg-[#f6f6f8] dark:bg-[#070b14] overflow-hidden transition-colors duration-500">
        <style>{`
          html { scroll-behavior: smooth; }
          ::selection { background: #1f4276/30; color: #fff; }
          .dark ::selection { background: #f39c12/40; color: #fff; }
          .noise-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 256px 256px;
          }
          @keyframes float-drift {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(15px, -15px); }
            50% { transform: translate(30px, 0); }
            75% { transform: translate(15px, 15px); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.12); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.5; }
          }
          @keyframes border-shimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.6; transform: scale(1.3); }
          }
          @keyframes drive {
            0% { transform: translateX(-120%) translateY(0); }
            50% { transform: translateX(50vw) translateY(-8px); }
            100% { transform: translateX(120vw) translateY(0); }
          }
          @keyframes scroll-indicator {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(6px); opacity: 1; }
          }
          .shimmer-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
            background-size: 200% 100%;
            animation: shimmer 2.5s infinite;
            pointer-events: none;
            border-radius: inherit;
          }
          .input-focus-ring:focus-within {
            box-shadow: 0 0 0 3px rgba(31,66,118,0.12), 0 0 20px rgba(31,66,118,0.06);
            border-color: rgba(31,66,118,0.25);
          }
          .dark .input-focus-ring:focus-within {
            box-shadow: 0 0 0 3px rgba(243,156,18,0.15), 0 0 25px rgba(243,156,18,0.08);
            border-color: rgba(243,156,18,0.3);
          }
          .card-3d {
            transform-style: preserve-3d;
            perspective: 1200px;
          }
          .card-3d > * {
            transform-style: preserve-3d;
          }
          .dark ::-webkit-scrollbar-track { background: #0f1729; }
          .dark ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        `}</style>

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
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-30 dark:opacity-40"
            style={{
              background: 'linear-gradient(-45deg, #1f4276, #4c6797, #f39c12, #1f4276)',
              backgroundSize: '400% 400%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
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
              initial={{ opacity: 0, x: -20 }}
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

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 pt-16 pb-28" style={{ zoom: 0.85 }}>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="text-center text-white text-[56px] md:text-[64px] font-extrabold tracking-[-0.04em] drop-shadow-2xl"
            >
              <span className="relative inline-block">
                {t("vehicles.page_title")}
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-[#f39c12]/60 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  style={{ transformOrigin: 'left' }}
                />
              </span>
            </motion.h1>

            {/* Animated scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex justify-center mt-6"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-[#f39c12]"
                />
              </motion.div>
            </motion.div>

            {/* SEARCH CARD */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 max-w-[980px] mx-auto rounded-[24px] border border-white/30 dark:border-[#1e293b]/50 bg-white/25 dark:bg-[#0f1729]/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 relative overflow-hidden"
            >
              {/* Subtle inner glow */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f39c12]/5 dark:bg-[#f39c12]/[0.03] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1f4276]/5 dark:bg-[#1f4276]/[0.03] rounded-full blur-3xl pointer-events-none" />

              {/* Search */}
              <div className="mb-6 relative z-10">
                <label className="block text-[11px] uppercase tracking-[0.15em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2.5">
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
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
                    {t("vehicles.pickup_date")}
                  </label>
                  <div className="h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl flex items-center px-5 input-focus-ring transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b94a9" className="dark:stroke-[#64748b]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700 dark:text-[#D5DEEF] [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
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
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
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
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
                    {t("vehicles.category")}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-[52px] bg-white/70 dark:bg-[#1e293b]/50 border border-white/50 dark:border-[#1e293b]/60 rounded-xl px-5 outline-none text-[15px] text-gray-700 dark:text-[#D5DEEF] transition-all duration-300 focus:border-[#1f4276]/30 dark:focus:border-[#f39c12]/30 focus:shadow-[0_0_0_3px_rgba(31,66,118,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(243,156,18,0.1)]"
                  >
                    <option value="All">{t("vehicles.all")}</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">{t("vehicles.sport")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
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
                  <label className="block text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] dark:text-[#94A3B8] mb-2">
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
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 25px rgba(31,66,118,0.3)" }}
                  whileTap={{ scale: 0.96 }}
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
          <motion.svg viewBox="0 0 1200 80" className="w-full h-full text-[#f6f6f8] dark:text-[#070b14] fill-current" preserveAspectRatio="none">
            <motion.path
              d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
              animate={{ d: [
                "M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z",
                "M0,40 C200,0 400,80 600,40 C800,0 1000,80 1200,40 L1200,80 L0,80 Z",
                "M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z",
              ]}}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>

        {/* FEATURED */}
        <section className="max-w-[1280px] mx-auto px-8 pb-28 -mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 dark:bg-[#f39c12]/15 px-4 py-2 rounded-full border border-[#f39c12]/20 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-pulse" />
                Notre Flotte
              </span>
              <h2 className="text-[46px] md:text-[52px] font-extrabold tracking-[-0.03em] text-[#1f4276] dark:text-[#D5DEEF] leading-[1.05]">
                {t("vehicles.featured_title")}
              </h2>
              <p className="mt-3 text-[16px] text-gray-500 dark:text-[#94A3B8] max-w-xl">
                {t("vehicles.featured_subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-[#e8ebf0] dark:bg-[#1e293b]/60 rounded-full">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-5 h-9 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#1f4276] dark:bg-[#f39c12] text-white dark:text-[#0f1729] shadow-[0_4px_12px_rgba(31,66,118,0.25)] dark:shadow-[0_4px_12px_rgba(243,156,18,0.25)]"
                      : "text-gray-600 dark:text-[#94A3B8] hover:text-[#1f4276] dark:hover:text-[#D5DEEF]"
                  }`}
                >
                  {cat === "All" ? t("vehicles.all") : cat === "Sports" ? t("vehicles.sport") : cat}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
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
                  initial={{ opacity: 0, y: 20 }}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVehicles.map((v, idx) => {
                const picturePath = v.pictures?.[0]?.path;
                const isNew = idx < NEW_COUNT;

                return (
                  <motion.div
                    key={v.id}
                    ref={(el) => { cardsRef.current[idx] = el; }}
                    initial={{ opacity: 0, y: 50, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -8, boxShadow: "0 25px 60px rgba(31,66,118,0.15)" }}
                    onClick={() => router.push(`/vehicles/${v.id}`)}
                    className="group bg-[#edf0f5] dark:bg-[#0f1729] rounded-[18px] overflow-hidden shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-xl dark:hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] cursor-pointer card-3d relative"
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

                    <motion.div
                      className="h-[280px] bg-cover bg-center relative overflow-hidden"
                      style={{
                        backgroundImage: picturePath
                          ? `url(${vehicleImageUrl(picturePath)})`
                          : "linear-gradient(135deg, #2a2e3a, #1c2033)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: picturePath
                            ? `url(${vehicleImageUrl(picturePath)})`
                            : undefined,
                        }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      {/* Bottom fade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#edf0f5]/90 dark:from-[#0f1729]/95 via-transparent to-transparent pointer-events-none" />

                      <div className="flex gap-2 absolute top-4 right-4 z-10">
                        {isNew && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: idx * 0.06 + 0.2, type: "spring", stiffness: 300 }}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold shadow-[0_4px_10px_rgba(34,197,94,0.3)]"
                          >
                            {t("vehicles.new_badge")}
                          </motion.span>
                        )}
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
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
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 + 0.3 }}
                          className="bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                        >
                          <span className="text-[18px] font-extrabold text-[#1f4276] dark:text-[#f39c12]">{v.pricePerDay.toLocaleString()} DH</span>
                          <span className="text-gray-500 dark:text-[#94A3B8] text-[11px] ml-1 font-medium">/jr</span>
                        </motion.div>
                      </div>

                      {/* Quick view overlay on hover */}
                      <motion.div
                        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0 }}
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
                    </motion.div>

                    <motion.div
                      className="p-6 relative z-10"
                      initial={{ opacity: 0 }}
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
                      <div className="flex items-center gap-4 mt-5 text-[13px] text-gray-600 dark:text-[#94A3B8]">
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
                      </div>

                      {/* Animated bottom accent bar on hover */}
                      <motion.div
                        className="mt-5 border-t border-[#d5deeF]/50 dark:border-[#1e293b]/80 pt-5 flex items-center justify-between relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#f39c12] to-[#e67e22]"
                          initial={{ width: '0%' }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                        <div className="leading-none">
                          <span className="text-[16px] text-gray-500 dark:text-[#94A3B8] font-medium">{t("vehicles.per_day")}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.06, boxShadow: "0 8px 20px rgba(243,156,18,0.3)" }}
                          whileTap={{ scale: 0.95 }}
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

          {!loading && filteredVehicles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
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
          )}
        </section>

        {/* ABOUT */}
        <section className="bg-[#f7f7fa] dark:bg-[#0b1121] py-28 border-t border-[#ebedf2] dark:border-[#1e293b]/60 relative overflow-hidden transition-colors duration-500">
          {/* Noise texture */}
          <div className="absolute inset-0 noise-bg pointer-events-none" />

          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#1f4276]/5 dark:border-[#f39c12]/5 pointer-events-none" style={{ animation: 'float-slow 12s ease-in-out infinite' }} />
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full border border-[#f39c12]/8 dark:border-[#638ECB]/8 pointer-events-none" style={{ animation: 'float-drift 15s ease-in-out infinite' }} />
          <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-[#1f4276]/10 dark:bg-[#f39c12]/10 pointer-events-none" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />

          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3 }}
                  >
                    <motion.div
                      className="text-[56px] font-extrabold text-[#1f4276] dark:text-[#f39c12] leading-none"
                      initial={{ opacity: 0, scale: 0.5 }}
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
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(31,66,118,0.12)" }}
                className="bg-white dark:bg-[#0f1729] rounded-[26px] shadow-[0_12px_35px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] h-[480px] flex items-center justify-center overflow-hidden relative transition-all duration-500"
              >
                {/* Subtle gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f7f7fa] to-white dark:from-[#0f1729] dark:to-[#0b1121] opacity-60 dark:opacity-100" />
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <svg width="260" height="170" viewBox="0 0 38 28" fill="none" className="mx-auto scale-[4]">
                      <path d="M4 20 C10 8, 28 8, 34 20" stroke="#1f4276" strokeWidth="3" fill="none" strokeLinecap="round" className="dark:stroke-[#D5DEEF]" />
                      <circle cx="10" cy="21" r="3" fill="#1f4276" className="dark:fill-[#D5DEEF]" />
                      <circle cx="28" cy="21" r="3" fill="#1f4276" className="dark:fill-[#D5DEEF]" />
                      <motion.path
                        d="M6 14 L32 14"
                        stroke="#f39c12"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        animate={{ strokeDashoffset: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      />
                    </svg>
                  </motion.div>
                  <div className="mt-14 text-[42px] font-black tracking-[-0.04em] text-[#1f4276] dark:text-[#D5DEEF]">
                    CAR<span className="text-[#f39c12]">FOR</span>FAR
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Long smooth gradient separator */}
        <div className="h-40 bg-gradient-to-b from-[#f7f7fa] via-[#fafafc] to-white dark:from-[#0b1121] dark:via-[#0a0f1d] dark:to-[#070b14] pointer-events-none" aria-hidden="true" />

        {/* LOCATION */}
        <div className="relative bg-white dark:bg-[#070b14]">
          {/* Soft gradient veil over top of map */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/60 to-transparent dark:from-[#070b14] dark:via-[#070b14]/60 dark:to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <HomeMap />
          {/* Soft gradient veil at bottom of map */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-white/60 to-white dark:from-transparent dark:via-[#070b14]/60 dark:to-[#070b14] z-10 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Bottom fade to page end */}
        <div className="h-24 bg-gradient-to-b from-white to-[#f6f6f8] dark:from-[#070b14] dark:to-[#070b14] pointer-events-none" aria-hidden="true" />

      </div>
    </RequireClient>
  );
}