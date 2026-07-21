"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Category, Marque, Vehicle } from "@/lib/types";
import { getBrandLogo } from "@/lib/brandLogos";
import Image from "next/image";
import { getPublicMarques } from "@/lib/marquesApi";
import {
  deleteAdminVehicle,
  createAdminVehicle,
  updateAdminVehicle,
  type AdminVehiclePayload,
  getAdminVehicles as getAdminVehiclesAll,
} from "@/lib/adminVehiclesApi";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { getAdminDepartureConditions, syncVehicleConditions } from "@/lib/departureConditionsApi";
import type { DepartureCondition } from "@/lib/departureConditionsApi";
import { vehicleImageUrl } from "@/lib/media";
import { Modal } from "@/components/admin/Modal";
import { CategoriesManagerModal } from "@/components/admin/CategoriesManagerModal";
import { isAuthError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { fetchCountries, fetchCitiesByCountry } from "@/lib/locationApi";
import type { Country, City } from "@/lib/types";

// Dynamic reliable car images for Seeding
const DEMO_CAR_IMAGES = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", // Porsche
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", // Chevrolet
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80", // Audi
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // SUV
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80", // Blue car
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80", // Ferrari
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", // White car
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80", // Sport car
];

// Reusable SVG Icons
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// Loading Skeleton Row
function SkeletonRow() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse flex items-center gap-4 p-4">
      <div className="w-20 h-20 rounded-2xl bg-[#F0F3FA] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-1/4" />
        <div className="h-4 bg-[#F0F3FA] rounded-md w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
        <div className="h-9 w-20 rounded-xl bg-[#F0F3FA]" />
      </div>
    </div>
  );
}

// Empty State View
function EmptyState({ onCreate, onSeed, seeding, seedProgress }: { onCreate: () => void; onSeed: () => void; seeding: boolean; seedProgress: { done: number; total: number } }) {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3FA]/50 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-3xl mb-6 shadow-sm">
          🚗
        </div>
        <h3 className="font-extrabold text-[#395886] text-2xl tracking-tight">{t("admin.no_vehicles")}</h3>
<p className="mt-3 text-[#638ECB] text-sm font-semibold leading-relaxed">
              {t("admin.no_vehicles_desc")}
            </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onCreate}
            className="px-6 py-3 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-sm transition-all hover:shadow-md active:scale-95 cursor-pointer"
          >
            ✨ Ajouter un véhicule
          </button>
          <button
            type="button"
            onClick={onSeed}
            disabled={seeding}
            className="px-6 py-3 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#395886] font-bold text-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {seeding ? `Génération ${seedProgress.done}/${seedProgress.total}...` : "⚡ Générer une flotte de démo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Vehicle Row View
interface VehicleRowProps {
  vehicle: Vehicle;
  categoryName?: string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
  countryName?: string;
  cityName?: string;
  currentCountryName?: string;
  currentCityName?: string;
}

