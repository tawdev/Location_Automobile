"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { vehicleImageUrl, getApiOrigin } from "@/lib/media";
import type { Vehicle, Marque } from "@/lib/types";
import { getBrandLogo } from "@/lib/brandLogos";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const fuelTypeIcon: Record<string, React.ReactNode> = {
  Diesel: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 10h2a2 2 0 012 2v4a2 2 0 002 2H5"/><circle cx="7.5" cy="19.5" r="2.5"/><circle cx="17.5" cy="19.5" r="2.5"/></svg>
  ),
  Gasoline: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 10h2a2 2 0 012 2v4a2 2 0 002 2H5"/><circle cx="7.5" cy="19.5" r="2.5"/><circle cx="17.5" cy="19.5" r="2.5"/></svg>
  ),
  Electricity: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Hybrid: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
};

export default function VehiclesMarqueeSection({ vehicles: propVehicles = [], marques: propMarques = [] }: { vehicles?: Vehicle[]; marques?: Marque[] }) {
  const router = useRouter();
  const [vehicles] = useState<Vehicle[]>(propVehicles);
  const [marques] = useState<Marque[]>(propMarques);
  const { t } = useI18n();

  const marqueLogoMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of marques) {
      const key = m.name.toLowerCase().trim();
      if (m.logo) {
        map.set(key, `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}`);
      }
    }
    return map;
  }, [marques]);

  const marqueImg = useCallback((name: string): string | null => {
    const key = name.toLowerCase().trim();
    return marqueLogoMap.get(key) ?? getBrandLogo(name);
  }, [marqueLogoMap]);

  const [dims, setDims] = useState(() => ({
    cardWidth: 420,
    cardHeight: 440,
    maxVisible: 5,
  }));

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDims({ cardWidth: 280, cardHeight: 380, maxVisible: 3 });
      } else if (w < 1024) {
        setDims({ cardWidth: 360, cardHeight: 410, maxVisible: 5 });
      } else {
        setDims({ cardWidth: 420, cardHeight: 440, maxVisible: 5 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  type VehicleStackItem = CardStackItem & {
    vehicle: Vehicle;
    brandLogoSrc: string | null;
  };

  const stackItems: VehicleStackItem[] = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.id,
        title: `${v.marque} ${v.model}`,
        imageSrc: v.pictures?.[0]
          ? vehicleImageUrl(v.pictures[0].path)
          : "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
        href: `/vehicules/${v.id}`,
        vehicle: v,
        brandLogoSrc: marqueImg(v.marque),
      })),
    [vehicles, marqueImg],
  );

  const fuelLabel = (ft: string) =>
    ft === "Gasoline"
      ? "Essence"
      : ft === "Electricity"
        ? "Électrique"
        : ft === "Hybrid"
          ? "Hybride"
          : ft;

  const renderVehicleCard = useCallback(
    (item: VehicleStackItem) => {
      const v = item.vehicle;
      return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-[#0c1322] group">
          <div className="relative h-[55%] w-full overflow-hidden">
            <img
              src={item.imageSrc}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#395886]/70 dark:bg-[#0f1729]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-white/10">
                {v.year}
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#F39C12]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-[#F39C12]/20 inline-flex items-center gap-1">
                {fuelTypeIcon[v.fuelType]}
                {v.fuelType}
              </span>
              {v.category && (
                <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#638ECB]/70 backdrop-blur-md px-2.5 py-[5px] rounded-full border border-white/10">
                  {v.category.name}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="flex items-baseline gap-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                <span className="text-[28px] font-black leading-none tracking-tight">
                  {v.pricePerDay.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  DH / jour
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-[45%] flex flex-col overflow-hidden">
            {item.brandLogoSrc && (
              <img
                src={item.brandLogoSrc}
                alt=""
                className="absolute -bottom-6 -right-6 w-[120px] h-[120px] opacity-[0.04] dark:opacity-[0.06] -rotate-12 pointer-events-none select-none z-0"
                draggable={false}
              />
            )}

            <div className="flex-1 p-4 flex flex-col relative z-10">
              <div className="flex items-center gap-2.5 mb-2.5">
                {item.brandLogoSrc ? (
                  <div className="w-9 h-9 rounded-[10px] bg-[#F0F3FA] dark:bg-[#1a2438] flex items-center justify-center p-1.5 shrink-0 border border-[#D5DEEF]/30 dark:border-[#1e293b]/50">
                    <img
                      src={item.brandLogoSrc}
                      alt={v.marque}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#395886] to-[#2d4670] flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-white">
                      {v.marque.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-[#395886] dark:text-[#D5DEEF] leading-tight truncate">
                    {v.marque} {v.model}
                  </h3>
                  <p className="text-[10px] text-[#638ECB] dark:text-[#94A3B8] mt-0.5 font-medium">
                    {v.year} &middot; {fuelLabel(v.fuelType)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#D5DEEF]/40 dark:via-[#1e293b]/60 to-transparent mb-2.5" />

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {v.Occupants && Number(v.Occupants) > 0 ? `${v.Occupants} places` : null}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {v.km.toLocaleString()} km
                </span>
                {v.air_conditioner && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7V4h16v3" />
                      <path d="M9 20h6" />
                      <path d="M12 4v8" />
                      <path d="M4 14h16" />
                      <rect x="4" y="11" width="16" height="3" rx="1" />
                    </svg>
                    Clim
                  </span>
                )}
                {v.gps && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#638ECB] dark:text-[#94A3B8] bg-[#F0F3FA] dark:bg-[#1a2438] px-2 py-[4px] rounded-md border border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
                    </svg>
                    GPS
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/vehicules/${v.id}`);
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Réserv. →
              </button>
            </div>
          </div>
        </div>
      );
    },
    [router],
  );

  return (
    <section className="bg-[#F3F3F3] dark:bg-[#070b14] py-28 md:py-32 px-4 sm:px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-[#F39C12]/[0.03] dark:bg-[#F39C12]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-7xl mx-auto mb-16 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2.5 text-[#F39C12] text-[11px] font-bold tracking-[0.25em] uppercase bg-[#F39C12]/[0.08] px-5 py-2.5 rounded-full border border-[#F39C12]/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F39C12] animate-pulse" />
            {t("home.marquee.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-[1.1] tracking-tight">
            {t("home.marquee.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            {t("home.marquee.subtitle")}
          </p>
        </div>
      </m.div>

      {vehicles.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <CardStack
            items={stackItems}
            initialIndex={0}
            cardWidth={dims.cardWidth}
            cardHeight={dims.cardHeight}
            maxVisible={dims.maxVisible}
            autoAdvance
            intervalMs={3000}
            pauseOnHover
            showDots
            overlap={0.42}
            spreadDeg={42}
            activeScale={1.04}
            inactiveScale={0.92}
            renderCard={renderVehicleCard}
          />
        </m.div>
      )}
    </section>
  );
}
