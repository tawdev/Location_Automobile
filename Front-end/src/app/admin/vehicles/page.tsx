"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Category, Vehicle } from "@/lib/types";
import {
  deleteAdminVehicle,
  createAdminVehicle,
  updateAdminVehicle,
  type AdminVehiclePayload,
} from "@/lib/adminVehiclesApi";
import { getAdminVehicles as getAdminVehiclesAll } from "@/lib/adminVehiclesApi";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { filterVehicles } from "@/lib/vehiclesApi";
import { vehicleImageUrl } from "@/lib/media";
import { Modal } from "@/components/admin/Modal";
import { CategoriesManagerModal } from "@/components/admin/CategoriesManagerModal";

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

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#638ECB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#638ECB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SeatsIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#638ECB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

// Loading Skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-[#D5DEEF]/60 overflow-hidden shadow-sm animate-pulse p-4">
      <div className="bg-[#F0F3FA] aspect-[16/10] rounded-2xl w-full" />
      <div className="mt-4 space-y-3">
        <div className="h-5 bg-[#F0F3FA] rounded-md w-3/5" />
        <div className="h-4 bg-[#F0F3FA] rounded-md w-2/5" />
        <div className="pt-3 border-t border-[#D5DEEF]/40 grid grid-cols-3 gap-2">
          <div className="h-4 bg-[#F0F3FA] rounded" />
          <div className="h-4 bg-[#F0F3FA] rounded" />
          <div className="h-4 bg-[#F0F3FA] rounded" />
        </div>
      </div>
    </div>
  );
}

// Empty State View
function EmptyState({ onCreate, onSeed, seeding, seedProgress }: { onCreate: () => void; onSeed: () => void; seeding: boolean; seedProgress: { done: number; total: number } }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#D5DEEF]/60 bg-white p-12 text-center shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3FA]/50 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-3xl mb-6 shadow-sm">
          🚗
        </div>
        <h3 className="font-extrabold text-[#395886] text-2xl tracking-tight">No vehicles found</h3>
        <p className="mt-3 text-[#638ECB] text-sm font-semibold leading-relaxed">
          Start building your virtual automobile rental fleet by adding your first vehicle, or populate with high-quality demo data instantly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onCreate}
            className="px-6 py-3 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-sm transition-all hover:shadow-md active:scale-95 cursor-pointer"
          >
            ✨ Add First Vehicle
          </button>
          <button
            type="button"
            onClick={onSeed}
            disabled={seeding}
            className="px-6 py-3 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#395886] font-bold text-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {seeding ? `Seeding ${seedProgress.done}/${seedProgress.total}...` : "⚡ Seed Demo Fleet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Vehicle Card View
interface VehicleCardProps {
  vehicle: Vehicle;
  categoryName?: string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}

