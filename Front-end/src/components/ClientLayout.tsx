"use client";

import { useRouter, usePathname } from "next/navigation";
import { Car, Clock, User, LogOut, Settings, Menu, X, Info, Globe } from "lucide-react";
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
      className="flex items-center gap-2.5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <motion.div
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#395886] to-[#1d3560] flex items-center justify-center shadow-lg shadow-[#395886]/20 group-hover:shadow-[#395886]/30 transition-shadow"
          whileHover={{ scale: 1.05, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="22" height="16" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 16C5 16 10 6 20 6C30 6 35 16 35 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M10 16L30 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="18" r="3" fill="white" stroke="white" strokeWidth="1.5" />
            <circle cx="28" cy="18" r="3" fill="white" stroke="white" strokeWidth="1.5" />
            <path d="M18 10L25 10L27 16" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[#638ECB]/20 to-[#395886]/20 blur-md -z-10"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[#395886] font-black italic tracking-[0.15em] text-sm leading-none">CARFORFAR</span>
        <span className="text-[10px] font-bold text-[#638ECB]/60 tracking-[0.2em] uppercase leading-none mt-0.5">Location</span>
      </div>
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
          : "text-[#395886]/70 hover:text-[#395886] hover:bg-[#F0F3FA]/80"
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
    <div className="min-h-screen bg-[#F0F3FA] flex flex-col font-sans">
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-[#D5DEEF]/40"
            : "bg-white/60 backdrop-blur-sm border-b border-[#D5DEEF]/20"
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
            <div className="w-px h-8 bg-[#D5DEEF]/60 mx-3" />
            <LanguageSwitcher />
            <div className="w-px h-8 bg-[#D5DEEF]/60 mx-3" />
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
              className="relative bg-white/90 backdrop-blur-xl border-b border-[#D5DEEF]/40 shadow-xl mx-4 mt-2 rounded-2xl p-3"
            >
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      (item.href === "/profile" ? pathname.includes("/profile") : pathname === item.href)
                        ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                        : "text-[#395886] hover:bg-[#F0F3FA]"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-[#D5DEEF]/40 my-2" />
                <div className="flex items-center justify-center py-2">
                  <LanguageSwitcher />
                </div>
                <div className="border-t border-[#D5DEEF]/40 my-2" />
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
      <footer className="bg-white border-t border-[#D5DEEF]/40 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <Logo onClick={() => router.push("/vehicles")} />
              <p className="text-sm font-semibold text-[#638ECB]/70 mt-4 max-w-xs leading-relaxed">
                Service premium de location de véhicules à Marrakech. Conduisez le luxe, conduisez en toute confiance.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-[2]">
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] uppercase tracking-[0.15em] mb-4">Société</h4>
                <div className="flex flex-col gap-2.5">
                  {["À propos", "Carrières", "Presse", "Blog"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 hover:text-[#395886] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] uppercase tracking-[0.15em] mb-4">Assistance</h4>
                <div className="flex flex-col gap-2.5">
                  {["Centre d'aide", "Nous contacter", "FAQ", "Annulation"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 hover:text-[#395886] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#395886] uppercase tracking-[0.15em] mb-4">Mentions légales</h4>
                <div className="flex flex-col gap-2.5">
                  {["Politique de confidentialité", "Conditions d'utilisation", "Assurance"].map((l) => (
                    <a key={l} href="#" className="text-sm font-semibold text-[#638ECB]/70 hover:text-[#395886] transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[#D5DEEF]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold text-[#638ECB]/50">
              &copy; {new Date().getFullYear()} CARFORFAR. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
