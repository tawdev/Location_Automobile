"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Marque, TypeVehicule, Vehicle, Country, City } from "@/lib/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getBrandLogo } from "@/lib/brandLogos";
import Image from "next/image";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { getPublicMarques } from "@/lib/marquesApi";
import { fetchTypeVehicules } from "@/lib/vehiclesApi";
import { createAdminVehicle, type AdminVehiclePayload } from "@/lib/adminVehiclesApi";
import { playConfirmationSound, prepareConfirmationSound } from "@/lib/playSound";
import { fetchCountries, fetchCitiesByCountry } from "@/lib/locationApi";

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
  const [marques, setMarques] = useState<Marque[]>([]);
  const [typeVehicules, setTypeVehicules] = useState<TypeVehicule[]>([]);
  const [marque, setMarque] = useState(initial?.marque ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState<number>(initial?.year ?? new Date().getFullYear());
  const [registration, setRegistration] = useState(initial?.registration ?? "");
  const [km, setKm] = useState<number>(initial?.km ?? 0);
  const [pricePerDay, setPricePerDay] = useState<number>(initial?.pricePerDay ?? 0);
  const [fuelType, setFuelType] = useState(initial?.fuelType ?? "");
  const [categoryId, setCategoryId] = useState<number>(initial?.category_id ?? 0);
  const [typeVehiculeId, setTypeVehiculeId] = useState<number | null>(initial?.type_vehicule_id ?? null);
  const [occupants, setOccupants] = useState(initial?.Occupants ?? "");
  const [deviceId, setDeviceId] = useState(initial?.device_id ?? "");
  const [airConditioner, setAirConditioner] = useState(initial?.air_conditioner ?? false);
  const [gps, setGps] = useState(initial?.gps ?? false);
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountries, setCurrentCountries] = useState<Country[]>([]);
  const [currentCities, setCurrentCities] = useState<City[]>([]);
  const [currentCountryId, setCurrentCountryId] = useState<number | null>(initial?.current_country_id ?? null);
  const [currentCityId, setCurrentCityId] = useState<number | null>(initial?.current_city_id ?? null);
  const { t } = useI18n();

  const categoryOptions = useMemo(() => categories.slice().sort((a, b) => a.id - b.id), [categories]);

  useEffect(() => {
    getPublicMarques().then(setMarques).catch(() => {});
    fetchTypeVehicules().then(setTypeVehicules).catch(() => {});
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      setCurrentCountries(countries);
    }
  }, [countries]);

  useEffect(() => {
    if (currentCountryId) {
      fetchCitiesByCountry(currentCountryId).then(setCurrentCities).catch(() => setCurrentCities([]));
    } else {
      setCurrentCities([]);
    }
    setCurrentCityId(null);
  }, [currentCountryId]);

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
            type_vehicule_id: typeVehiculeId,
            Occupants: occupants.trim(),
            device_id: deviceId.trim() || undefined,
            air_conditioner: airConditioner,
            gps: gps,
            order: order,
            current_country_id: currentCountryId,
            current_city_id: currentCityId,
            images: undefined,
          },
          imagesFiles
        );
      }}
      className="flex flex-col gap-4"
    >
      {error ? <div className="p-3 border-2 border-black bg-white font-bold">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-3">
        <label className="flex flex-col gap-2 flex-1">
          <span className="font-bold">{t("admin.brand")}</span>
          <select
            className="border-2 border-black p-2"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            required
          >
            <option value="">{t("admin.select_brand")}</option>
            {marques.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </label>
        {marque && (() => {
          const logoSrc = getBrandLogo(marque);
          if (!logoSrc) return null;
          return (
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1.5 shrink-0 mt-6">
              <Image src={logoSrc} alt={marque} width={28} height={28} className="w-full h-full object-contain" unoptimized />
            </div>
          );
        })()}
      </div>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.model")}</span>
          <input
            className="border-2 border-black p-2"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.year")}</span>
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
          <span className="font-bold">{t("admin.registration")}</span>
          <input
            className="border-2 border-black p-2"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.km")}</span>
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
          <span className="font-bold">{t("admin.price_per_day_short")}</span>
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
          <span className="font-bold">{t("admin.fuel")}</span>
          <input
            className="border-2 border-black p-2"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
            placeholder="ex. Diesel"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.category")}</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              {t("admin.select_category")}
            </option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.vehicle_type")}</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={typeVehiculeId ?? ""}
            onChange={(e) => setTypeVehiculeId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t("admin.no_type")}</option>
            {typeVehicules.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.seats")}</span>
          <input
            className="border-2 border-black p-2"
            value={occupants}
            onChange={(e) => setOccupants(e.target.value)}
            required
            placeholder="ex. 4"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.gps_device")}</span>
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
            <span className="font-bold">{t("admin.air_conditioning")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gps}
              onChange={(e) => setGps(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">{t("admin.gps_checkbox")}</span>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.display_order")}</span>
          <input
            className="border-2 border-black p-2"
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            placeholder="ex. 1"
          />
        </label>

        {/* Current Country */}
        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.current_country")}</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={currentCountryId ?? ""}
            onChange={(e) => setCurrentCountryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t("admin.select_country")}</option>
            {currentCountries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        {/* Current City */}
        <label className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.current_city")}</span>
          <select
            className="border-2 border-black p-2 bg-white"
            value={currentCityId ?? ""}
            onChange={(e) => setCurrentCityId(e.target.value ? Number(e.target.value) : null)}
            disabled={!currentCountryId}
          >
            <option value="">{t("admin.select_city")}</option>
            {currentCities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-bold">{t("admin.images_optional")}</span>
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
          <span className="text-xs font-bold">{t("admin.images_hint_new")}</span>
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
          {submitting ? t("admin.vehicle_saving") : t("admin.create_vehicle")}
        </button>
      </div>
    </form>
  );
}

export default function AdminVehicleNewPage() {
  const router = useRouter();
  const { t } = useI18n();

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
        const msg = e instanceof Error ? e.message : "Échec du chargement des catégories";
        setError(msg);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  async function onCreate(payload: AdminVehiclePayload, images: File[]) {
    prepareConfirmationSound();
    setSubmitting(true);
    setError(null);
    try {
      await createAdminVehicle({ ...payload, images: images.length ? images : undefined });
      playConfirmationSound();
      setTimeout(() => window.location.assign("/admin/vehicles"), 600);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.vehicle_create_error");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl">{t("admin.create_vehicle")}</h1>
          <div className="font-bold text-sm mt-1">{t("admin.new_vehicle")}</div>
        </div>
      </div>

      {loadingCategories ? (
        <div className="mt-6 font-black">{t("admin.loading")}</div>
      ) : categories.length === 0 ? (
        <div className="mt-6 p-4 border-2 border-black bg-white font-black">
          {t("admin.create_category_first")}
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
