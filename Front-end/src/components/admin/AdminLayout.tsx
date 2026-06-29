"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";
import { profileImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";


type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

// Sleek Custom SVG Icons
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function FleetIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function PermissionsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ExtrasIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ConditionsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function MarqueIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11a3 3 0 10-3-3m0 0a3 3 0 00-3 3m3-3h0" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function NewspaperIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function TypeVehiculeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SidebarLink({
  label,
  active,
  icon,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
        small ? "text-[11px]" : "text-sm"
      } ${
        active
          ? "bg-[#395886] text-white shadow-sm"
          : "text-[#638ECB] dark:text-[#94A3B8] hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]"
      }`}
    >
      <span className={active ? "text-white" : "text-[#638ECB] dark:text-[#94A3B8]"}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [loggingOut, setLoggingOut] = useState(false);
  const [dark, setDark] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(true);

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

  const allNavItems: NavItem[] = useMemo(
    () => [
      { label: t("admin.dashboard"), href: "/admin", icon: <DashboardIcon /> },
      { label: t("admin_users.title"), href: "/admin/users", icon: <UsersIcon /> },
      { label: t("admin.permissions"), href: "/admin/permissions", icon: <PermissionsIcon /> },
      { label: t("admin.vehicles"), href: "/admin/vehicles", icon: <FleetIcon /> },
      { label: t("admin.marques"), href: "/admin/marques", icon: <MarqueIcon /> },
      { label: t("admin.type_vehicules"), href: "/admin/type-vehicules", icon: <TypeVehiculeIcon /> },
      { label: t("admin.reservations"), href: "/admin/reservations", icon: <CalendarIcon /> },
      { label: t("admin.extras"), href: "/admin/extras", icon: <ExtrasIcon /> },
      { label: t("admin.departure_conditions"), href: "/admin/departure-conditions", icon: <ConditionsIcon /> },
      { label: t("admin.messages"), href: "/admin/messages", icon: <MessageIcon /> },
      { label: t("admin.settings"), href: "/admin/settings", icon: <SettingsIcon /> },
      { label: t("admin.profile"), href: "/admin/profile", icon: <UserIcon /> },
      { label: t("admin.map"), href: "/admin/vehicles/map", icon: <MapIcon /> },
    ],
    [t]
  );

  const userPermissions = useMemo(() => {
    if (!user?.permissions) return new Set<string>();
    return new Set(user.permissions.map((p) => p.slug));
  }, [user?.permissions]);

  const permissionNavMap: Record<string, string[]> = useMemo(() => ({
    manage_messages: ["/admin/messages"],
    manage_reservations: ["/admin/reservations"],
    manage_vehicles: ["/admin/vehicles", "/admin/extras", "/admin/departure-conditions", "/admin/vehicles/map"],
    manage_categories: ["/admin/marques", "/admin/type-vehicules"],
    manage_blogs: ["/admin/blog", "/admin/press", "/admin/careers"],
  }), []);

  const navItems = useMemo(() => {
    if (user?.role_id === 1) return allNavItems;
    const allowed = new Set<string>();
    allowed.add("/admin");
    allowed.add("/admin/profile");
    userPermissions.forEach((slug) => {
      const hrefs = permissionNavMap[slug];
      if (hrefs) hrefs.forEach((h) => allowed.add(h));
    });
    return allNavItems.filter((item) => allowed.has(item.href));
  }, [allNavItems, user?.role_id, userPermissions, permissionNavMap]);

  const showCompany = useMemo(() =>
    user?.role_id === 1 || userPermissions.has("manage_blogs"),
  [user?.role_id, userPermissions]);

  const activeHref = useMemo(() => {
    const sorted = [...navItems].sort((a, b) => b.href.length - a.href.length);
    const found = sorted.find((i) => {
      if (i.href === "/admin") return pathname === i.href;
      return pathname === i.href || pathname.startsWith(i.href + "/");
    });
    return found?.href ?? "/admin/vehicles";
  }, [pathname, navItems]);

  const userInitial = useMemo(() => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "A";
  }, [user]);

  const userProfilePicUrl = useMemo(() => {
    return user?.profile_pic ? profileImageUrl(user.profile_pic) : null;
  }, [user]);

  return (
    <div className={`admin-layout min-h-screen bg-[#F0F3FA] text-[#395886] flex ${dark ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className="w-[240px] h-screen sticky top-0 bg-white dark:bg-[#0f1729] border-r border-[#D5DEEF] dark:border-[#1e293b] flex flex-col shrink-0 hidden md:flex z-30">
        {/* Header */}
        <div className="flex flex-col items-center pt-4 pb-2 px-5">
          <div className="text-base font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("admin.administration")}</div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                label={item.label}
                active={activeHref === item.href}
                icon={item.icon}
                onClick={() => router.push(item.href)}
                small={item.label === t("admin.departure_conditions")}
              />
            ))}

            {/* Company group */}
            {showCompany && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setCompanyOpen((o) => !o)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                  pathname.startsWith("/admin/blog") || pathname.startsWith("/admin/press") || pathname.startsWith("/admin/careers")
                    ? "bg-[#395886] text-white shadow-sm"
                    : "text-[#638ECB] dark:text-[#94A3B8] hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={pathname.startsWith("/admin/blog") || pathname.startsWith("/admin/press") || pathname.startsWith("/admin/careers") ? "text-white" : "text-[#638ECB] dark:text-[#94A3B8]"}>
                    <CompanyIcon />
                  </span>
                  <span>{t("admin.company")}</span>
                </span>
                <motion.span
                  animate={{ rotate: companyOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {companyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5 pl-3 pt-0.5">
                      <SidebarLink
                        label={t("admin.blog")}
                        active={pathname.startsWith("/admin/blog")}
                        icon={<BlogIcon />}
                        onClick={() => router.push("/admin/blog")}
                        small
                      />
                      <SidebarLink
                        label={t("admin.press")}
                        active={pathname.startsWith("/admin/press")}
                        icon={<NewspaperIcon />}
                        onClick={() => router.push("/admin/press")}
                        small
                      />
                      <SidebarLink
                        label={t("admin.careers")}
                        active={pathname.startsWith("/admin/careers")}
                        icon={<BriefcaseIcon />}
                        onClick={() => router.push("/admin/careers")}
                        small
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-[#D5DEEF] dark:border-[#1e293b] pt-4 px-5 pb-3">
          <button
            type="button"
            onClick={() => router.push("/admin/profile")}
            className="flex items-center gap-2.5 w-full text-left cursor-pointer hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b] rounded-lg p-1.5 -mx-1.5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[#F0F3FA] dark:bg-[#1e293b] border border-[#D5DEEF] dark:border-[#334155] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] font-bold text-xs shrink-0 overflow-hidden">
              {userProfilePicUrl ? (
                <img src={userProfilePicUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] truncate leading-tight">
                {user?.name ?? "Admin"}
              </div>
              <div className="text-[10px] font-semibold text-[#638ECB] dark:text-[#94A3B8] truncate leading-tight">
                {user?.email ?? ""}
              </div>
            </div>
          </button>

          <div className="flex justify-center">
            <LanguageSwitcher upward />
          </div>

          <button
            type="button"
            onClick={toggleDark}
            className="w-full h-9 rounded-lg border border-[#D5DEEF] bg-white/50 hover:bg-[#F0F3FA] text-[#395886] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 dark:bg-[#0f1729] dark:border-[#1e293b] dark:hover:bg-[#1e293b]"
            aria-label={t("admin.theme_label")}
          >
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{dark ? "Sombre" : "Clair"}</span>
          </button>

          <button
            type="button"
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              try {
                await authLogout();
              } finally {
                await Promise.resolve();
                await clearAuthToken();
                router.push("/login");
                setLoggingOut(false);
              }
            }}
            className="w-full h-9 rounded-lg border border-[#D5DEEF] hover:bg-[#F0F3FA] text-[#395886] font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogoutIcon />
            <span>{loggingOut ? t("nav.logout_loading") : t("nav.logout")}</span>
          </button>

        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {pathname !== "/admin" && (
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex items-center gap-2 mb-4 text-xs font-bold text-[#638ECB] hover:text-[#395886] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t("back")}</span>
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
