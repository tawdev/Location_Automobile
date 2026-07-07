"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { locales, type Locale } from "@/lib/i18n/translations";
import { Globe } from "lucide-react";

const FLAG: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  ar: "🇲🇦",
};

const LABEL: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

export default function LanguageSwitcher({ upward, transparent }: { upward?: boolean; transparent?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const otherLocales = locales.filter((l) => l !== locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
          transparent
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50"
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>{FLAG[locale]} {LABEL[locale]}</span>
      </button>

      {open && (
        <div className={`absolute ${upward ? "bottom-full right-0 mb-1.5" : "top-full right-0 mt-1.5"} bg-white rounded-xl shadow-lg border border-[#D5DEEF]/30 overflow-hidden z-[100] min-w-[120px]`}>
          {otherLocales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[#F0F3FA] transition-colors text-left"
            >
              <span>{FLAG[l]}</span>
              <span>{l === "en" ? "English" : l === "fr" ? "Français" : "العربية"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
