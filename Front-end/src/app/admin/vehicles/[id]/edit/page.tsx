"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Category, Vehicle } from "@/lib/types";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { getAdminVehicles, updateAdminVehicle, type AdminVehiclePayload } from "@/lib/adminVehiclesApi";

function AdminVehicleEditForm({
  categories,
  initial,
  onSubmit,
  submitting,
  error,
}: {
  categories: Category[];
  initial: Vehicle;
  onSubmit: (payload: AdminVehiclePayload, images: File[]) => Promise<void>;
  submitting: boolean;
  error: string | null;
}) {
  const [marque, setMarque] = useState(initial.marque);
  const [model, setModel] = useState(initial.model);
  const [year, setYear] = useState<number>(initial.year);
  const [registration, setRegistration] = useState(initial.registration);
  const [km, setKm] = useState<number>(initial.km);
  const [pricePerDay, setPricePerDay] = useState<number>(initial.pricePerDay);
  const [fuelType, setFuelType] = useState(initial.fuelType);
  const [categoryId, setCategoryId] = useState<number>(initial.category_id);
  const [occupants, setOccupants] = useState(initial.Occupants);
  const [deviceId, setDeviceId] = useState(initial.device_id ?? "");
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);

  const categoryOptions = useMemo(
    () => categories.slice().sort((a, b) => a.id - b.id),
    [categories]
  );

  const canSubmit = Boolean(
    marque.trim() &&
      model.trim() &&
      year > 0 &&
      registration.trim() &&
      Number.isFinite(km) &&
      km >= 0 &&
      Number.isFinite(pricePerDay) &&
      pricePerDay >= 0 &&
      fuelType.trim() &&
      categoryId > 0 &&
      occupants.trim() &&
      imagesFiles.length > 0
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

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
            device_id: deviceId.trim() || undefined,
            images: undefined,
          },
          imagesFiles
        );
      }}
      className="flex flex-col gap-4"
    >
      {error ? <div className="p-3 border-2 border-black bg-white font-bold">{error}</div> : null}

      <div className="border-2 border-black bg-white p-3 font-bold text-sm">
        Note: Updating a vehicle will replace its images. Please upload at least 1 image.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-bold">Marque</span>
          <input className="border-2 border-black p-2" value={marque} onChange={(e) => setMarque(e.target.value)} required />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Model</span>
          <input className="border-2 border-black p-2" value={model} onChange={(e) => setModel(e.target.value)} required />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Year</span>
          <input
            className="border-2 border-black p-2"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
            min={1900}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Registration</span>
          <input
            className="border-2 border-black p-2"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Km</span>
          <input
            className="border-2 border-black p-2"
            type="number"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            required
            min={0}
            step={1}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Price / day</span>
          <input
            className="border-2 border-black p-2"
            type="number"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(Number(e.target.value))}
            required
            min={0}
            step={0.01}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Fuel type</span>
          <input
            className="border-2 border-black p-2"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
            placeholder="e.g. Diesel"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Category</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
          >
            <option value="" disabled>Select category</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Occupants</span>
          <input
            className="border-2 border-black p-2"
            value={occupants}
            onChange={(e) => setOccupants(e.target.value)}
            required
            placeholder="e.g. 4"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">GPS Device ID <span className="text-gray-400 font-normal">(optional)</span></span>
          <input
            className="border-2 border-black p-2"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="e.g. GPS-001"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-bold">New images (replace)</span>
          <input
            className="bg-white"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImagesFiles(e.target.files ? Array.from(e.target.files) : [])}
            required
          />
          <span className="text-xs font-bold">Upload at least 1 image.</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export default function AdminVehicleEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const vehicleId = useMemo(() => {
    const raw = params.id;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.id]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!vehicleId) return;

      setLoading(true);
      setError(null);

      try {
        const [allVehicles, allCategories] = await Promise.all([getAdminVehicles(), getAdminCategories()]);
        const v = allVehicles.find((x) => x.id === vehicleId) ?? null;
        setVehicle(v);
        setCategories(allCategories);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load vehicle";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [vehicleId]);

  async function onSave(payload: AdminVehiclePayload, images: File[]) {
    if (!vehicleId || !vehicle) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateAdminVehicle(vehicleId, { ...payload, images });
      router.push("/admin/vehicles");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update vehicle";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="font-black">Loading...</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-4 border-2 border-black bg-white font-black">
        Vehicle not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">Edit vehicle</h1>
          <div className="font-bold text-sm mt-1">#{vehicle.id}</div>
        </div>
      </div>

      <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <AdminVehicleEditForm
          categories={categories}
          initial={vehicle}
          onSubmit={onSave}
          submitting={submitting}
          error={error}
        />
      </div>
    </div>
  );
}
