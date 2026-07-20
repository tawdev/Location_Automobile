"use client";

import { useState, useEffect, useMemo } from "react";
import { m } from "framer-motion";
import type { Marque } from "@/lib/types";
import { getApiOrigin } from "@/lib/media";
import { getBrandLogo } from "@/lib/brandLogos";
import { CircularGallery, type BrandItem } from "@/components/ui/circular-gallery";
import { useI18n } from "@/lib/i18n/LanguageProvider";

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
    <section className="bg-white dark:bg-[#070b14] py-28 px-8 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
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
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            {t("home.brands.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
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
