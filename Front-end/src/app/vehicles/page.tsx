"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import { RequireAuth } from "@/components/RequireAuth";
import { filterVehicles, listVehicles } from "@/lib/vehiclesApi";
import type { Vehicle } from "@/lib/types";
import { vehicleImageUrl } from "@/lib/media";
import { Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
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
      const msg = e instanceof Error ? e.message : "Failed to load vehicles";
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
      const msg = e instanceof Error ? e.message : "Filtering failed";
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

  return (
    <RequireAuth>
      <div className="bg-[#f6f6f8] overflow-hidden">

        {/* HERO */}
        <section
          className="relative min-h-[500px] overflow-hidden bg-cover bg-center flex items-start"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.20), rgba(255,255,255,0.60)), url('/CarBackGround.png')",
          }}
        >
          <div className="absolute top-6 left-8 z-20">
            <BackButton />
          </div>
          <div
            className="absolute bottom-0 left-0 w-full h-[120px]"
            style={{ background: "linear-gradient(to bottom, rgba(246,246,248,0), rgba(246,246,248,1))" }}
          />

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 pt-12 pb-16" style={{ zoom: 0.85 }}>
            <h1 className="text-center text-white text-[48px] font-extrabold tracking-[-0.04em] drop-shadow-lg">
              R&eacute;servez votre v&eacute;hicule au Maroc
            </h1>

            {/* SEARCH CARD */}
            <div className="mt-10 max-w-[980px] mx-auto rounded-[24px] border border-white/30 bg-white/30 backdrop-blur-xl shadow-2xl p-8">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-[11px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                  Rechercher
                </label>
                <div className="h-[50px] bg-white/60 border border-white/40 rounded-xl flex items-center px-5">
                  <Search className="w-[18px] h-[18px] text-[#8b94a9]" />
                  <input
                    type="text"
                    placeholder="Rechercher par mod&egrave;le..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Date d&eacute;part
                  </label>
                  <div className="h-[50px] bg-white/60 border border-white/40 rounded-xl flex items-center px-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b94a9">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Date retour
                  </label>
                  <div className="h-[50px] bg-white/60 border border-white/40 rounded-xl flex items-center px-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b94a9">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-transparent outline-none ml-3 w-full text-[15px] text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BMW, Mercedes..."
                    value={query.marque ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, marque: e.target.value }))}
                    className="w-full h-[50px] bg-white/60 border border-white/40 rounded-xl px-5 outline-none text-[15px] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Cat&eacute;gorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-[50px] bg-white/60 border border-white/40 rounded-xl px-5 outline-none text-[15px] text-gray-700"
                  >
                    <option value="All">Toutes</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Sport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Prix min
                  </label>
                  <input
                    type="number"
                    placeholder="0 DH"
                    value={query.min_price ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, min_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-[50px] bg-white/60 border border-white/40 rounded-xl px-5 outline-none text-[15px] text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-black text-[12px] uppercase tracking-[0.12em] font-bold text-[#637093] mb-2">
                    Prix max
                  </label>
                  <input
                    type="number"
                    placeholder="1000 DH"
                    value={query.max_price ?? ""}
                    onChange={(e) => setQuery((q) => ({ ...q, max_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-[50px] bg-white/60 border border-white/40 rounded-xl px-5 outline-none text-[15px] text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={onFilterSubmit}
                  disabled={loading}
                  className="h-[50px] px-10 rounded-xl bg-[#4c6797] hover:bg-[#395784] transition text-white text-[14px] font-semibold flex items-center gap-3 disabled:opacity-50"
                >
                  <Search className="w-[17px] h-[17px]" />
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="max-w-[1280px] mx-auto px-8 pb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[46px] font-extrabold tracking-[-0.03em] text-[#1f4276]">
                S&eacute;lection Vedette
              </h2>
              <p className="mt-2 text-[16px] text-gray-500">
                Des v&eacute;hicules de luxe choisis pour votre voyage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 h-10 rounded-full text-[13px] font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-[#89a8df] text-white"
                      : "bg-[#ececf1] text-gray-700 hover:bg-[#dde0e8]"
                  }`}
                >
                  {cat === "All" ? "Toutes" : cat === "Sports" ? "Sport" : cat}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#1f4276] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVehicles.map((v, idx) => {
                const picturePath = v.pictures?.[0]?.path;
                const isNew = idx < NEW_COUNT;

                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                    whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(31,66,118,0.12)" }}
                    onClick={() => router.push(`/vehicles/${v.id}`)}
                    className="group bg-[#edf0f5] rounded-[18px] overflow-hidden shadow-sm cursor-pointer origin-top"
                  >
                    <motion.div
                      className="h-[280px] bg-cover bg-center relative"
                      style={{
                        backgroundImage: picturePath
                          ? `url(${vehicleImageUrl(picturePath)})`
                          : "linear-gradient(135deg, #2a2e3a, #1c2033)",
                      }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#edf0f5]/80 via-transparent to-transparent pointer-events-none" />
                      <div className="flex gap-2 absolute top-4 right-4">
                        {isNew && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.06 + 0.2 }}
                            className="px-3 py-1 rounded-full bg-green-500 text-white text-[11px] font-bold"
                          >
                            Nouveau
                          </motion.span>
                        )}
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06 + 0.3 }}
                          className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#6d7da2] text-[11px] font-bold"
                        >
                          Disponible
                        </motion.span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="p-6"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06 + 0.15 }}
                    >
                      <h3 className="text-[28px] font-extrabold text-[#1f4276] leading-tight">
                        {v.marque} {v.model}
                      </h3>
                      <p className="mt-2 text-[14px] text-gray-500">
                        {v.year} &bull; Automatique
                      </p>
                      <div className="flex items-center gap-8 mt-6 text-[13px] text-gray-600">
                        <span className="flex items-center gap-1.5">&#128100; {v.Occupants} places</span>
                        <span className="flex items-center gap-1.5">&#9971; {v.fuelType}</span>
                      </div>

                      <div className="mt-6 border-t border-[#d5deeF]/60 pt-5 flex items-center justify-between">
                        <div className="leading-none">
                          <span className="text-[34px] font-extrabold text-[#1f4276]">{v.pricePerDay} DH</span>
                          <span className="text-gray-500 text-[14px] ml-1">/ jour</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/vehicles/${v.id}`);
                          }}
                          className="h-11 px-6 rounded-xl border border-[#f39c12] text-[#f39c12] text-[13px] font-semibold hover:bg-[#f39c12] hover:text-white hover:scale-105 transition-all duration-200"
                        >
                          R&eacute;server
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun v&eacute;hicule trouv&eacute;.</p>
            </div>
          )}
        </section>

        {/* ABOUT */}
        <section className="bg-[#f7f7fa] py-24 border-t border-[#ebedf2]">
          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#7385a9]">Excellence en Mouvement</div>
              <h2 className="mt-4 text-[56px] leading-[1.05] font-extrabold text-[#1f4276]">
                &Agrave; propos de Marrakech Elite Mobility
              </h2>
              <p className="mt-8 text-[18px] leading-[1.9] text-gray-600">
                Chez Marrakech Elite Mobility, nous red&eacute;finissons les standards du voyage de luxe
                &agrave; travers le Maroc. Notre engagement va au-del&agrave; de la fourniture d&rsquo;un v&eacute;hicule&nbsp;;
                nous offrons un service de conciergerie automobile complet adapt&eacute; aux voyageurs les plus exigeants.
              </p>
              <p className="mt-8 text-[18px] leading-[1.9] text-gray-600">
                Avec une flotte m&eacute;ticuleusement s&eacute;lectionn&eacute;e allant des plus beaux grands
                tourisme du monde aux SUV ultra-luxueux, nous veillons &agrave; ce que chaque kilom&egrave;tre de
                votre voyage marocain soit caract&eacute;ris&eacute; par un prestige sans effort et un confort
                sophistiqu&eacute;.
              </p>

              <div className="flex gap-20 mt-16">
                <div>
                  <div className="text-[60px] font-extrabold text-[#1f4276]">15+</div>
                  <div className="text-[14px] uppercase tracking-[0.12em] text-gray-500">Ans de Luxe</div>
                </div>
                <div>
                  <div className="text-[60px] font-extrabold text-[#1f4276]">24/7</div>
                  <div className="text-[14px] uppercase tracking-[0.12em] text-gray-500">Conciergerie VIP</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[26px] shadow-[0_12px_35px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] h-[480px] flex items-center justify-center">
                <div className="text-center">
                  <svg width="260" height="170" viewBox="0 0 38 28" fill="none" className="mx-auto scale-[4]">
                    <path d="M4 20 C10 8, 28 8, 34 20" stroke="#1f4276" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="10" cy="21" r="3" fill="#1f4276" />
                    <circle cx="28" cy="21" r="3" fill="#1f4276" />
                    <path d="M6 14 L32 14" stroke="#2d7df6" strokeWidth="1.5" strokeDasharray="3 2" />
                  </svg>
                  <div className="mt-14 text-[42px] font-black tracking-[-0.04em] text-[#1f4276]">CARFORFAR</div>
                </div>
              </div>
              <div className="absolute -bottom-10 right-0 bg-[#dfe5f4] text-[#1f4276] text-[16px] font-semibold leading-[1.7] rounded-2xl p-8 shadow-xl max-w-[320px]">
                &laquo;&nbsp;Une attention in&eacute;gal&eacute;e aux d&eacute;tails dans chaque voyage.&nbsp;&raquo;
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="py-28">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="text-center">
              <h2 className="text-[56px] font-extrabold text-[#1f4276]">Notre Emplacement</h2>
              <p className="mt-3 text-[18px] text-gray-500">Visitez notre showroom &agrave; Marrakech.</p>
            </div>

            <div className="mt-16 h-[520px] rounded-[22px] border border-[#d7dbe5] bg-[#ececf1] flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#4b5563">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="mt-6 text-[30px] font-semibold text-gray-700">
                Avenue Mohammed V, Marrakech 40000, Maroc
              </div>
              <button className="mt-8 h-12 px-8 rounded-xl bg-[#1f4276] text-white text-[14px] font-semibold">
                Obtenir l&rsquo;itin&eacute;raire
              </button>
            </div>
          </div>
        </section>

      </div>
    </RequireAuth>
  );
}