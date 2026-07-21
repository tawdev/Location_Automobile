"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { m } from "framer-motion";
import type { Marque } from "@/lib/types";
import { getApiOrigin } from "@/lib/media";
import { getBrandLogo } from "@/lib/brandLogos";
import { CircularGallery, type BrandItem } from "@/components/ui/circular-gallery";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const ShaderBackground = dynamic(
  () => import("@/components/ui/ethereal-whispers").then((mod) => mod.ShaderBackground),
  { ssr: false },
);

export default function MarquesSection({ marques: propMarques = [] }: { marques?: Marque[] }) {
  const { t } = useI18n();
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const brandItems: BrandItem[] = useMemo(
    () =>
      propMarques.map((m) => ({
        id: m.id,
        name: m.name,
        logoSrc: m.logo
          ? `${getApiOrigin()}/storage/${m.logo.replace(/^\/+/, "")}`
          : getBrandLogo(m.name),
      })),
    [propMarques],
  );

  return (
    <section className="relative bg-[#0a0a0a] py-28 px-8 overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <ShaderBackground className="w-full h-full" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-[15]">
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-[#F0F3FA] via-white/60 to-transparent" />
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-[#070b14] via-[#6B7280]/60 to-transparent" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(128,128,128,0.6),transparent)]" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[15]">
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-t from-[#F0F3FA] via-white/60 to-transparent" />
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#6B7280]/60 to-transparent" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_100%,rgba(128,128,128,0.6),transparent)]" />
      </div>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto mb-6 relative z-10"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase bg-[#F39C12]/10 px-4 py-2 rounded-full">
            {t("home.brands.badge")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] mt-6 leading-tight">
            {t("home.brands.title")}
          </h2>
          <p className="text-[#638ECB] text-lg mt-4 max-w-xl mx-auto">
            {t("home.brands.subtitle")}
          </p>
        </div>
      </m.div>

      {isMobile ? (
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div className="mobile-brands-track">
            {[...brandItems, ...brandItems].map((item, i) => (
              <div key={`${item.id}-${i}`} style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
                {item.logoSrc ? (
                  <img src={item.logoSrc} alt={item.name} style={{ width: 70, height: "auto", objectFit: "contain" }} draggable={false} />
                ) : (
                  <span style={{ width: 70, textAlign: "center", fontSize: 14 }}>{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center"
        >
          <CircularGallery
            items={brandItems}
            circleSize={1000}
            itemWidth={180}
            itemHeight={200}
            autoRotateSpeed={0.12}
            pauseOnHover
          />
        </m.div>
      )}
    </section>
  );
}
