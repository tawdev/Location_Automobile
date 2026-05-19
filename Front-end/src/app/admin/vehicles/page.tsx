"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Vehicle } from "@/lib/types";
import { deleteAdminVehicle, getAdminVehicles } from "@/lib/adminVehiclesApi";
import { getAdminCategories } from "@/lib/adminCategoriesApi";
import { vehicleImageUrl } from "@/lib/media";

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21s-7.5-4.35-9.3-8.2C1.1 9.1 2.7 6.7 5.3 6.2c1.8-.35 3.4.3 4.4 1.5 1-1.2 2.6-1.85 4.4-1.5 2.6.5 4.2 2.9 2.6 6.6C19.5 16.65 12 21 12 21Z"
        stroke="#395886"
        strokeWidth="1.8"
        fill={filled ? "#F39C12" : "transparent"}
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7l6 6 6-6" stroke="#395886" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  const d =
    dir === "left"
      ? "M12.5 4.5 6.5 10l6 5.5"
      : "M7.5 4.5 13.5 10l-6 5.5";
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={d} stroke="#395886" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="w-4 h-4 accent-[#638ECB]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="font-bold text-sm text-[#395886]">{label}</span>
    </label>
  );
}

type SortKey = "newest" | "priceAsc" | "priceDesc";

function formatRange(min: number, max: number) {
  return `${min} - ${max}`;
}

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  deleting,
}: {
  vehicle: Vehicle;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  const picturePath = vehicle.pictures?.[0]?.path;

  return (
    <div className="bg-white border-2 border-[#395886] rounded-xl shadow-[6px_6px_0px_0px_rgba(57,88,134,0.25)] overflow-hidden">
      <div className="relative">
        <div className="bg-[#F0F3FA] border-b-2 border-[#395886] aspect-[4/3] overflow-hidden">
          {picturePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vehicleImageUrl(picturePath)} alt={`${vehicle.marque} ${vehicle.model}`} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="font-black text-[#395886]">No image</div>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <button type="button" className="p-2 rounded-lg bg-[#F0F3FA] border-2 border-[#395886]">
            <HeartIcon />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-black text-lg text-[#151515] leading-tight">
              {vehicle.marque} {vehicle.model}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <div className="font-bold text-sm text-[#395886]">
                Seats: <span className="text-[#151515]">{vehicle.Occupants}</span>
              </div>
              <div className="font-bold text-sm text-[#395886]">
                Fuel: <span className="text-[#151515]">{vehicle.fuelType}</span>
              </div>
              <div className="font-bold text-sm text-[#395886]">
                Year: <span className="text-[#151515]">{vehicle.year}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-black text-sm text-[#395886]">Price</div>
            <div className="font-black text-2xl text-[#638ECB] leading-tight">
              {vehicle.pricePerDay} <span className="text-[#395886] font-bold text-sm">/day</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="font-bold text-sm text-[#395886]">
            Km: <span className="text-[#151515]">{vehicle.km}</span>
          </div>
          <div className="font-bold text-sm text-[#395886]">
            Reg: <span className="text-[#151515]">{vehicle.registration}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onEdit(vehicle.id)}
            className="h-11 font-black text-base border-2 border-[#395886] bg-[#638ECB] hover:bg-[#5a86c2] text-white rounded-lg transition-colors"
          >
            Edit
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(vehicle.id)}
            className="h-10 font-black text-base border-2 border-[#395886] bg-[#F0F3FA] hover:bg-white disabled:opacity-50 text-[#395886] rounded-lg transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // UI state (matches screenshot: Filters on left, sort on right)
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [selectedMarques, setSelectedMarques] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedOccupants, setSelectedOccupants] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);

  const marques = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) map.set(v.marque, (map.get(v.marque) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [vehicles]);

  const fuelTypes = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) map.set(v.fuelType, (map.get(v.fuelType) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [vehicles]);

  const occupantsOptions = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of vehicles) {
      const n = Number(v.Occupants);
      if (!Number.isFinite(n)) continue;
      map.set(n, (map.get(n) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([n, count]) => ({ n, count }));
  }, [vehicles]);

  const categoryOptions = useMemo(() => {
    const map = new Map<number, number>();
    for (const v of vehicles) map.set(v.category_id, (map.get(v.category_id) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [vehicles]);

  async function loadVehicles() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminVehicles();
      setVehicles(data);

      if (data.length) {
        const prices = data.map((v) => v.pricePerDay);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceMin(Math.floor(min));
        setPriceMax(Math.ceil(max));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load vehicles";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch {
      // Non-critical
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
    void loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedMarques, selectedFuelTypes, selectedOccupants, selectedCategoryIds, priceMin, priceMax, sortKey]);

  const filteredVehicles = useMemo(() => {
    const min = Math.min(priceMin, priceMax);
    const max = Math.max(priceMin, priceMax);

    const selectedCategorySet = new Set(selectedCategoryIds);
    const selectedMarqueSet = new Set(selectedMarques);
    const selectedFuelSet = new Set(selectedFuelTypes);
    const selectedOccupantsSet = new Set(selectedOccupants);

    return vehicles
      .filter((v) => {
        const priceOk = v.pricePerDay >= min && v.pricePerDay <= max;

        const marqueOk = selectedMarques.length === 0 || selectedMarqueSet.has(v.marque);
        const fuelOk = selectedFuelTypes.length === 0 || selectedFuelSet.has(v.fuelType);

        const occ = Number(v.Occupants);
        const occupantsOk = selectedOccupants.length === 0 || (Number.isFinite(occ) && selectedOccupantsSet.has(occ));

        const categoryOk = selectedCategoryIds.length === 0 || selectedCategorySet.has(v.category_id);

        return priceOk && marqueOk && fuelOk && occupantsOk && categoryOk;
      })
      .sort((a, b) => {
        if (sortKey === "newest") return b.id - a.id;
        if (sortKey === "priceAsc") return a.pricePerDay - b.pricePerDay;
        return b.pricePerDay - a.pricePerDay;
      });
  }, [
    vehicles,
    priceMin,
    priceMax,
    selectedMarques,
    selectedFuelTypes,
    selectedOccupants,
    selectedCategoryIds,
    sortKey,
  ]);

  const total = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  async function onDelete(vehicleId: number) {
    setDeletingId(vehicleId);
    setError(null);
    try {
      await deleteAdminVehicle(vehicleId);
      await loadVehicles();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete vehicle";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(total, (currentPage - 1) * pageSize + pagedVehicles.length);

  const resetFilters = () => {
    setSelectedMarques([]);
    setSelectedFuelTypes([]);
    setSelectedOccupants([]);
    setSelectedCategoryIds([]);

    if (vehicles.length) {
      const prices = vehicles.map((v) => v.pricePerDay);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceMin(min);
      setPriceMax(max);
    } else {
      setPriceMin(0);
      setPriceMax(0);
    }

    setSortKey("newest");
  };

  return (
    <div className="w-full">
      <div className="bg-[#F0F3FA] border-2 border-[#395886] rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(57,88,134,0.35)]">
        {/* Header row like screenshot */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-black text-3xl text-[#151515]">Nos véhicules</h1>
            <div className="font-bold text-sm mt-1 text-[#395886]">
              {loading ? "Loading..." : `${total} véhicules disponibles`} • Admin CRUD
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block font-bold text-sm text-[#395886]">Trier par</div>
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none border-2 border-[#395886] bg-white px-3 py-2 pr-10 rounded-lg font-black text-[#395886] outline-none"
              >
                <option value="newest">Prix: du plus bas</option>
                <option value="priceAsc">Price low to high</option>
                <option value="priceDesc">Price high to low</option>
                <option value="newest">Newest first</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 p-3 border-2 border-[#395886] bg-white font-bold text-[#395886] rounded-lg">
            {error}
          </div>
        ) : null}

        {/* Main layout */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
          {/* Left filter panel */}
          <aside className="bg-[#D5DEEF] border-2 border-[#395886] rounded-xl p-4 h-fit">
            <div className="flex items-center justify-between gap-3">
              <div className="font-black text-xl text-[#151515]">Filtres</div>
              <button
                type="button"
                onClick={resetFilters}
                className="font-black text-xs border-2 border-[#395886] px-2 py-1 bg-[#F0F3FA] hover:bg-white rounded-lg"
              >
                Réinitialiser
              </button>
            </div>

            {/* Marque */}
            <div className="mt-4 pt-4 border-t-2 border-[#395886]">
              <div className="font-black text-sm text-[#395886]">Marque</div>
              <div className="mt-3 flex flex-col gap-2 max-h-40 overflow-auto pr-1">
                {marques.length === 0 ? (
                  <div className="font-bold text-sm text-[#395886]">No marques</div>
                ) : (
                  marques.map(([name, count]) => (
                    <Checkbox
                      key={name}
                      checked={selectedMarques.includes(name)}
                      onChange={(next) => {
                        setSelectedMarques((prev) => (next ? [...prev, name] : prev.filter((x) => x !== name)));
                      }}
                      label={
                        <span>
                          {name} <span className="font-black text-xs text-[#395886]">({count})</span>
                        </span>
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Category */}
            <div className="mt-4 pt-4 border-t-2 border-[#395886]">
              <div className="font-black text-sm text-[#395886]">Catégorie</div>
              <div className="mt-3 flex flex-col gap-2 max-h-32 overflow-auto pr-1">
                {categoryOptions.length === 0 ? (
                  <div className="font-bold text-sm text-[#395886]">No categories</div>
                ) : (
                  categoryOptions.map(([id, count]) => {
                    const label = categories.find((c) => c.id === id)?.name ?? `#${id}`;
                    return (
                      <Checkbox
                        key={id}
                        checked={selectedCategoryIds.includes(id)}
                        onChange={(next) => {
                          setSelectedCategoryIds((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)));
                        }}
                        label={
                          <span>
                            {label} <span className="font-black text-xs">({count})</span>
                          </span>
                        }
                      />
                    );
                  })
                )}
              </div>
              {loadingCategories ? <div className="mt-2 font-bold text-xs text-[#395886]">Loading...</div> : null}
            </div>

            {/* Price range */}
            <div className="mt-4 pt-4 border-t-2 border-[#395886]">
              <div className="font-black text-sm text-[#395886]">Prix par jour</div>
              <div className="mt-2 font-bold text-xs text-[#395886]">{formatRange(priceMin, priceMax)}</div>

              <div className="mt-3 flex flex-col gap-3">
                <label className="flex flex-col gap-2">
                  <span className="font-bold text-xs text-[#395886]">Min</span>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="border-2 border-[#395886] bg-white p-2 rounded-lg outline-none font-black text-[#395886]"
                    min={0}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="font-bold text-xs text-[#395886]">Max</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="border-2 border-[#395886] bg-white p-2 rounded-lg outline-none font-black text-[#395886]"
                    min={0}
                  />
                </label>
              </div>
            </div>

            {/* Fuel type */}
            <div className="mt-4 pt-4 border-t-2 border-[#395886]">
              <div className="font-black text-sm text-[#395886]">Type de carburant</div>
              <div className="mt-3 flex flex-col gap-2 max-h-28 overflow-auto pr-1">
                {fuelTypes.length === 0 ? (
                  <div className="font-bold text-sm text-[#395886]">No fuels</div>
                ) : (
                  fuelTypes.map(([fuel, count]) => (
                    <Checkbox
                      key={fuel}
                      checked={selectedFuelTypes.includes(fuel)}
                      onChange={(next) => {
                        setSelectedFuelTypes((prev) => (next ? [...prev, fuel] : prev.filter((x) => x !== fuel)));
                      }}
                      label={
                        <span>
                          {fuel} <span className="font-black text-xs">({count})</span>
                        </span>
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Seats */}
            <div className="mt-4 pt-4 border-t-2 border-[#395886]">
              <div className="font-black text-sm text-[#395886]">Nombre de places</div>
              <div className="mt-3 flex flex-col gap-2 max-h-28 overflow-auto pr-1">
                {occupantsOptions.length === 0 ? (
                  <div className="font-bold text-sm text-[#395886]">No seat options</div>
                ) : (
                  occupantsOptions.map(({ n, count }) => (
                    <Checkbox
                      key={n}
                      checked={selectedOccupants.includes(n)}
                      onChange={(next) => {
                        setSelectedOccupants((prev) => (next ? [...prev, n] : prev.filter((x) => x !== n)));
                      }}
                      label={
                        <span>
                          {n} places <span className="font-black text-xs">({count})</span>
                        </span>
                      }
                    />
                  ))
                )}
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setPage(1)}
                className="w-full h-11 font-black text-base border-2 border-[#395886] bg-[#F0F3FA] hover:bg-white rounded-lg transition-colors"
              >
                Afficher {total} véhicules
              </button>

              <div className="mt-3 text-xs font-bold text-[#395886]">
                Tip: Categories CRUD is in the admin sidebar → <span className="text-[#151515]">Categories</span>
              </div>
            </div>
          </aside>

          {/* Results grid */}
          <section>
            {loading ? (
              <div className="font-black text-[#395886]">Loading...</div>
            ) : total === 0 ? (
              <div className="p-6 border-2 border-[#395886] bg-white font-black text-[#395886] rounded-xl text-center">
                No vehicles match these filters.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-black text-[#395886]">
                    {from} to {to} / {total} cars
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pagedVehicles.map((v) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      onEdit={(id) => router.push(`/admin/vehicles/${id}/edit`)}
                      onDelete={onDelete}
                      deleting={deletingId === v.id}
                    />
                  ))}
                </div>

                {/* Pagination row like screenshot */}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="font-bold text-xs text-[#395886]">
                    Showing {from}-{to} of {total}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-10 w-10 border-2 border-[#395886] bg-white hover:bg-[#F0F3FA] disabled:opacity-50 rounded-lg flex items-center justify-center"
                      aria-label="Previous page"
                    >
                      <ArrowIcon dir="left" />
                    </button>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const pages: number[] = [];
                        // show up to 5 pages around current
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, start + 4);
                        for (let i = start; i <= end; i++) pages.push(i);

                        // ensure start not shifted too far right
                        while (pages.length < Math.min(5, totalPages) && pages[0] > 1) {
                          const newStart = Math.max(1, pages[0] - 1);
                          pages.unshift(newStart);
                        }

                        return pages.map((p) => {
                          const active = p === currentPage;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPage(p)}
                              className={[
                                "h-10 min-w-10 px-3 rounded-lg border-2 font-black text-sm transition-colors",
                                active
                                  ? "bg-[#638ECB] border-[#395886] text-white"
                                  : "bg-white border-[#395886] hover:bg-[#F0F3FA] text-[#395886]",
                              ].join(" ")}
                            >
                              {p}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="h-10 w-10 border-2 border-[#395886] bg-white hover:bg-[#F0F3FA] disabled:opacity-50 rounded-lg flex items-center justify-center"
                      aria-label="Next page"
                    >
                      <ArrowIcon dir="right" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
