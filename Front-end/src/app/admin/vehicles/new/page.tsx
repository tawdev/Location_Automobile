"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Vehicle } from "@/lib/types";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { createAdminVehicle, type AdminVehiclePayload } from "@/lib/adminVehiclesApi";

function AdminVehicleForm({
  categories,
  initial,
  onSubmit,
  submitting,
  error,
}: {
  categories: Category[];
  initial?: Partial<AdminVehiclePayload>;
  onSubmit: (payload: AdminVehiclePayload, images: File[]) => Promise<void>;
  submitting: boolean;
  error: string | null;
}) {
  const [marque, setMarque] = useState(initial?.marque ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState<number>(initial?.year ?? new Date().getFullYear());
  const [registration, setRegistration] = useState(initial?.registration ?? "");
  const [km, setKm] = useState<number>(initial?.km ?? 0);
  const [pricePerDay, setPricePerDay] = useState<number>(initial?.pricePerDay ?? 0);
  const [fuelType, setFuelType] = useState(initial?.fuelType ?? "");
  const [categoryId, setCategoryId] = useState<number>(initial?.category_id ?? 0);
  const [occupants, setOccupants] = useState(initial?.Occupants ?? "");
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);

  const categoryOptions = useMemo(() => categories.slice().sort((a, b) => a.id - b.id), [categories]);

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
      occupants.trim()
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
            images: undefined,
          },
          imagesFiles
        );
      }}
      className="flex flex-col gap-4"
    >
      {error ? <div className="p-3 border-2 border-black bg-white font-bold">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-bold">Marque</span>
          <input
            className="border-2 border-black p-2"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Model</span>
          <input
            className="border-2 border-black p-2"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
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
            <option value="" disabled>
              Select category
            </option>
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

        <div className="flex flex-col gap-2">
          <span className="font-bold">Images (optional)</span>
          <input
            className="bg-white"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const list = e.target.files ? Array.from(e.target.files) : [];
              setImagesFiles(list);
            }}
          />
          <span className="text-xs font-bold">You can upload multiple images.</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            // parent decides route
            // (kept as a no-op here; overridden by parent via wrapper buttons)
          }}
          className="hidden"
        >
          Hidden
        </button>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create vehicle"}
        </button>
      </div>
    </form>
  );
}

export default function AdminVehicleNewPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoadingCategories(true);
        const data = await getAdminCategories();
        setCategories(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load categories";
        setError(msg);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  async function onCreate(payload: AdminVehiclePayload, images: File[]) {
    setSubmitting(true);
    setError(null);
    try {
      await createAdminVehicle({ ...payload, images: images.length ? images : undefined });
      // Force a full reload so the list definitely re-fetches the new vehicle.
      window.location.assign("/admin/vehicles");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create vehicle";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">Add vehicle</h1>
          <div className="font-bold text-sm mt-1">Admin CRUD</div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/vehicles")}
          className="font-black border-2 border-black px-4 py-2 bg-white hover:bg-zinc-100"
        >
          Back
        </button>
      </div>

      {loadingCategories ? (
        <div className="mt-6 font-black">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="mt-6 p-4 border-2 border-black bg-white font-black">
          No categories found. Create a category first.
        </div>
      ) : (
        <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <AdminVehicleForm
            categories={categories}
            onSubmit={onCreate}
            submitting={submitting}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
