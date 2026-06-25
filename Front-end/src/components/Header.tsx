"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Car,
  Clock,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  House,
  LogIn,
  UserPlus,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AboutDropdown from "@/components/AboutDropdown";

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
          src="/logo.png"
          alt="CARFORFAR logo"
          className="h-28 sm:h-36 w-auto object-contain select-none dark:hidden"
        />
        <img
          src="/logo-dark.png"
          alt="CARFORFAR logo"
          className="h-28 sm:h-36 w-auto object-contain select-none hidden dark:block"
        />
      </motion.div>
    </motion.div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  transparent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  transparent: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
        transparent
          ? active
            ? "text-white"
            : "text-white/70 hover:text-white"
          : active
            ? "text-white"
            : "text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50"
      }`}
    >
      {active && !transparent && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] shadow-lg shadow-[#395886]/20"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${active && !transparent ? "text-white" : ""}`} />
        {label}
      </span>
    </motion.button>
  );
}

function AccountDropdown({
  pathname,
  router,
  onLogout,
  t,
  transparent,
}: {
  pathname: string;
  router: ReturnType<typeof useRouter>;
  onLogout: () => void;
  t: (key: string) => string;
  transparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive =
    pathname.includes("/profile") ||
    pathname === "/MyReservations" ||
    pathname === "/settings";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const items = [
    { label: t("nav.profile"), href: "/profile", icon: User },
    { label: t("nav.reservations"), href: "/MyReservations", icon: Clock },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
          transparent
            ? isActive
              ? "text-white"
              : "text-white/70 hover:text-white"
            : isActive
              ? "text-white"
              : "text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] shadow-lg shadow-[#395886]/20"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <User className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
          {t("nav.my_account")}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            <ChevronDown className={`w-3.5 h-3.5 ${isActive ? "text-white" : ""}`} />
          </motion.span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            aria-label={t("nav.my_account")}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white/90 dark:bg-[#0f1729]/95 backdrop-blur-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/80 shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-2 z-50"
          >
            {items.map((item) => {
              const active =
                item.href === "/profile" ? pathname.includes("/profile") : pathname === item.href;
              return (
                <button
                  key={item.href}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                    active
                      ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                      : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-1.5" />

            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({ solid }: { solid?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(solid ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !solid;
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    if (!isTransparent) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isTransparent]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await authLogout();
    } finally {
      clearAuthToken();
      router.push("/login");
    }
  };

  const VISITOR_NAV = [
    { label: t("nav.home"), href: "/", icon: House },
    { label: t("nav.vehicules"), href: "/vehicules", icon: Car },
  ];

  const NAV_ITEMS = [
    { label: t("nav.home"), href: "/", icon: House },
    { label: t("nav.vehicules"), href: "/vehicules", icon: Car },
  ];

  const ACCOUNT_ITEMS = [
    { label: t("nav.profile"), href: "/profile", icon: User },
    { label: t("nav.reservations"), href: "/MyReservations", icon: Clock },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  const accountActive =
    pathname.includes("/profile") ||
    pathname === "/MyReservations" ||
    pathname === "/settings";

  useEffect(() => {
    setMobileOpen(false);
    setMobileAccountOpen(false);
  }, [pathname]);

  const isTransparentState = isTransparent && !scrolled;

  const headerClasses = isTransparentState
    ? "bg-transparent dark:bg-transparent"
    : "bg-[#F0F3FA]/80 dark:bg-[#0f1729]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(57,88,134,0.12)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-[#D5DEEF]/30 dark:border-[#1e293b]/80";

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${headerClasses}`}
      >
        <div dir="ltr" className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="-ml-6">
            <Logo onClick={() => router.push("/vehicules")} />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname === item.href}
                onClick={() => router.push(item.href)}
                transparent={isTransparentState}
              />
            ))}
            <AboutDropdown
              variant={isTransparentState ? "visitor" : "client"}
              scrolled={scrolled || !isTransparent}
              isActive={
                pathname.startsWith("/a-propos") ||
                pathname.startsWith("/regles") ||
                pathname.startsWith("/company/") ||
                pathname.startsWith("/support/") ||
                pathname === "/contact" ||
                pathname === "/faq" ||
                pathname === "/privacy" ||
                pathname === "/terms" ||
                pathname === "/insurance"
              }
            />
            {isAuthenticated && (
              <AccountDropdown pathname={pathname} router={router} onLogout={handleLogout} t={t} transparent={isTransparentState} />
            )}
            <LanguageSwitcher />
            <div className="w-px h-8 bg-[#D5DEEF]/60 dark:bg-[#1e293b]/60 mx-3" />
            <motion.button
              whileHover={{ scale: 1.1, rotate: dark ? -15 : 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                dark
                  ? "bg-[#1e293b] text-[#f39c12] border border-[#f39c12]/20"
                  : isTransparentState
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    : "bg-[#F0F3FA] text-[#395886] border border-[#D5DEEF]/40 hover:bg-[#e4e8f0]"
              }`}
              aria-label={dark ? t("theme.light") : t("theme.dark")}
            >
              {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>
            {!isAuthenticated && (
              <>
                <div className="w-px h-8 bg-[#D5DEEF]/60 dark:bg-[#1e293b]/60 mx-3" />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push("/login")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isTransparentState
                      ? "text-white/90 hover:text-white"
                      : "text-[#395886] dark:text-white hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  {t("nav.login")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/register")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isTransparentState
                      ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                      : "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-lg shadow-[#395886]/20 hover:shadow-xl"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {t("nav.signup")}
                </motion.button>
              </>
            )}
          </nav>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center ${
              isTransparentState
                ? "bg-white/10 text-white"
                : "bg-[#F0F3FA] text-[#395886]"
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.header>

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
                      pathname === item.href
                        ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                        : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}

                {isAuthenticated && (
                  <div className="rounded-xl overflow-hidden">
                    <button
                      onClick={() => setMobileAccountOpen((o) => !o)}
                      aria-expanded={mobileAccountOpen}
                      aria-controls="mobile-account-panel"
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                        accountActive
                          ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                          : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <User className="w-4 h-4" />
                        {t("nav.my_account")}
                      </span>
                      <motion.span
                        animate={{ rotate: mobileAccountOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileAccountOpen && (
                        <motion.div
                          id="mobile-account-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-1 pt-1 pb-1 pl-4">
                            {ACCOUNT_ITEMS.map((item) => {
                              const active =
                                item.href === "/profile"
                                  ? pathname.includes("/profile")
                                  : pathname === item.href;
                              return (
                                <button
                                  key={item.href}
                                  onClick={() => router.push(item.href)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                    active
                                      ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                                      : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                                  }`}
                                >
                                  <item.icon className="w-4 h-4" />
                                  {item.label}
                                </button>
                              );
                            })}
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              {t("nav.logout")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button
                  onClick={() => router.push("/a-propos")}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    pathname === "/a-propos"
                      ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                      : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t("nav.about")}
                </button>
                <button
                  onClick={() => router.push("/regles")}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    pathname === "/regles"
                      ? "bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-md"
                      : "text-[#395886] dark:text-[#94A3B8] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50"
                  }`}
                >
                  <Car className="w-4 h-4" />
                  {t("nav.rules")}
                </button>
                <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-2" />

                <div className="px-4 py-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-2">{t("footer.company")}</p>
                      <div className="flex flex-col gap-1.5">
                        {[{ label: t("footer.about"), href: "/a-propos" }, { label: t("footer.careers"), href: "/company/careers" }, { label: t("footer.press"), href: "/company/press" }, { label: t("footer.blog"), href: "/company/blog" }].map((l) => (
                          <a key={l.label} href={l.href} className="text-xs font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l.label}</a>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-2">{t("footer.support")}</p>
                      <div className="flex flex-col gap-1.5">
                        {[{ label: t("footer.help_center"), href: "/support/help-center" }, { label: t("footer.contact_us"), href: "/contact" }, { label: t("footer.faq"), href: "/faq" }, { label: t("footer.cancellation"), href: "/support/cancellation" }].map((l) => (
                          <a key={l.label} href={l.href} className="text-xs font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l.label}</a>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-[0.15em] mb-2">{t("footer.legal")}</p>
                      <div className="flex flex-col gap-1.5">
                        {[{ label: t("footer.privacy"), href: "/privacy" }, { label: t("footer.terms"), href: "/terms" }, { label: t("footer.insurance"), href: "/insurance" }].map((l) => (
                          <a key={l.label} href={l.href} className="text-xs font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">{l.label}</a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-2" />
                <div className="flex items-center justify-center gap-4 py-2">
                  <LanguageSwitcher />
                  <div className="w-px h-6 bg-[#D5DEEF]/40 dark:bg-[#1e293b]/60" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDark}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      dark
                        ? "bg-[#1e293b] text-[#f39c12] border border-[#f39c12]/20"
                        : "bg-[#F0F3FA] text-[#395886] border border-[#D5DEEF]/40"
                    }`}
                    aria-label={dark ? t("theme.light") : t("theme.dark")}
                  >
                    {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </motion.button>
                </div>
                {!isAuthenticated && (
                  <>
                    <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60 my-2" />
                    <div className="flex flex-col gap-2 px-4 py-2">
                      <button
                        onClick={() => router.push("/login")}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[#395886] dark:text-white border border-[#D5DEEF] dark:border-[#1e293b] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]/50 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        {t("nav.login")}
                      </button>
                      <button
                        onClick={() => router.push("/register")}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white shadow-lg transition-all"
                      >
                        <UserPlus className="w-4 h-4" />
                        {t("nav.signup")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
