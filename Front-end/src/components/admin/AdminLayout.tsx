"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";
import { profileImageUrl } from "@/lib/media";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";


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

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
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

  const navItems: NavItem[] = useMemo(
    () => [
      { label: t("admin.dashboard"), href: "/admin", icon: <DashboardIcon /> },
      { label: "Utilisateurs", href: "/admin/users", icon: <UsersIcon /> },
      { label: t("admin.vehicles"), href: "/admin/vehicles", icon: <FleetIcon /> },
      { label: t("admin.reservations"), href: "/admin/reservations", icon: <CalendarIcon /> },
      { label: t("admin.extras"), href: "/admin/extras", icon: <ExtrasIcon /> },
      { label: "Paramètres", href: "/admin/settings", icon: <SettingsIcon /> },
      { label: t("admin.profile"), href: "/admin/profile", icon: <UserIcon /> },
      { label: t("admin.map"), href: "/admin/vehicles/map", icon: <MapIcon /> },
    ],
    [t]
  );

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
      <aside className="w-[240px] h-screen sticky top-0 bg-white dark:bg-[#0f1729] border-r border-[#D5DEEF] dark:border-[#1e293b] flex flex-col justify-between p-5 shrink-0 hidden md:flex z-30">
        {/* Logo */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CARFORFAR logo"
              className="h-28 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="CARFORFAR logo"
              className="h-28 w-auto object-contain hidden dark:block"
            />
            <div className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("admin.administration")}</div>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                label={item.label}
                active={activeHref === item.href}
                icon={item.icon}
                onClick={() => router.push(item.href)}
              />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-[#D5DEEF] dark:border-[#1e293b] pt-4">
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

          {/* Dark/Light toggle (admin only) */}
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
