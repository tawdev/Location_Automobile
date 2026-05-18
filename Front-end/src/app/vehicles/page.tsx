"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { filterVehicles, listVehicles } from "@/lib/vehiclesApi";
import type { Vehicle } from "@/lib/types";
import { vehicleImageUrl } from "@/lib/media";
import { authLogout } from "@/lib/authApi";
import { useAuth } from "@/lib/authContext";
import { clearAuthToken } from "@/lib/tokenStorage";

type VehiclesQuery = {
  marque?: string;
  model?: string;
  Occupants?: string;
  fuelType?: string;
  min_price?: number;
  max_price?: number;
};

function TopNav({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <div className="border-b-4 border-black bg-white p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <div className="font-black text-xl leading-tight">Location Automobile</div>
        {children}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/reservations")}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          My reservations
        </button>

        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          Profile
        </button>

        <div className="hidden sm:block font-bold text-sm">
          {user ? user.name : ""}
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await authLogout();
            } finally {
              await signOut().catch(() => {});
              clearAuthToken();
              router.push("/login");
            }
          }}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const router = useRouter();
  const { status } = useAuth();

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

  const hasAnyFilter = useMemo(() => {
    return Boolean(
      query.marque ||
        query.model ||
        query.Occupants ||
        query.fuelType ||
        query.min_price !== undefined ||
        query.max_price !== undefined
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
        min_price:
          query.min_price !== undefined && query.min_price !== null
            ? query.min_price
            : undefined,
        max_price:
          query.max_price !== undefined && query.max_price !== null
            ? query.max_price
            : undefined,
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
    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-zinc-50 text-black">
        <TopNav>
          {status === "authenticated" ? (
            <div className="font-bold text-sm">
              Welcome — browse and reserve your car
            </div>
          ) : null}
        </TopNav>

        <div className="max-w-6xl mx-auto p-4">
          <h1 className="font-black text-3xl my-5">Vehicles</h1>

          <form
            onSubmit={onFilterSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <label className="flex flex-col gap-2">
              <span className="font-bold">Marque</span>
              <input
                value={query.marque ?? ""}
                onChange={(e) => setQuery((q) => ({ ...q, marque: e.target.value }))}
                className="border-2 border-black p-2"
                placeholder="e.g. Peugeot"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Model</span>
              <input
                value={query.model ?? ""}
                onChange={(e) => setQuery((q) => ({ ...q, model: e.target.value }))}
                className="border-2 border-black p-2"
                placeholder="e.g. 208"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Occupants</span>
              <input
                value={query.Occupants ?? ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, Occupants: e.target.value }))
                }
                className="border-2 border-black p-2"
                placeholder="e.g. 4"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Fuel type</span>
              <input
                value={query.fuelType ?? ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, fuelType: e.target.value }))
                }
                className="border-2 border-black p-2"
                placeholder="e.g. Diesel"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Min price / day</span>
              <input
                value={query.min_price ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setQuery((q) => ({
                    ...q,
                    min_price: raw === "" ? undefined : Number(raw),
                  }));
                }}
                type="number"
                className="border-2 border-black p-2"
                placeholder="0"
                min={0}
                step={0.01}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-bold">Max price / day</span>
              <input
                value={query.max_price ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setQuery((q) => ({
                    ...q,
                    max_price: raw === "" ? undefined : Number(raw),
                  }));
                }}
                type="number"
                className="border-2 border-black p-2"
                placeholder="100"
                min={0}
                step={0.01}
              />
            </label>

            <div className="flex items-end gap-3 md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="w-full h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
                disabled={loading || !hasAnyFilter}
              >
                {loading ? "Loading..." : "Filter"}
              </button>

              <button
                type="button"
                className="w-full md:w-auto h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100"
                onClick={() => {
                  setQuery({
                    marque: "",
                    model: "",
                    Occupants: "",
                    fuelType: "",
                    min_price: undefined,
                    max_price: undefined,
                  });
                  void loadInitial();
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-4 p-3 border-2 border-black bg-white font-bold">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const picturePath = v.pictures?.[0]?.path;

              return (
                <div
                  key={v.id}
                  className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3"
                >
                  <div className="aspect-[4/3] bg-zinc-100 border-2 border-black flex items-center justify-center overflow-hidden">
                    {picturePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicleImageUrl(picturePath)}
                        alt={`${v.marque} ${v.model}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="font-black text-black p-4 text-center">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="font-black text-xl leading-tight">
                      {v.marque} {v.model}
                    </div>
                    <div className="font-bold">
                      Year: {v.year} • Fuel: {v.fuelType}
                    </div>
                    <div className="font-bold">
                      Seats: {v.Occupants} • Km: {v.km}
                    </div>
                    <div className="mt-2 font-black text-lg">
                      Price: {v.pricePerDay} / day
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/reservations/new/${v.id}`)}
                      className="mt-3 w-full h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {vehicles.length === 0 && !loading ? (
            <div className="mt-8 p-4 border-2 border-black bg-white font-black text-center">
              No vehicles found.
            </div>
          ) : null}
        </div>
      </div>
    </RequireAuth>
  );
}
