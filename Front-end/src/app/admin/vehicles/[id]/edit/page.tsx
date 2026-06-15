"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Category, Marque, Vehicle } from "@/lib/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getBrandLogo } from "@/lib/brandLogos";
import Image from "next/image";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { getPublicMarques } from "@/lib/marquesApi";
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
  const [marques, setMarques] = useState<Marque[]>([]);
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
  const [airConditioner, setAirConditioner] = useState(initial.air_conditioner ?? false);
  const [gps, setGps] = useState(initial.gps ?? false);
  const [order, setOrder] = useState<number>(initial.order ?? 0);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const { t } = useI18n();

  const categoryOptions = useMemo(
    () => categories.slice().sort((a, b) => a.id - b.id),
    [categories]
  );

  useEffect(() => {
    getPublicMarques().then(setMarques).catch(() => {});
  }, []);

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
            device_id: deviceId.trim() || undefined,
            air_conditioner: airConditioner,
            gps: gps,
            order: order,
            images: imagesFiles.length > 0 ? imagesFiles : undefined,
          },
          imagesFiles
        );
      }}
      className="flex flex-col gap-4"
    >
      {error ? <div className="p-3 border-2 border-black bg-white font-bold">{error}</div> : null}

      <div className="border-2 border-black bg-white p-3 font-bold text-sm">
        {t("admin.vehicle_update_note")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-bold">Marque</span>
          <div className="flex items-center gap-3">
            <select className="border-2 border-black p-2 flex-1" value={marque} onChange={(e) => setMarque(e.target.value)} required>
              <option value="">-- Sélectionner une marque --</option>
              {marques.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            {marque && (() => {
              const logoSrc = getBrandLogo(marque);
              if (!logoSrc) return null;
              return (
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1.5 shrink-0">
                  <Image src={logoSrc} alt={marque} width={28} height={28} className="w-full h-full object-contain" unoptimized />
                </div>
              );
            })()}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Modèle</span>
          <input className="border-2 border-black p-2" value={model} onChange={(e) => setModel(e.target.value)} required />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Année</span>
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
          <span className="font-bold">Immatriculation</span>
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
          <span className="font-bold">Prix / jour</span>
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
          <span className="font-bold">Carburant</span>
          <input
            className="border-2 border-black p-2"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
            placeholder="ex. Diesel"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Catégorie</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
          >
            <option value="" disabled>Sélectionner une catégorie</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Places</span>
          <input
            className="border-2 border-black p-2"
            value={occupants}
            onChange={(e) => setOccupants(e.target.value)}
            required
            placeholder="ex. 4"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">ID du dispositif GPS <span className="text-gray-400 font-normal">(optionnel)</span></span>
          <input
            className="border-2 border-black p-2"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="ex. GPS-001"
          />
        </label>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={airConditioner}
              onChange={(e) => setAirConditioner(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">Climatisation</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gps}
              onChange={(e) => setGps(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">GPS</span>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-bold">Ordre d'affichage</span>
          <input
            className="border-2 border-black p-2"
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            placeholder="ex. 1"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-bold">Images (optionnel - laisser vide pour conserver les actuelles)</span>
          <input
            className="bg-white"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImagesFiles(e.target.files ? Array.from(e.target.files) : [])}
          />
          <span className="text-xs font-bold">Ne sélectionnez des images que si vous souhaitez les remplacer.</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
        >
          {submitting ? t("admin.vehicle_saving") : t("admin.save")}
        </button>
      </div>
    </form>
  );
}

export default function AdminVehicleEditPage() {
  const router = useRouter();
  const { t } = useI18n();
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
        const msg = e instanceof Error ? e.message : t("admin.vehicle_load_error");
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
      await updateAdminVehicle(vehicleId, {
        ...payload,
        images: images.length > 0 ? images : undefined,
      });
      router.push("/admin/vehicles");
    } catch (e) {
      const msg = (e as { message?: string })?.message || t("admin.vehicle_update_error");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="font-black">{t("admin.loading")}</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-4 border-2 border-black bg-white font-black">
        Véhicule introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">{t("admin.edit_vehicle_page")}</h1>
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
