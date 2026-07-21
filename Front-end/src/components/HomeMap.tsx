"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useSettings } from "@/lib/SettingsContext";

const LAT = 31.646024;
const LNG = -8.0042192;

const MAP_STYLE_ID = "home-map-custom-styles";

function injectMapStyles() {
  if (document.getElementById(MAP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MAP_STYLE_ID;
  style.textContent = `
    @keyframes map-pulse {
      0%, 100% { transform: scale(1); opacity: 0.35; }
      50% { transform: scale(1.6); opacity: 0.08; }
    }
    .home-map-marker-pulse {
      animation: map-pulse 2.4s ease-in-out infinite;
    }
    .home-map-marker-pulse:nth-child(2) {
      animation-delay: 0.8s;
    }

    .home-map-popup .leaflet-popup-content-wrapper {
      border-radius: 18px !important;
      box-shadow: 0 8px 32px rgba(57,88,134,0.18) !important;
      border: 1px solid #D5DEEF !important;
      overflow: hidden;
    }
    .home-map-popup .leaflet-popup-content {
      margin: 14px 18px !important;
    }
    .home-map-popup .leaflet-popup-tip {
      display: none !important;
    }
    .home-map-popup .leaflet-popup-close-button {
      display: none !important;
    }

    .home-map-zoom {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .home-map-zoom button {
      width: 36px;
      height: 36px;
      border: none;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(57,88,134,0.15);
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
      color: #395886;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .home-map-zoom button:hover {
      background: #395886;
      color: white;
      box-shadow: 0 4px 14px rgba(57,88,134,0.3);
    }
    .home-map-zoom button:active {
      transform: scale(0.92);
    }
  `;
  document.head.appendChild(style);
}

export default function HomeMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { settings } = useSettings();

  const contacts = [
    {
      label: "Google Maps",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      text: settings.address || t("home.map.location_text"),
      href: "https://maps.google.com/?q=31.6462352,-8.0040750",
    },
    {
      label: t("home.map.call"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      text: settings.phone || "+212 524-308038",
      href: `tel:${settings.phone?.replace(/\s/g, "") || "+2125XXXXXXXX"}`,
    },
    {
      label: t("home.map.email"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: settings.email || "contact@carforfar.ma",
      href: `mailto:${settings.email || "contact@carforfar.ma"}`,
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      containerRef.current.innerHTML = "";

      injectMapStyles();

      const map = L.map(containerRef.current, {
        center: [LAT, LNG],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const MarkerIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:52px;height:52px">
            <div class="home-map-marker-pulse" style="position:absolute;inset:0;border-radius:50%;background:#395886"></div>
            <div class="home-map-marker-pulse" style="position:absolute;inset:4px;border-radius:50%;background:#395886;opacity:0.2"></div>
            <div style="position:absolute;top:12px;left:12px;width:28px;height:28px;border-radius:50%;background:#395886;border:3px solid white;box-shadow:0 2px 12px rgba(57,88,134,0.5);display:flex;align-items:center;justify-content:center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 17c0-2 4-10 7-10s7 8 7 10"/>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                <path d="M12 22c-4 0-8-3-8-7 0-4 3.5-11 8-11s8 7 8 11c0 4-4 7-8 7Z"/>
              </svg>
            </div>
          </div>`,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      const marker = L.marker([LAT, LNG], { icon: MarkerIcon }).addTo(map);

      const isDark = document.documentElement.classList.contains("dark");
      const logoSrc = isDark ? "/logo-dark.png" : "/logo.png";

      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:180px">
          <img src="${logoSrc}" alt="CARFORFAR" style="height:96px;width:auto;object-fit:contain;display:block" />
          <div style="font-size:12px;color:#638ECB;font-weight:600;margin:2px 0 8px">${t("home.badge")}</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#395886">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#395886" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
            <span>${t("home.map.location_text")}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:5px;font-size:12px;color:#395886">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#395886" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <span>+212 524-308038</span>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid #E8EDF6;font-size:11px;color:#8DA6CE">
            ${t("home.map.click_dir")}
          </div>
        </div>
      `, {
        closeButton: false,
        className: "home-map-popup",
        offset: [0, -28],
      });

      marker.on("popupopen", () => {
        const el = marker.getPopup()?.getElement();
        if (el) {
          el.addEventListener("click", () => {
            window.open("https://maps.google.com/?q=31.6462352,-8.0040750", "_blank");
          });
          el.style.cursor = "pointer";
        }
      });

      map.once("load", () => {
        marker.openPopup();
      });

      const zoomContainer = L.DomUtil.create("div", "home-map-zoom");
      const zoomIn = L.DomUtil.create("button", "", zoomContainer);
      zoomIn.innerHTML = "+";
      zoomIn.setAttribute("aria-label", t("home.map.zoom_in"));
      const zoomOut = L.DomUtil.create("button", "", zoomContainer);
      zoomOut.innerHTML = "−";
      zoomOut.setAttribute("aria-label", t("home.map.zoom_out"));

      L.DomEvent.on(zoomIn, "click", () => map.zoomIn());
      L.DomEvent.on(zoomOut, "click", () => map.zoomOut());

      const zoomWrapper = L.DomUtil.create("div");
      zoomWrapper.appendChild(zoomContainer);
      map.getContainer().appendChild(zoomWrapper);
      zoomRef.current = zoomContainer;

      map.whenReady(() => {
        setTimeout(() => {
          if (!cancelled && map.getContainer()) {
            map.invalidateSize();
          }
        }, 300);
      });

      mapRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      zoomRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [t]);

  return (
    <section className="bg-white dark:bg-[#070b14] py-20 px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#F39C12] text-xs font-bold tracking-[0.25em] uppercase">{t("home.map.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-3 leading-tight">
            {t("home.map.title")}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            {t("home.map.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(57,88,134,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 relative"
        >
          <div ref={containerRef} className="w-full h-[440px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-[#638ECB] dark:text-[#94A3B8]"
        >
          {contacts.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F0F3FA]/60 hover:bg-[#F0F3FA] dark:bg-[#1e293b]/60 dark:hover:bg-[#1e293b] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0f1729] shadow-sm border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] shrink-0">
                {item.icon}
              </div>
              <span className="font-semibold text-[#395886] dark:text-[#D5DEEF]">{item.text}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
