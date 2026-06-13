"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function CarLogo() {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="cursor-pointer -ml-2">
      <img src="/logo.png" alt="CARFORFAR logo" className="h-28 sm:h-36 w-auto object-contain select-none dark:hidden" />
      <img src="/logo-dark.png" alt="CARFORFAR logo" className="h-28 sm:h-36 w-auto object-contain select-none hidden dark:block" />
    </motion.div>
  );
}

function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${
        dark
          ? "bg-[#1e293b] text-[#f39c12] border border-[#f39c12]/20 hover:bg-[#1e293b]/80"
          : "bg-[#D5DEEF] text-[#395886] border border-[#395886]/10 hover:bg-[#b8c7db] shadow-sm"
      }`}
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      <motion.div
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}

export default function VisitorNav({ solid }: { solid?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(solid ?? false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const NAV_LINKS = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.vehicules"), href: "/vehicles" },
    { label: t("nav.about"), href: "/a-propos" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#F0F3FA]/80 dark:bg-[#0f1729]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(57,88,134,0.12)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-[#D5DEEF]/30 dark:border-[#1e293b]/80"
          : "bg-transparent dark:bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 h-[72px] flex items-center justify-between">
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <CarLogo />
        </div>
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <motion.button
              key={item.href}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push(item.href)}
              className={`relative px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                pathname === item.href
                  ? scrolled || solid ? "text-black dark:text-[#f39c12]" : "text-white"
                  : scrolled || solid
                    ? "text-black/60 dark:text-[#94A3B8]/70 hover:text-black dark:hover:text-[#D5DEEF]"
                    : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle dark={dark} onToggle={toggleDark} />
          <LanguageSwitcher />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className={`text-sm font-semibold tracking-wide transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full ${
              scrolled || solid
                ? "text-black dark:text-[#94A3B8] after:bg-black dark:after:bg-[#94A3B8]"
                : "text-white/90 hover:text-white after:bg-white"
            }`}
          >
            {t("nav.login")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
            className={`text-sm font-bold tracking-wider px-6 py-2.5 rounded-xl transition-all duration-300 ${
              scrolled || solid
                ? "bg-black dark:bg-[#f39c12] hover:bg-gray-800 dark:hover:bg-[#d68910] text-white dark:text-[#0f1729] shadow-[0_4px_14px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_14px_rgba(243,156,18,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_6px_20px_rgba(243,156,18,0.4)]"
                : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            }`}
          >
            {t("nav.signup")}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
