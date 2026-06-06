"use client";

import { useRouter, usePathname } from "next/navigation";
import { Car, Clock, User, LogOut, Settings, Menu, X, Info, Moon, Sun } from "lucide-react";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center cursor-pointer group"
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center"
      >
        <img
          src="/omnis-image-69cc2115-a33d-47eb-b371-c7b5386d61d3.jpeg"
          alt="CARFORFAR logo"
          className="h-9 sm:h-10 w-auto object-contain select-none"
        />
      </motion.div>
    </motion.div>
  );
}

function NavLink({ href, icon: Icon, label, active, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
        active
          ? "text-white"
          : "text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50"
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] shadow-lg shadow-[#395886]/20"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${active ? "text-white" : ""}`} />
        {label}
      </span>
    </motion.button>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const isAdmin = status === "authenticated" && user?.role_id === 1;

  const NAV_ITEMS = [
    { label: t("nav.vehicules"), href: "/vehicles", icon: Car },
    { label: t("nav.history"), href: "/MyReservations", icon: Clock },
    { label: t("nav.rules"), href: "/regles", icon: Info },
    { label: t("nav.profile"), href: "/profile", icon: User },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  useEffect(() => {
    if (isAdmin) router.replace("/admin/vehicles");
  }, [isAdmin, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (status === "loading" || isAdmin) {
    return <div className="min-h-screen bg-[#F0F3FA]" />;
  }

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-500">
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#0f1729]/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/80"
            : "bg-white/60 dark:bg-[#0f1729]/60 backdrop-blur-sm border-b border-[#D5DEEF]/20 dark:border-[#1e293b]/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Logo onClick={() => router.push("/vehicles")} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={item.href === "/profile" ? pathname.includes("/profile") : pathname === item.href}
                onClick={() => router.push(item.href)}
              />
            ))}
            <div className="w-px h-8 bg-[#D5DEEF]/60 dark:bg-[#1e293b]/60 mx-3" />
            <LanguageSwitcher />
            <div className="w-px h-8 bg-[#D5DEEF]/60 dark:bg-[#1e293b]/60 mx-3" />
            <motion.button
              whileHover={{ scale: 1.1, rotate: dark ? -15 : 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                dark
                  ? "bg-[#1e293b] text-[#f39c12] border border-[#f39c12]/20"
                  : "bg-[#F0F3FA] text-[#395886] border border-[#D5DEEF]/40 hover:bg-[#e4e8f0]"
              }`}
              aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>
            <div className="w-px h-8 bg-[#D5DEEF]/60 dark:bg-[#1e293b]/60 mx-3" />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={async () => {
                try { await authLogout(); } finally { clearAuthToken(); router.push("/login"); }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </motion.button>
          </nav>

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center text-[#395886]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 top-16 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white/90 dark:bg-[#0f1729]/95 backdrop-blur-xl border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/80 shadow-xl mx-4 mt-2 rounded-2xl p-3"
            >
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      (item.href === "/profile" ? pathname.includes("/profile") : pathname === item.href)
                        ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                        : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-2" />
                <div className="flex items-center justify-center py-2">
                  <LanguageSwitcher />
                </div>
                <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-2" />
                <button
                  onClick={async () => {
                    try { await authLogout(); } finally { clearAuthToken(); router.push("/login"); }
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-[#050a14] border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 mt-auto transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <Logo onClick={() => router.push("/vehicles")} />
              <p className="text-sm font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 mt-4 max-w-xs leading-relaxed">
                Service premium de location de véhicules à Marrakech. Conduisez le luxe, conduisez en toute confiance.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-[2]">
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-4">Société</h4>
                <div className="flex flex-col gap-2.5">
                  {["À propos", "Carrières", "Presse", "Blog"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-4">Assistance</h4>
                <div className="flex flex-col gap-2.5">
                  {["Centre d'aide", "Nous contacter", "FAQ", "Annulation"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-4">Mentions légales</h4>
                <div className="flex flex-col gap-2.5">
                  {["Politique de confidentialité", "Conditions d'utilisation", "Assurance"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold text-[#638ECB]/50 dark:text-[#94A3B8]/50">
              &copy; {new Date().getFullYear()} CARFORFAR. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
