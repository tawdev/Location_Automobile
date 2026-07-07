"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Plus, Pencil, Trash2, X, AlertCircle, ChevronDown,
  MapPin, MoreHorizontal
} from "lucide-react";
import type { Country, City } from "@/lib/types";
import {
  getAdminCountries,
  createAdminCountry,
  updateAdminCountry,
  deleteAdminCountry,
} from "@/lib/adminCountriesApi";
import {
  createAdminCity,
  updateAdminCity,
  deleteAdminCity,
} from "@/lib/adminCitiesApi";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function getErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: string }).message);
  }
  return fallback;
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-1/4" />
        <div className="h-4 bg-[#F0F3FA] rounded-md w-1/3" />
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3FA]/50 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-3xl mb-6 shadow-sm">
          <Globe className="w-8 h-8 text-[#638ECB]" />
        </div>
        <h3 className="text-lg font-black text-[#395886] mb-2">
          {t("admin.no_countries")}
        </h3>
        <p className="text-sm font-bold text-[#638ECB] mb-6 max-w-xs">
          {t("admin.no_countries_desc")}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("admin.add_country")}
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminCountriesPage() {
  const { t } = useI18n();
  const [countries, setCountries] = useState<Country[]>([]);
  const [citiesMap, setCitiesMap] = useState<Record<number, City[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingCityId, setDeletingCityId] = useState<number | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openCityMenuId, setOpenCityMenuId] = useState<number | null>(null);

  // Country modal
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryModalMode, setCountryModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [countryFormName, setCountryFormName] = useState("");
  const [countrySubmitting, setCountrySubmitting] = useState(false);
  const [countryFormError, setCountryFormError] = useState<string | null>(null);

  // City modal
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [cityModalMode, setCityModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityFormName, setCityFormName] = useState("");
  const [cityFormCountryId, setCityFormCountryId] = useState<number | null>(null);
  const [citySubmitting, setCitySubmitting] = useState(false);
  const [cityFormError, setCityFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const countriesData = await getAdminCountries();

      // Defensive: handle API returning { data: [...] } instead of [...] ,
      // or null/undefined, which previously crashed .map/.length/.reduce
      // and produced an unhandled render error in production.
      const safeCountries: Country[] = Array.isArray(countriesData)
        ? countriesData
        : Array.isArray((countriesData as any)?.data)
          ? (countriesData as any).data
          : [];

      setCountries(safeCountries);

      const grouped: Record<number, City[]> = {};
      for (const country of safeCountries) {
        if (country && Array.isArray(country.cities)) {
          grouped[country.id] = country.cities;
        }
      }
      setCitiesMap(grouped);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load data"));
      setCountries([]);
      setCitiesMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreateCountryModal() {
    setCountryModalMode("create");
    setEditingCountry(null);
    setCountryFormName("");
    setCountryFormError(null);
    setCountryModalOpen(true);
  }

  function openEditCountryModal(country: Country) {
    setCountryModalMode("edit");
    setEditingCountry(country);
    setCountryFormName(country.name);
    setCountryFormError(null);
    setCountryModalOpen(true);
  }

  function closeCountryModal() {
    setCountryModalOpen(false);
    setCountryModalMode(null);
    setEditingCountry(null);
  }

  async function handleCountrySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!countryFormName.trim()) return;
    setCountrySubmitting(true);
    setCountryFormError(null);
    try {
      if (countryModalMode === "create") {
        await createAdminCountry(countryFormName.trim());
      } else if (countryModalMode === "edit" && editingCountry) {
        await updateAdminCountry(editingCountry.id, countryFormName.trim());
      }
      closeCountryModal();
      await loadData();
    } catch (e) {
      setCountryFormError(getErrorMessage(e, "Failed to save country"));
    } finally {
      setCountrySubmitting(false);
    }
  }

  async function handleDeleteCountry(countryId: number) {
    setDeletingId(countryId);
    setError(null);
    try {
      await deleteAdminCountry(countryId);
      await loadData();
    } catch (e) {
      setError(getErrorMessage(e, "Failed to delete country"));
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateCityModal(countryId: number) {
    setCityModalMode("create");
    setEditingCity(null);
    setCityFormName("");
    setCityFormCountryId(countryId);
    setCityFormError(null);
    setCityModalOpen(true);
  }

  function openEditCityModal(city: City) {
    setCityModalMode("edit");
    setEditingCity(city);
    setCityFormName(city.name);
    setCityFormCountryId(city.country_id);
    setCityFormError(null);
    setCityModalOpen(true);
  }

  function closeCityModal() {
    setCityModalOpen(false);
    setCityModalMode(null);
    setEditingCity(null);
    setCityFormCountryId(null);
  }

  async function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !cityFormName.trim() ||
      cityFormCountryId === null ||
      Number.isNaN(cityFormCountryId)
    ) {
      return;
    }
    setCitySubmitting(true);
    setCityFormError(null);
    try {
      if (cityModalMode === "create") {
        await createAdminCity(cityFormCountryId, cityFormName.trim());
      } else if (cityModalMode === "edit" && editingCity) {
        await updateAdminCity(editingCity.id, cityFormName.trim(), cityFormCountryId ?? editingCity.country_id);
      }
      closeCityModal();
      await loadData();
    } catch (e) {
      setCityFormError(getErrorMessage(e, "Failed to save city"));
    } finally {
      setCitySubmitting(false);
    }
  }

  async function handleDeleteCity(cityId: number) {
    setDeletingCityId(cityId);
    setError(null);
    try {
      await deleteAdminCity(cityId);
      await loadData();
    } catch (e) {
      setError(getErrorMessage(e, "Failed to delete city"));
    } finally {
      setDeletingCityId(null);
    }
  }

  function toggleExpand(countryId: number) {
    setExpandedCountry(expandedCountry === countryId ? null : countryId);
    setOpenCityMenuId(null);
  }

  const totalCountries = countries.length;
  const totalCities = Object.values(citiesMap).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
              {t("admin.countries_title")}
            </h1>
          </div>
          <button
            type="button"
            onClick={openCreateCountryModal}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("admin.add_country")}
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#D5DEEF]/60 px-5 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#395886]" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE]">
              {t("admin.total_countries")}
            </div>
            <div className="text-xl font-black text-[#395886] tabular-nums">
              {totalCountries}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#D5DEEF]/60 px-5 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#395886]" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B0C4DE]">
              {t("admin.total_cities")}
            </div>
            <div className="text-xl font-black text-[#395886] tabular-nums">
              {totalCities}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <EmptyState onCreate={openCreateCountryModal} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {countries.map((country) => {
              const countryCities = citiesMap[country.id] || [];
              const isExpanded = expandedCountry === country.id;
              return (
                <motion.div
                  key={country.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300"
                >
                  {/* Country header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleExpand(country.id)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-[#395886]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
                          {country.name}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F3FA] text-[#638ECB] border border-[#D5DEEF]/50">
                          #{country.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-bold text-[#638ECB]">
                        <MapPin className="w-3 h-3" />
                        {countryCities.length} {countryCities.length <= 1 ? t("admin.city") : t("admin.cities")}
                      </div>
                    </div>

                    {/* Desktop country actions */}
                    <div className="hidden md:flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEditCountryModal(country)}
                        className="h-9 px-4 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-xs hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t("admin.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateCityModal(country.id)}
                        className="h-9 px-4 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-xs hover:bg-[#F0F3FA] hover:border-[#638ECB]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t("admin.add_city")}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === country.id}
                        onClick={() => handleDeleteCountry(country.id)}
                        className="h-9 px-4 rounded-xl border border-rose-200 text-rose-600 font-extrabold text-xs hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === country.id ? "..." : t("admin.delete")}
                      </button>
                    </div>

                    {/* Mobile dropdown */}
                    <div className="relative md:hidden shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === country.id ? null : country.id)}
                        className="h-9 w-9 rounded-xl border border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center justify-center cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === country.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] bg-white rounded-2xl border border-[#D5DEEF]/70 shadow-lg py-1.5 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => { setOpenMenuId(null); openEditCountryModal(country); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                              {t("admin.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setOpenMenuId(null); openCreateCityModal(country.id); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              {t("admin.add_city")}
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === country.id}
                              onClick={() => { setOpenMenuId(null); handleDeleteCountry(country.id); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingId === country.id ? "..." : t("admin.delete")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="shrink-0 text-[#B0C4DE]"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Cities section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#D5DEEF]/50 mx-4" />
                        <div className="p-4 pt-3 space-y-2">
                          {countryCities.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-sm font-bold text-[#B0C4DE]">
                                {t("admin.no_cities_in_country")}
                              </p>
                              <button
                                type="button"
                                onClick={() => openCreateCityModal(country.id)}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#638ECB] hover:text-[#395886] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                {t("admin.add_city")}
                              </button>
                            </div>
                          ) : (
                            countryCities.map((city) => (
                              <div
                                key={city.id}
                                className="flex items-center gap-3 rounded-2xl bg-[#F0F3FA]/60 border border-[#D5DEEF]/40 px-4 py-2.5 group hover:bg-[#F0F3FA] transition-colors"
                              >
                                <MapPin className="w-4 h-4 text-[#638ECB] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-bold text-[#395886]">
                                    {city.name}
                                  </span>
                                </div>

                                {/* Desktop city actions */}
                                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditCityModal(city)}
                                    className="h-7 w-7 rounded-lg text-[#638ECB] hover:bg-white hover:text-[#395886] transition-all flex items-center justify-center cursor-pointer"
                                    title={t("admin.edit")}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deletingCityId === city.id}
                                    onClick={() => handleDeleteCity(city.id)}
                                    className="h-7 w-7 rounded-lg text-rose-400 hover:bg-white hover:text-rose-600 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
                                    title={t("admin.delete")}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Mobile city actions */}
                                <div className="relative md:hidden shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setOpenCityMenuId(openCityMenuId === city.id ? null : city.id)}
                                    className="h-7 w-7 rounded-lg text-[#638ECB] hover:bg-white transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                  {openCityMenuId === city.id && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setOpenCityMenuId(null)} />
                                      <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] bg-white rounded-2xl border border-[#D5DEEF]/70 shadow-lg py-1.5 overflow-hidden">
                                        <button
                                          type="button"
                                          onClick={() => { setOpenCityMenuId(null); openEditCityModal(city); }}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                                        >
                                          <Pencil className="w-4 h-4" />
                                          {t("admin.edit")}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={deletingCityId === city.id}
                                          onClick={() => { setOpenCityMenuId(null); handleDeleteCity(city.id); }}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          {deletingCityId === city.id ? "..." : t("admin.delete")}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Country Modal */}
      <AnimatePresence>
        {countryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeCountryModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 shadow-[0_20px_60px_rgba(57,88,134,0.12)] max-w-lg w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#395886]" />
                  </div>
                  <h2 className="text-xl font-black text-[#395886]">
                    {countryModalMode === "create"
                      ? t("admin.add_country")
                      : t("admin.edit_country")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCountryModal}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#638ECB] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCountrySubmit} className="flex flex-col gap-5">
                {countryFormError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {countryFormError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                    {t("admin.country_name")}
                  </label>
                  <input
                    className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                    placeholder={t("admin.country_name_placeholder")}
                    value={countryFormName}
                    onChange={(e) => setCountryFormName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={countrySubmitting || !countryFormName.trim()}
                    className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {countrySubmitting
                      ? t("admin.loading")
                      : countryModalMode === "create"
                        ? t("admin.create")
                        : t("admin.save")}
                  </button>
                  <button
                    type="button"
                    onClick={closeCountryModal}
                    className="h-11 px-6 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-sm hover:bg-[#F0F3FA] transition-all active:scale-95 cursor-pointer"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Modal */}
      <AnimatePresence>
        {cityModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeCityModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-[#D5DEEF]/60 shadow-[0_20px_60px_rgba(57,88,134,0.12)] max-w-lg w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#395886]" />
                  </div>
                  <h2 className="text-xl font-black text-[#395886]">
                    {cityModalMode === "create"
                      ? t("admin.add_city")
                      : t("admin.edit_city")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCityModal}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#638ECB] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCitySubmit} className="flex flex-col gap-5">
                {cityFormError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {cityFormError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#638ECB]">
                    {t("admin.city_name")}
                  </label>
                  <input
                    className="h-11 rounded-xl border border-[#D5DEEF] bg-white px-4 text-sm font-bold text-[#395886] placeholder:text-[#B0C4DE] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/30 focus:border-[#638ECB] transition-all"
                    placeholder={t("admin.city_name_placeholder")}
                    value={cityFormName}
                    onChange={(e) => setCityFormName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={citySubmitting || !cityFormName.trim()}
                    className="flex-1 h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:bg-[#2D4670] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {citySubmitting
                      ? t("admin.loading")
                      : cityModalMode === "create"
                        ? t("admin.create")
                        : t("admin.save")}
                  </button>
                  <button
                    type="button"
                    onClick={closeCityModal}
                    className="h-11 px-6 rounded-xl border border-[#D5DEEF] text-[#395886] font-extrabold text-sm hover:bg-[#F0F3FA] transition-all active:scale-95 cursor-pointer"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}