function VehicleCard({
  vehicle,
  categoryName,
  onView,
  onEdit,
  onDelete,
  deleting,
}: VehicleCardProps) {
  const picturePath = vehicle.pictures?.[0]?.path;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#D5DEEF]/70 bg-white hover:border-[#638ECB]/50 hover:shadow-[0_12px_40px_rgba(99,142,203,0.12)] transition-all duration-300 flex flex-col h-full">
      {/* Visual Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F0F3FA] border-b border-[#D5DEEF]/40">
        {picturePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicleImageUrl(picturePath)}
            alt={`${vehicle.marque} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-[#638ECB]/70 text-sm">
            No Image Provided
          </div>
        )}

        {/* Rating/Price badge */}
        <div className="absolute bottom-3 left-3 bg-[#395886]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
          <span className="text-[#f39c12]">★</span> 4.8
        </div>

        {/* Id tag */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-[#D5DEEF]/80 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#395886] shadow-sm">
          ID: {vehicle.id}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-[#395886] text-lg leading-tight truncate">
                {vehicle.marque}
              </h4>
              <p className="text-[#638ECB] text-xs font-semibold mt-0.5 truncate">
                {vehicle.model}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">Price / Day</span>
              <span className="text-lg font-black text-[#395886]">${vehicle.pricePerDay}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-[#F0F3FA] text-[#395886] text-xs font-bold border border-[#D5DEEF]/50">
              {categoryName ?? "Standard"}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F0F3FA] text-[#395886] text-xs font-bold border border-[#D5DEEF]/50">
              ⛽ {vehicle.fuelType}
            </span>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-2 py-3 mt-4 border-t border-[#D5DEEF]/40 text-[11px] font-bold text-[#638ECB]">
            <div className="flex items-center gap-1 bg-[#F0F3FA]/30 p-1.5 rounded-lg">
              <CalendarIcon />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F0F3FA]/30 p-1.5 rounded-lg truncate">
              <GaugeIcon />
              <span>{vehicle.km.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1 bg-[#F0F3FA]/30 p-1.5 rounded-lg">
              <SeatsIcon />
              <span>{vehicle.Occupants} seats</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#D5DEEF]/30">
          <button
            type="button"
            onClick={() => onView(vehicle.id)}
            className="py-2.5 px-2 rounded-xl bg-[#F0F3FA] hover:bg-[#D5DEEF] text-[#395886] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <EyeIcon />
            <span>View</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(vehicle.id)}
            className="py-2.5 px-2 rounded-xl bg-[#638ECB]/10 hover:bg-[#638ECB]/20 text-[#638ECB] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <EditIcon />
            <span>Edit</span>
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(vehicle.id)}
            className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
          >
            <TrashIcon />
            <span>{deleting ? "..." : "Delete"}</span>
          </button>
        </div>
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
  onSubmit: (payload: AdminVehiclePayload, images: File[]) => Promise<void>;
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
  const [marque, setMarque] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [registration, setRegistration] = useState("");
  const [km, setKm] = useState<number>(0);
  const [pricePerDay, setPricePerDay] = useState<number>(0);
  const [fuelType, setFuelType] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [occupants, setOccupants] = useState("");
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedCategories = useMemo(() => categories.slice().sort((a, b) => a.id - b.id), [categories]);

  useEffect(() => {
    if (!open) return;
    setMarque(initial?.marque ?? "");
    setModel(initial?.model ?? "");
    setYear(initial?.year ?? new Date().getFullYear());
    setRegistration(initial?.registration ?? "");
    setKm(initial?.km ?? 0);
    setPricePerDay(initial?.pricePerDay ?? 0);
    setFuelType(initial?.fuelType ?? "");
    setCategoryId(initial?.category_id ?? 0);
    setOccupants(initial?.Occupants ?? "");
    setImagesFiles([]);
    setUploadError(null);
    setPreviewUrls([]);
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
        errors.push(`${file.name} is not an image.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 5MB size limit.`);
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

    await onSubmit(
      {
        marque: marque.trim(),
        model: model.trim(),
        year,
        registration: registration.trim(),
        km,
        pricePerDay,
        fuelType: fuelType.trim(),
        category_id: categoryId,
        Occupants: occupants.trim(),
      },
      imagesFiles
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add Vehicle to Fleet" : `Edit Vehicle Specifications`}
      maxWidthClassName="max-w-3xl"
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#395886]" />
          <span className="text-[#395886] font-bold text-sm mt-3">Loading details...</span>
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
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Marque</label>
              <input
                type="text"
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="e.g. Mercedes"
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Model</label>
              <input
                type="text"
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="e.g. C-Class"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Year of Manufacture</label>
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
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Registration Number</label>
              <input
                type="text"
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                placeholder="e.g. AX-789-BB"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Milage (KM)</label>
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
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Rental Price ($/day)</label>
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
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Fuel Type</label>
              <select
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="">Select Fuel Type</option>
                <option value="Electricity">Electricity</option>
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Gasoline</option>
                <option value="hybrid">Hybrid</option>
                <option value="LPG">LPG</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Category</label>
              <select
                required
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value="">Select Category</option>
                {sortedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">Occupants (Seats Count)</label>
              <input
                type="text"
                required
                placeholder="e.g. 5"
                className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                value={occupants}
                onChange={(e) => setOccupants(e.target.value)}
              />
            </div>

            {/* Drag & Drop File Zone */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-[#395886] uppercase tracking-wider">
                {mode === "edit" ? "Replace Images (Optional)" : "Automobile Images"}
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
                <span className="text-sm font-bold text-[#395886]">Drag and drop files here</span>
                <span className="text-xs text-[#638ECB] mt-1">Supports PNG, JPG, WEBP (Max 5MB each, Limit 6)</span>
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
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#D5DEEF]/40">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 rounded-xl border border-[#D5DEEF] bg-white text-[#395886] font-bold text-sm transition-all hover:bg-[#F0F3FA] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#395886] text-white font-bold text-sm transition-all hover:bg-[#395886]/90 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Uploading Specifications..." : mode === "create" ? "Add to Fleet" : "Save Changes"}
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
}

function VehicleViewModal({
  open,
  vehicle,
  categoryName,
  onClose,
  onRemove,
  removing,
}: VehicleViewModalProps) {
  const pictures = vehicle?.pictures ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (open) setActiveIdx(0);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vehicle ? `Overview: ${vehicle.marque} ${vehicle.model}` : "Vehicle Details"}
      maxWidthClassName="max-w-4xl"
    >
      {!vehicle ? (
        <div className="py-12 text-center text-sm font-bold text-[#638ECB]">
          No vehicle specifications available.
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
                  <div className="text-sm font-bold text-[#638ECB]/70">No image available</div>
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
                    {categoryName ?? "Standard Class"}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">Fuel Engine</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">Registration</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.registration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">Milage (KM)</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.km.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#638ECB]/80 block">Seats Limit</span>
                    <span className="text-sm font-bold text-slate-800">{vehicle.Occupants} occupants</span>
                  </div>
                </div>

                <div className="border-t border-[#D5DEEF]/40 pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-black text-[#395886]">Rental Daily Rate</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#395886]">${vehicle.pricePerDay}</span>
                    <span className="text-[#638ECB] text-xs font-bold ml-1">USD/day</span>
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
                  <span>{removing ? "Removing..." : "Retire Automobile"}</span>
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
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  // Category Manager Modal state
  const [categoriesManagerOpen, setCategoriesManagerOpen] = useState(false);

  // Seeding States
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedProgress, setSeedProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    marque: "",
    model: "",
    fuelType: "",
    min_price: "",
    max_price: "",
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

  const hasAnyFilter = useMemo(() => {
    return Boolean(
      filters.marque.trim() ||
        filters.model.trim() ||
        filters.fuelType.trim() ||
        filters.min_price.trim() ||
        filters.max_price.trim() ||
        filters.Occupants.trim()
    );
  }, [filters]);

  async function loadCategories() {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }

  // Load vehicles and categories list
  async function loadList() {
    setLoading(true);
    setError(null);

    try {
      const full = await getAdminVehiclesAll();

      if (!hasAnyFilter) {
        const base =
          selectedCategoryId > 0 ? full.filter((v) => v.category_id === selectedCategoryId) : full;
        setVehicles(base);
        return;
      }

      const payload = {
        marque: filters.marque.trim() || undefined,
        model: filters.model.trim() || undefined,
        fuelType: filters.fuelType.trim() || undefined,
        min_price: filters.min_price.trim() ? Number(filters.min_price) : undefined,
        max_price: filters.max_price.trim() ? Number(filters.max_price) : undefined,
        Occupants: filters.Occupants.trim() || undefined,
      };

      const filtered = await filterVehicles(payload);
      const withCategory =
        selectedCategoryId > 0 ? filtered.filter((v) => v.category_id === selectedCategoryId) : filtered;

      setVehicles(withCategory);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load vehicles";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadCategories();
      await loadList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyFilter, selectedCategoryId]);

  async function applyFilters() {
    setApplyingFilters(true);
    try {
      await loadList();
    } finally {
      setApplyingFilters(false);
    }
  }

  function resetFilters() {
    setFilters({
      marque: "",
      model: "",
      fuelType: "",
      min_price: "",
      max_price: "",
      Occupants: "",
    });
  }

  // CRUD Operations callbacks
  async function onDelete(vehicleId: number) {
    setDeletingId(vehicleId);
    setError(null);
    try {
      await deleteAdminVehicle(vehicleId);
      await loadList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete vehicle";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function onCreateSubmit(payload: AdminVehiclePayload, images: File[]) {
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createAdminVehicle({ ...payload, images: images.length ? images : undefined });
      setCreateOpen(false);
      await loadList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create vehicle";
      setCreateError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function onOpenEdit(vehicleId: number) {
    setEditOpen(true);
    setEditLoading(true);
    setEditVehicle(null);
    setEditError(null);
    try {
      const all = await getAdminVehiclesAll();
      const found = all.find((v) => v.id === vehicleId) ?? null;
      setEditVehicle(found);
    } catch (e) {
      setEditError("Failed to fetch vehicle details.");
    } finally {
      setEditLoading(false);
    }
  }

  async function onEditSubmit(payload: AdminVehiclePayload, images: File[]) {
    if (!editVehicle) return;

    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateAdminVehicle(editVehicle.id, { ...payload, images: images.length ? images : undefined });
      setEditOpen(false);
      await loadList();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save updates.";
      setEditError(msg);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function onOpenView(vehicleId: number) {
    setViewOpen(true);
    setViewVehicle(null);
    try {
      const all = await getAdminVehiclesAll();
      const found = all.find((v) => v.id === vehicleId) ?? null;
      setViewVehicle(found);
    } catch (e) {
      setError("Failed to show details.");
    }
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
    setSeedError(null);
    setSeedProgress({ done: 0, total });

    try {
      let cats = await getAdminCategories();
      if (cats.length === 0) {
        setError("Please define at least one category before seeding demo vehicles.");
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
          category_id: cat.id,
          Occupants: occupants,
          images: imageFiles,
        });
      }

      await loadList();
    } catch (e) {
      setSeedError("Failed to auto-generate fleet.");
    } finally {
      setSeeding(false);
      setSeedProgress({ done: 0, total: 0 });
    }
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-6">
      {/* Header Container */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D5DEEF] bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA] to-transparent opacity-60 pointer-events-none" />

        <div className="relative flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D5DEEF] bg-white px-3 py-1 text-xs font-bold text-[#395886] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Control Hub
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-[#395886] tracking-tight leading-none">
            Automobile Fleet
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#638ECB] leading-relaxed max-w-xl">
            Configure vehicle specs, modify pricing structures, manage classifications, and monitor your entire active rental fleet in real-time.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-11 px-5 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-xs transition-all hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span className="text-sm">+</span> Add Vehicle
          </button>
          <button
            type="button"
            onClick={() => setCategoriesManagerOpen(true)}
            className="h-11 px-4.5 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#395886] font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <SettingsIcon /> Manage Categories
          </button>
          <button
            type="button"
            onClick={() => void seedDemoVehicles(6)}
            disabled={seeding || categories.length === 0}
            className="h-11 px-4 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#638ECB] font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {seeding ? `Seeding ${seedProgress.done}/${seedProgress.total}...` : "Seed Demo Fleet"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter / Category Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Categories card */}
          <div className="bg-white rounded-3xl border border-[#D5DEEF]/75 p-5 shadow-sm">
            <h3 className="font-extrabold text-sm text-[#395886] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Categories</span>
              <span className="h-5 px-2 bg-[#F0F3FA] text-[#395886] rounded-md text-[10px] font-black flex items-center justify-center">
                {categories.length}
              </span>
            </h3>

            <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(0)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategoryId === 0
                    ? "bg-[#395886] text-white shadow-md hover:bg-[#395886]/95"
                    : "text-[#638ECB] hover:text-[#395886] hover:bg-[#F0F3FA]"
                }`}
              >
                📁 All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? "bg-[#395886] text-white shadow-md hover:bg-[#395886]/95"
                      : "text-[#638ECB] hover:text-[#395886] hover:bg-[#F0F3FA]"
                  }`}
                >
                  📄 {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Filters Card */}
          <div className="bg-white rounded-3xl border border-[#D5DEEF]/75 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#D5DEEF]/40 pb-3">
              <h3 className="font-extrabold text-sm text-[#395886] uppercase tracking-wider">
                Filters
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-bold text-[#638ECB] hover:text-[#395886] cursor-pointer px-2 py-1 rounded-lg hover:bg-[#F0F3FA] transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Marque</label>
                <input
                  type="text"
                  className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                  placeholder="e.g. BMW"
                  value={filters.marque}
                  onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Model</label>
                <input
                  type="text"
                  className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
                  placeholder="e.g. Clio"
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Fuel</label>
                <select
                  className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/20 px-3 py-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#395886]/20 focus:border-[#395886] outline-none transition-colors"
                  value={filters.fuelType}
                  onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="hybrid">hybrid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Min Price</label>
                  <input
                    type="number"
                    min={0}
                    className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] outline-none"
                    placeholder="$0"
                    value={filters.min_price}
                    onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Max Price</label>
                  <input
                    type="number"
                    min={0}
                    className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3 py-2 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] outline-none"
                    placeholder="$500"
                    value={filters.max_price}
                    onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#395886]">Seats Limit</label>
                <input
                  type="text"
                  className="rounded-xl border border-[#D5DEEF] bg-[#F0F3FA]/30 px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#638ECB] outline-none"
                  placeholder="e.g. 5"
                  value={filters.Occupants}
                  onChange={(e) => setFilters({ ...filters, Occupants: e.target.value })}
                />
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="mt-2 w-full py-3 rounded-xl bg-[#395886] hover:bg-[#395886]/90 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95"
              >
                <SearchIcon /> Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Grid list */}
        <div className="lg:col-span-3">
          {error && (
            <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700 mb-5">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={idx} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  categoryName={categoryById.get(v.category_id)}
                  onView={onOpenView}
                  onEdit={onOpenEdit}
                  onDelete={onDelete}
                  deleting={deletingId === v.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
        onClose={() => setViewOpen(false)}
        onRemove={onRemoveFromView}
        removing={viewRemoving}
      />
    </div>
  );
}