function VehicleRow({
  vehicle,
  categoryName,
  onView,
  onEdit,
  onDelete,
  deleting,
  countryName,
  cityName,
  currentCountryName,
  currentCityName,
}: VehicleRowProps) {
  const { t } = useI18n();
  const [openMenu, setOpenMenu] = useState(false);
  const picturePath = vehicle.pictures?.[0]?.path;

  return (
    <div className="group flex items-center gap-4 rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_4px_20px_rgba(99,142,203,0.10)] transition-all duration-300 p-4">
      {/* Small Image */}
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F0F3FA] border border-[#D5DEEF]/40 shrink-0">
        {picturePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicleImageUrl(picturePath)}
            alt={`${vehicle.marque} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-[#638ECB]/50 text-[10px]">
            {t("admin.no_image")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-[#395886] text-base leading-tight truncate">
            {vehicle.marque}
          </h4>
          <span className="text-[10px] font-bold text-[#395886] bg-[#F0F3FA] px-2 py-0.5 rounded-md border border-[#D5DEEF]/50 shrink-0">
            #{vehicle.id}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-[#638ECB]">
          <span>{vehicle.year}</span>
          <span className="text-[#D5DEEF]">|</span>
          <span>{vehicle.km.toLocaleString()} km</span>
          <span className="text-[#D5DEEF]">|</span>
          <span>{vehicle.Occupants} places</span>
          <span className="text-[#D5DEEF]">|</span>
          <span>⛽ {vehicle.fuelType}</span>
          {!!vehicle.transmission && (
            <>
              <span className="text-[#D5DEEF]">|</span>
              <span>⚙️ {vehicle.transmission}</span>
            </>
          )}
          {!!vehicle.air_conditioner && <span className="text-green-600">❄️ Climatisation</span>}
          {!!vehicle.gps && <span className="text-green-600">📍 GPS</span>}
          {categoryName && (
            <>
              <span className="text-[#D5DEEF]">|</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F0F3FA] text-[#395886] text-[10px] font-bold border border-[#D5DEEF]/50">
                {categoryName}
              </span>
            </>
          )}
          {(currentCountryName || currentCityName) && (
            <>
              <span className="text-[#D5DEEF]">|</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F0F3FA] text-[#395886] text-[10px] font-bold border border-[#D5DEEF]/50">
                📍 {currentCityName || currentCountryName || ""}{currentCityName && currentCountryName ? `, ${currentCountryName}` : ""}
              </span>
            </>
          )}
        </div>
        <div className="mt-1">
          <span className="text-lg font-black text-[#395886]">{vehicle.pricePerDay} MAD</span>
          <span className="text-[10px] font-bold text-[#638ECB] ml-1">{t("admin.price_per_day_label")}</span>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onView(vehicle.id)}
          className="h-9 px-4 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <EyeIcon />
          <span>{t("admin.view")}</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(vehicle.id)}
          className="h-9 px-4 rounded-xl bg-[#638ECB]/10 hover:bg-[#638ECB]/20 text-[#638ECB] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <EditIcon />
          <span>{t("admin.edit")}</span>
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(vehicle.id)}
          className="h-9 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <TrashIcon />
          <span>{deleting ? "..." : t("admin.delete")}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className="relative md:hidden shrink-0">
        <button
          type="button"
          onClick={() => setOpenMenu(!openMenu)}
          className="h-9 w-9 rounded-xl border border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center justify-center cursor-pointer"
        >
          <MoreIcon />
        </button>
        {openMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] bg-white rounded-2xl border border-[#D5DEEF]/70 shadow-lg py-1.5 overflow-hidden">
              <button
                type="button"
                onClick={() => { setOpenMenu(false); onView(vehicle.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
              >
                <EyeIcon />
                Voir
              </button>
              <button
                type="button"
                onClick={() => { setOpenMenu(false); onEdit(vehicle.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#395886] hover:bg-[#F0F3FA] transition-colors cursor-pointer"
              >
                <EditIcon />
                {t("admin.edit")}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => { setOpenMenu(false); onDelete(vehicle.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <TrashIcon />
                {deleting ? "..." : t("admin.delete")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Interactive Custom Modals
interface VehicleCreateEditModalProps {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initial?: Vehicle | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (payload: AdminVehiclePayload, images: File[], deletedImageIds?: number[], conditionIds?: number[]) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

function VehicleCreateEditModal({
  open,
  mode,
  loading,
  initial,
  categories,
  onClose,
  onSubmit,
  submitting,
  error,
}: VehicleCreateEditModalProps) {
  const [marques, setMarques] = useState<Marque[]>([]);
  const [marque, setMarque] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [registration, setRegistration] = useState("");
  const [km, setKm] = useState<number>(0);
  const [pricePerDay, setPricePerDay] = useState<number>(0);
  const [protectionPricePercentage, setProtectionPricePercentage] = useState<number>(0);
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [occupants, setOccupants] = useState("");
  const [airConditioner, setAirConditioner] = useState(false);
  const [gps, setGps] = useState(false);
  const [order, setOrder] = useState<number>(0);
  const [deviceId, setDeviceId] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCities, setCurrentCities] = useState<City[]>([]);
  const [currentCountryId, setCurrentCountryId] = useState<number | null>(null);
  const [currentCityId, setCurrentCityId] = useState<number | null>(null);

  const [locationType, setLocationType] = useState("");
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // Departure conditions
  const [allConditions, setAllConditions] = useState<DepartureCondition[]>([]);
  const [selectedConditionIds, setSelectedConditionIds] = useState<number[]>([]);
  const [conditionsLoading, setConditionsLoading] = useState(false);

  const sortedCategories = useMemo(() => categories.slice().sort((a, b) => a.id - b.id), [categories]);

  useEffect(() => {
    getPublicMarques().then(setMarques).catch(() => {});
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentCountryId) {
      fetchCitiesByCountry(currentCountryId).then(setCurrentCities).catch(() => setCurrentCities([]));
    } else {
      setCurrentCities([]);
    }
    setCurrentCityId(null);
  }, [currentCountryId]);

  useEffect(() => {
    if (!open) return;
    setMarque(initial?.marque ?? "");
    setModel(initial?.model ?? "");
    setYear(initial?.year ?? new Date().getFullYear());
    // Load departure conditions
    setConditionsLoading(true);
    getAdminDepartureConditions().then((conds) => {
      setAllConditions(conds);
      if (initial && (initial as any).departure_conditions) {
        setSelectedConditionIds((initial as any).departure_conditions.map((c: any) => c.id));
      } else {
        setSelectedConditionIds([]);
      }
    }).catch(() => {}).finally(() => setConditionsLoading(false));
    setRegistration(initial?.registration ?? "");
    setKm(initial?.km ?? 0);
    setPricePerDay(initial?.pricePerDay ?? 0);
    setProtectionPricePercentage(initial?.protection_price_percentage ?? 0);
    setFuelType(initial?.fuelType ?? "");
    setTransmission(initial?.transmission ?? "");
    setCategoryId(initial?.category_id ?? 0);
    setOccupants(initial?.Occupants ?? "");
    setAirConditioner(initial?.air_conditioner ?? false);
    setGps(initial?.gps ?? false);
    setOrder(initial?.order ?? 0);
    setDeviceId(initial?.device_id ?? "");
    setCurrentCountryId(initial?.current_country_id ?? null);
    setCurrentCityId(initial?.current_city_id ?? null);
    setLocationType(initial?.location_type ?? "");
    setImagesFiles([]);
    setUploadError(null);
    setPreviewUrls([]);
    setDeletedImageIds([]);
  }, [open, initial]);

  useEffect(() => {
    const urls = imagesFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imagesFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setUploadError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} n'est pas une image.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} dépasse la limite de 5 Mo.`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length) {
      setUploadError(errors.join(" • "));
    }
    setImagesFiles((prev) => [...prev, ...validFiles].slice(0, 6));
  };

  const removeSelectedImage = (idx: number) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const allFiles = [...imagesFiles];
    const condIds = selectedConditionIds;

    await onSubmit(
      {
        marque: marque.trim(),
        model: model.trim(),
        year,
        registration: registration.trim(),
        km,
        pricePerDay,
        protection_percentage: initial?.protection_percentage ?? 0,
        protection_price_percentage: protectionPricePercentage,
        fuelType: fuelType.trim(),
        transmission: transmission || undefined,
        category_id: categoryId,
        Occupants: occupants.trim(),
        air_conditioner: airConditioner,
        gps: gps,
        order: order,
        device_id: deviceId.trim() || undefined,
        current_country_id: currentCountryId,
        current_city_id: currentCityId,
        location_type: locationType || null,
      },
      allFiles,
      deletedImageIds.length > 0 ? deletedImageIds : undefined,
      condIds
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? t("admin.add_to_fleet") : t("admin.edit_specs")}
      maxWidthClassName="max-w-3xl"
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#395886]" />
          <span className="text-[#395886] font-bold text-sm mt-3">{t("admin.loading_details")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input fields with customized slate theme */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.brand")}</label>
              <div className="flex items-center gap-3">
                <select
                  required
                  className="flex-1 rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                >
                  <option value="">{t("admin.select_brand")}</option>
                  {marques.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
                {marque && (() => {
                  const logoSrc = getBrandLogo(marque);
                  if (!logoSrc) return null;
                  return (
                    <div className="w-9 h-9 rounded-full bg-white border border-[#D5DEEF] flex items-center justify-center p-1.5 shrink-0">
                      <Image src={logoSrc} alt={marque} width={24} height={24} className="w-full h-full object-contain" unoptimized />
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.model")}</label>
              <input
                type="text"
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="ex. C-Class"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.year")}</label>
              <input
                type="number"
                required
                min={1900}
                max={new Date().getFullYear()}
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.registration")}</label>
              <input
                type="text"
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="ex. AX-789-BB"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.km")}</label>
              <input
                type="number"
                required
                min={0}
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.price_per_day")}</label>
              <input
                type="number"
                required
                min={0}
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">
                Protection Price %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={protectionPricePercentage}
                onChange={(e) => setProtectionPricePercentage(Number(e.target.value))}
              />
              <span className="text-[10px] text-[#638ECB] font-semibold">
                Gold: 150 + 15% = {Math.round(150 + 150 * protectionPricePercentage / 100)} DH/j &nbsp;|&nbsp; Platinum: 300 + 30% = {Math.round(300 + 300 * protectionPricePercentage / 100)} DH/j
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.fuel_type")}</label>
              <select
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="">{t("admin.select_fuel")}</option>
                <option value="Electricity">{t("admin.fuel_electric")}</option>
                <option value="Diesel">{t("admin.fuel_diesel")}</option>
                <option value="Gasoline">{t("admin.fuel_gasoline")}</option>
                <option value="hybrid">{t("admin.fuel_hybrid")}</option>
                <option value="LPG">{t("admin.fuel_lpg")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("transmission")}</label>
              <select
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="">--</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.category")}</label>
              <select
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value="">{t("admin.select_category")}</option>
                {sortedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.occupants")}</label>
              <input
                type="text"
                required
                placeholder="ex. 5"
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={occupants}
                onChange={(e) => setOccupants(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-6 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={airConditioner}
                  onChange={(e) => setAirConditioner(e.target.checked)}
                  className="w-5 h-5 rounded border-[#D5DEEF] text-[#395886] focus:ring-[#638ECB]"
                />
                <span className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.air_conditioning")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gps}
                  onChange={(e) => setGps(e.target.checked)}
                  className="w-5 h-5 rounded border-[#D5DEEF] text-[#395886] focus:ring-[#638ECB]"
                />
                <span className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.gps_checkbox")}</span>
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.display_order")}</label>
              <input
                type="number"
                min={0}
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="ex. 1"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.gps_device")}</label>
              <input
                type="text"
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder={t("admin.gps_device_placeholder") ?? ""}
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.current_country")}</label>
              <select
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={currentCountryId ?? ""}
                onChange={(e) => setCurrentCountryId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t("admin.select_country")}</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.current_city")}</label>
              <select
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={currentCityId ?? ""}
                onChange={(e) => setCurrentCityId(e.target.value ? Number(e.target.value) : null)}
                disabled={!currentCountryId}
              >
                <option value="">{t("admin.select_city")}</option>
                {currentCities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">{t("admin.pickup_location_type")}</label>
              <select
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
              >
                <option value="">{t("admin.select_location_type")}</option>
                <option value="airport">{t("admin.location_airport")}</option>
                <option value="citycenter">{t("admin.location_citycenter")}</option>
              </select>
            </div>

            {/* Existing Pictures (edit mode) */}
            {mode === "edit" && initial?.pictures && initial.pictures.length > 0 && (
              <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">
                    {t("admin.current_images")}
                  </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {initial.pictures
                    .filter((pic) => !deletedImageIds.includes(pic.id))
                    .map((pic) => (
                      <div key={pic.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D5DEEF] group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vehicleImageUrl(pic.path)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setDeletedImageIds((prev) => [...prev, pic.id])}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity duration-200"
                        >
                          {t("admin.delete_image")}
                        </button>
                      </div>
                    ))}
                </div>
                {deletedImageIds.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    <span>{t("admin.images_deleted", { count: String(deletedImageIds.length) })}</span>
                    <button
                      type="button"
                      onClick={() => setDeletedImageIds([])}
                      className="ml-auto underline hover:text-rose-800 cursor-pointer"
                    >
                      {t("admin.undo_delete")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">
                {mode === "edit" ? t("admin.replace_images") : t("admin.images")}
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                  dragActive
                    ? "border-[#395886] bg-[#D5DEEF]/40"
                    : "border-[#D5DEEF] bg-[#F0F3FA]/20 hover:bg-[#F0F3FA]/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="text-2xl mb-2">📸</span>
                <span className="text-sm font-bold text-[#395886]">{t("admin.drag_drop")}</span>
                <span className="text-xs text-[#638ECB] mt-1">{t("admin.drag_drop_hint")}</span>
              </div>

              {uploadError && (
                <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5 mt-2">
                  {uploadError}
                </div>
              )}

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D5DEEF] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedImage(idx);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity duration-200"
                      >
                        {t("admin.remove_image")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Departure Conditions */}
          <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">
                {t("admin.vehicle_condition")}
              </label>
            {conditionsLoading ? (
              <div className="text-xs font-bold text-[#638ECB]">{t("admin.loading")}</div>
            ) : allConditions.length === 0 ? (
              <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                {t("admin.no_conditions")}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allConditions.map((cond) => {
                  const selected = selectedConditionIds.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => {
                        setSelectedConditionIds((prev) =>
                          prev.includes(cond.id)
                            ? prev.filter((id) => id !== cond.id)
                            : [...prev, cond.id]
                        );
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                        selected
                          ? "border-[#395886] bg-[#F0F3FA] text-[#395886]"
                          : "border-[#D5DEEF] text-[#638ECB] hover:border-[#638ECB]"
                      }`}
                    >
                      {selected ? "✓ " : ""}{cond.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#D5DEEF]/40">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 rounded-xl border border-[#D5DEEF] bg-white text-[#395886] font-bold text-sm transition-all hover:bg-[#F0F3FA] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#395886] text-white font-bold text-sm transition-all hover:bg-[#395886]/90 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Enregistrement..." : mode === "create" ? "Ajouter à la flotte" : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// Vehicle View Detail Modal
interface VehicleViewModalProps {
  open: boolean;
  vehicle: Vehicle | null;
  categoryName?: string;
  onClose: () => void;
  onRemove: (id: number) => void;
  removing: boolean;
  countryName?: string;
  cityName?: string;
  currentCountryName?: string;
  currentCityName?: string;
}

function VehicleViewModal({
  open,
  vehicle,
  categoryName,
  onClose,
  onRemove,
  removing,
  countryName,
  cityName,
  currentCountryName,
  currentCityName,
}: VehicleViewModalProps) {
  const { t } = useI18n();
  const pictures = vehicle?.pictures ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (open) setActiveIdx(0);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vehicle ? t("admin.vehicle_overview", { brand: vehicle.marque, model: vehicle.model }) : "Détails du véhicule"}
      maxWidthClassName="max-w-4xl"
    >
      {!vehicle ? (
        <div className="py-12 text-center text-sm font-bold text-[#638ECB]">
          {t("admin.no_vehicle_specs")}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Gallery Section */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <div className="bg-[#F0F3FA] rounded-2xl overflow-hidden aspect-[16/10] border border-[#D5DEEF] shadow-inner relative flex items-center justify-center">
                {pictures.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vehicleImageUrl(pictures[activeIdx]?.path)}
                    alt="Active vehicle view"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="text-sm font-bold text-[#638ECB]/70">{t("admin.no_image_available")}</div>
                )}
              </div>

              {/* Thumbnails */}
              {pictures.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {pictures.map((pic, idx) => (
                    <button
                      key={pic.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`relative w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        idx === activeIdx
                          ? "border-[#395886] ring-2 ring-[#638ECB]/50"
                          : "border-[#D5DEEF] opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vehicleImageUrl(pic.path)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Details Section */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="px-3 py-1.5 rounded-xl bg-[#F0F3FA] border border-[#D5DEEF]/50 text-xs font-black text-[#395886] inline-block">
                    {categoryName ?? t("admin.class_standard")}
                  </span>
                  <h3 className="text-2xl font-black text-[#395886] mt-2 leading-tight">
                    {vehicle.marque}
                  </h3>
                  <p className="text-sm font-bold text-[#638ECB]">
                    {vehicle.model} ({vehicle.year})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0F3FA]/40 border border-[#D5DEEF]/40 grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.fuel")}</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.fuelType}</span>
                  </div>
                  {!!vehicle.transmission && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("transmission")}</span>
                      <span className="text-sm font-bold text-slate-800">{vehicle.transmission}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.registration_label")}</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.registration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.km_label")}</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.km.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.seats_label")}</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.Occupants} {t("admin.occupants_label")}</span>
                  </div>
                  {!!vehicle.air_conditioner && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.air_conditioning")}</span>
                      <span className="text-sm font-bold text-green-600">{t("admin.included")}</span>
                    </div>
                  )}
                  {!!vehicle.gps && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.gps_checkbox")}</span>
                      <span className="text-sm font-bold text-green-600">{t("admin.included")}</span>
                    </div>
                  )}
                  {(currentCountryName || currentCityName) && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">{t("admin.current_position")}</span>
                      <span className="text-sm font-bold text-slate-800">{currentCityName || ""}{currentCityName && currentCountryName ? ", " : ""}{currentCountryName || ""}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#D5DEEF]/40 pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-black text-[#395886]">{t("admin.daily_rate")}</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#395886]">{vehicle.pricePerDay} MAD</span>
                    <span className="text-[#638ECB] text-xs font-bold ml-1">{t("admin.price_per_day_label")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-[#D5DEEF]/30">
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => onRemove(vehicle.id)}
                  className="w-full py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold transition-all disabled:opacity-50 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <TrashIcon />
                  <span>{removing ? "Suppression..." : "Retirer le véhicule"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// MAIN PAGE COMPONENT
export default function AdminVehiclesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  // Category Manager Modal state
  const [categoriesManagerOpen, setCategoriesManagerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Seeding States
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    marque: "",
    model: "",
    fuelType: "",
    transmission: "",
    Occupants: "",
  });

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
  const [viewRemoving, setViewRemoving] = useState(false);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const allVehiclesRef = useRef<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);

  const countryById = useMemo(() => new Map(allCountries.map((c) => [c.id, c.name])), [allCountries]);
  const cityNameById = useMemo(() => {
    const map = new Map<number, string>();
    allCountries.forEach((c) => c.cities?.forEach((ct) => map.set(ct.id, ct.name)));
    return map;
  }, [allCountries]);

  function applyFilters() {
    let result = allVehiclesRef.current;

    if (selectedCategoryId > 0) {
      result = result.filter((v) => v.category_id === selectedCategoryId);
    }

    const mq = filters.marque.trim().toLowerCase();
    if (mq) {
      result = result.filter((v) => v.marque.toLowerCase().includes(mq));
    }

    const md = filters.model.trim().toLowerCase();
    if (md) {
      result = result.filter((v) => v.model.toLowerCase().includes(md));
    }

    if (filters.fuelType.trim()) {
      result = result.filter((v) => v.fuelType === filters.fuelType);
    }

    if (filters.transmission.trim()) {
      result = result.filter((v) => v.transmission === filters.transmission);
    }

    if (filters.Occupants.trim()) {
      result = result.filter((v) => v.Occupants === filters.Occupants);
    }

    setVehicles(result.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()));
  }

  async function loadCategories() {
    setCategoriesError(null);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (e: unknown) {
      let msg = "Échec du chargement des catégories";
      if (e && typeof e === "object") {
        const err = e as Record<string, unknown>;
        if (typeof err.message === "string") msg = err.message;
        if (typeof err.status === "number") msg += ` (status: ${err.status})`;
      } else if (typeof e === "string") {
        msg = e;
      }
      setCategoriesError(msg);
    }
  }

  async function loadVehicles() {
    setLoading(true);
    setError(null);
    try {
      const full = await getAdminVehiclesAll();
      allVehiclesRef.current = full;
      setAllVehicles(full);
    } catch (e) {
      if (isAuthError(e)) {
        router.replace("/login");
        return;
      }
      const apiErr = e as { message?: string; status?: number; url?: string };
      console.error("[admin/vehicles] loadVehicles failed", { error: apiErr });
      const details = apiErr.status ? ` (HTTP ${apiErr.status})` : "";
      const msg = apiErr.message || "Échec du chargement des véhicules";
      setError(`${msg}${details}`);
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadCategories();
      await loadVehicles();
      applyFilters();
    })();
    fetchCountries().then(setAllCountries).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetFilters() {
    setFilters({
      marque: "",
      model: "",
      fuelType: "",
      transmission: "",
      Occupants: "",
    });
  }

  // CRUD Operations callbacks
  async function onDelete(vehicleId: number) {
    setDeletingId(vehicleId);
    setError(null);
    try {
      await deleteAdminVehicle(vehicleId);
      await loadVehicles();
      applyFilters();
    } catch (e) {
      const msg = (e as { message?: string })?.message || "Échec de la suppression du véhicule";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function onCreateSubmit(payload: AdminVehiclePayload, images: File[], deletedImageIds?: number[], conditionIds?: number[]) {
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const newVehicle = await createAdminVehicle({ ...payload, images: images.length ? images : undefined });
      if (conditionIds && conditionIds.length > 0 && newVehicle?.id) {
        await syncVehicleConditions(newVehicle.id, conditionIds);
      }
      setCreateOpen(false);
      await loadVehicles();
      applyFilters();
    } catch (e) {
      const msg = (e as { message?: string })?.message || "Échec de la création du véhicule";
      setCreateError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  }

  function onOpenEdit(vehicleId: number) {
    setEditOpen(true);
    setEditLoading(false);
    setEditError(null);
    const found = allVehiclesRef.current.find((v) => v.id === vehicleId) ?? null;
    setEditVehicle(found);
  }

  async function onEditSubmit(payload: AdminVehiclePayload, images: File[], deletedImageIds?: number[], conditionIds?: number[]) {
    if (!editVehicle) return;

    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateAdminVehicle(editVehicle.id, {
        ...payload,
        images: images.length ? images : undefined,
        deletedImages: deletedImageIds,
      });
      if (conditionIds !== undefined) {
        await syncVehicleConditions(editVehicle.id, conditionIds);
      }
      setEditOpen(false);
      await loadVehicles();
      applyFilters();
    } catch (e) {
      const msg = (e as { message?: string })?.message || "Échec de l'enregistrement des modifications.";
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  }

  function onOpenView(vehicleId: number) {
    setViewOpen(true);
    setViewVehicle(null);
    const found = allVehiclesRef.current.find((v) => v.id === vehicleId) ?? null;
    setViewVehicle(found);
  }

  async function onRemoveFromView(vehicleId: number) {
    setViewRemoving(true);
    try {
      await onDelete(vehicleId);
      setViewOpen(false);
    } finally {
      setViewRemoving(false);
    }
  }

  // Demo seeder helper
  async function fetchImageFile(url: string, filename: string): Promise<File> {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  }

  async function seedDemoVehicles(total = 6) {
    setSeeding(true);
    setError(null);
    setSeedProgress({ done: 0, total });

    try {
      let cats = await getAdminCategories();
      if (cats.length === 0) {
        setError("Veuillez définir au moins une catégorie avant de générer des véhicules de démonstration.");
        setSeeding(false);
        return;
      }

      const modelsMap: Record<string, string[]> = {
        Mercedes: ["C-Class", "E-Class", "GLA"],
        BMW: ["3 Series", "X5", "i4"],
        Audi: ["A4", "Q7", "e-tron"],
        Tesla: ["Model 3", "Model Y"],
        Renault: ["Clio", "Captur", "Zoe"],
        Toyota: ["Yaris", "RAV4", "Corolla"],
      };

      const marques = Object.keys(modelsMap);
      const fuelTypes = ["Gasoline", "Diesel", "Electricity", "hybrid"];
      const transmissionTypes = ["Automatic", "Manual"];

      for (let i = 0; i < total; i++) {
        setSeedProgress({ done: i, total });

        const marque = marques[i % marques.length];
        const model = modelsMap[marque][Math.floor(Math.random() * modelsMap[marque].length)];
        const year = 2018 + Math.floor(Math.random() * 8);
        const registration = `AB-${100 + i * 15}-CD`;
        const km = Math.floor(Math.random() * 95000);
        const pricePerDay = Math.floor(60 + Math.random() * 140);
        const fuel = fuelTypes[i % fuelTypes.length];
        const cat = cats[i % cats.length];
        const occupants = "5";

        const imageFiles: File[] = [];
        try {
          const imgUrl = DEMO_CAR_IMAGES[i % DEMO_CAR_IMAGES.length];
          const imgFile = await fetchImageFile(imgUrl, `demo-car-${i}.jpg`);
          imageFiles.push(imgFile);
        } catch {
          // Ignore failures
        }

        await createAdminVehicle({
          marque,
          model,
          year,
          registration,
          km,
          pricePerDay,
          fuelType: fuel,
          transmission: transmissionTypes[i % transmissionTypes.length],
          category_id: cat.id,
          Occupants: occupants,
          air_conditioner: Math.random() > 0.3,
          gps: Math.random() > 0.5,
          images: imageFiles,
        });
      }

      await loadVehicles();
      applyFilters();
    } catch (e) {
      setError("Échec de la génération automatique de la flotte.");
    } finally {
      setSeeding(false);
      setSeedProgress({ done: 0, total: 0 });
    }
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-6">
      {/* ── Header + Filtres fusionné ── */}
      <div className="bg-white rounded-3xl border border-[#D5DEEF] overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#395886] tracking-tight">
                {t("admin.vehicle_list_title")}
              </h1>
              <p className="text-xs font-semibold text-[#638ECB] mt-0.5">
                {t("admin.vehicle_count", { count: String(vehicles.length) })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="h-10 px-4 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-xs transition-all hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-sm leading-none">+</span> Ajouter
              </button>
              <button
                type="button"
                onClick={() => setCategoriesManagerOpen(true)}
                className="h-10 px-4 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#395886] font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <SettingsIcon /> Catégories
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`h-10 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  filterOpen
                    ? "bg-[#395886] text-white shadow-sm"
                    : "border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#395886]"
                }`}
              >
                <SearchIcon />
                Filtres
              </button>
            </div>
          </div>

          {filterOpen && (
            <div className="mt-5 pt-5 border-t border-[#D5DEEF]">
              {/* Catégories */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#395886] uppercase tracking-wider">
                  <span>{t("admin.categories")}</span>
                  <span className="h-5 px-2 bg-[#F0F3FA] text-[#395886] rounded-md text-[10px] font-black flex items-center justify-center">
                    {categories.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] font-bold text-[#638ECB] hover:text-[#395886] cursor-pointer px-2 py-1 rounded-lg hover:bg-[#F0F3FA] transition-colors"
                >
                  {t("admin.clear")}
                </button>
              </div>

              {categoriesError && (
                <div className="mb-4 p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700">
                  ⚠️ {categoriesError}
                </div>
              )}

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(0)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedCategoryId === 0
                      ? "bg-[#395886] text-white shadow-md"
                      : "bg-white text-[#638ECB] border border-[#D5DEEF] hover:bg-[#F0F3FA] hover:text-[#395886]"
                  }`}
                >
                  📁 Toutes
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedCategoryId === cat.id
                        ? "bg-[#395886] text-white shadow-md"
                        : "bg-[#F0F3FA] text-[#638ECB] hover:bg-[#D5DEEF] hover:text-[#395886]"
                    }`}
                  >
                    📄 {cat.name}
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#D5DEEF]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#395886]">{t("admin.brand")}</label>
                    <input
                      type="text"
                      className="rounded-xl border border-[#D5DEEF] bg-transparent px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                      placeholder="ex. BMW"
                      value={filters.marque}
                      onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#395886]">{t("admin.model")}</label>
                    <input
                      type="text"
                      className="rounded-xl border border-[#D5DEEF] bg-transparent px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                      placeholder="ex. Clio"
                      value={filters.model}
                      onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#395886]">{t("admin.fuel")}</label>
                    <select
                      className="rounded-xl border border-[#D5DEEF] bg-transparent px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#395886]/20 focus:border-[#395886] outline-none transition-colors"
                      value={filters.fuelType}
                      onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                    >
                      <option value="">{t("admin.all")}</option>
                      <option value="Electricity">{t("admin.fuel_electric")}</option>
                      <option value="Diesel">{t("admin.fuel_diesel")}</option>
                      <option value="Gasoline">{t("admin.fuel_gasoline")}</option>
                      <option value="hybrid">{t("admin.fuel_hybrid")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#395886]">{t("transmission")}</label>
                    <select
                      className="rounded-xl border border-[#D5DEEF] bg-transparent px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#395886]/20 focus:border-[#395886] outline-none transition-colors"
                      value={filters.transmission}
                      onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                    >
                      <option value="">{t("admin.all")}</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#395886]">{t("admin.seats")}</label>
                    <input
                      type="text"
                      className="rounded-xl border border-[#D5DEEF] bg-transparent px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] outline-none"
                      placeholder="ex. 5"
                      value={filters.Occupants}
                      onChange={(e) => setFilters({ ...filters, Occupants: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="h-9 px-5 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95"
                  >
                    <SearchIcon /> Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* ── Vehicles List ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          onCreate={() => setCreateOpen(true)}
          onSeed={() => seedDemoVehicles(6)}
          seeding={seeding}
          seedProgress={seedProgress}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {vehicles.map((v) => (
            <VehicleRow
              key={v.id}
              vehicle={v}
              categoryName={categoryById.get(v.category_id)}
              countryName={v.country_id ? countryById.get(v.country_id) : undefined}
              cityName={v.city_id ? cityNameById.get(v.city_id) : undefined}
              currentCountryName={v.current_country_id ? countryById.get(v.current_country_id) : undefined}
              currentCityName={v.current_city_id ? cityNameById.get(v.current_city_id) : undefined}
              onView={onOpenView}
              onEdit={onOpenEdit}
              onDelete={onDelete}
              deleting={deletingId === v.id}
            />
          ))}
        </div>
      )}

      {/* Reusable Category Manager Modal */}
      <CategoriesManagerModal
        open={categoriesManagerOpen}
        onClose={() => setCategoriesManagerOpen(false)}
        categories={categories}
        onRefresh={loadCategories}
      />

      {/* Vehicle Create/Edit Modals */}
      <VehicleCreateEditModal
        open={createOpen}
        mode="create"
        loading={false}
        categories={categories}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        onSubmit={onCreateSubmit}
        submitting={createSubmitting}
        error={createError}
      />

      <VehicleCreateEditModal
        open={editOpen}
        mode="edit"
        loading={editLoading}
        initial={editVehicle}
        categories={categories}
        onClose={() => {
          setEditOpen(false);
          setEditError(null);
          setEditVehicle(null);
        }}
        onSubmit={onEditSubmit}
        submitting={editSubmitting}
        error={editError}
      />

      {/* Vehicle View Modal */}
      <VehicleViewModal
        open={viewOpen}
        vehicle={viewVehicle}
        categoryName={viewVehicle ? categoryById.get(viewVehicle.category_id) : undefined}
        countryName={viewVehicle?.country_id ? countryById.get(viewVehicle.country_id) : undefined}
        cityName={viewVehicle?.city_id ? cityNameById.get(viewVehicle.city_id) : undefined}
        currentCountryName={viewVehicle?.current_country_id ? countryById.get(viewVehicle.current_country_id) : undefined}
        currentCityName={viewVehicle?.current_city_id ? cityNameById.get(viewVehicle.current_city_id) : undefined}
        onClose={() => setViewOpen(false)}
        onRemove={onRemoveFromView}
        removing={viewRemoving}
      />
    </div>
  );
}
