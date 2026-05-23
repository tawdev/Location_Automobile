"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";
import { profileImageUrl } from "@/lib/media";

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
          : "text-[#638ECB] hover:text-[#395886] hover:bg-[#F0F3FA]"
      }`}
    >
      <span className={active ? "text-white" : "text-[#638ECB]"}>
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

  const [loggingOut, setLoggingOut] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
      { label: "Véhicules", href: "/admin/vehicles", icon: <FleetIcon /> },
      { label: "Réservations", href: "/admin/reservations", icon: <CalendarIcon /> },
      { label: "Profil", href: "/admin/profile", icon: <UserIcon /> },
    ],
    []
  );

  const activeHref = useMemo(() => {
    const found = navItems.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    );
    return found?.href ?? "/admin/vehicles";
  }, [pathname, navItems]);

  const userInitial = useMemo(() => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "A";
  }, [user]);

  const userProfilePicUrl = useMemo(() => {
    return user?.profile_pic ? profileImageUrl(user.profile_pic) : null;
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-[#395886] flex">
      {/* Sidebar */}
      <aside className="w-[240px] h-screen sticky top-0 bg-white border-r border-[#D5DEEF] flex flex-col justify-between p-5 shrink-0 hidden md:flex z-30">
        {/* Logo */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#395886] flex items-center justify-center text-white text-sm font-black">
              LA
            </div>
            <div className="text-sm font-extrabold text-[#395886]">Administration</div>
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
        <div className="flex flex-col gap-3 border-t border-[#D5DEEF] pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/profile")}
            className="flex items-center gap-2.5 w-full text-left cursor-pointer hover:bg-[#F0F3FA] rounded-lg p-1.5 -mx-1.5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-[#395886] font-bold text-xs shrink-0 overflow-hidden">
              {userProfilePicUrl ? (
                <img src={userProfilePicUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#395886] truncate leading-tight">
                {user?.name ?? "Admin"}
              </div>
              <div className="text-[10px] font-semibold text-[#638ECB] truncate leading-tight">
                {user?.email ?? ""}
              </div>
            </div>
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
            <span>{loggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>

        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
