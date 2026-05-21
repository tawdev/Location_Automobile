"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

// Sleek Custom SVG Icons
function FleetIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
        active
          ? "bg-[#395886] text-white shadow-md hover:bg-[#395886]/95"
          : "text-[#638ECB] hover:text-[#395886] hover:bg-[#F0F3FA]"
      }`}
    >
      <span className={active ? "text-white" : "text-[#638ECB] group-hover:text-[#395886]"}>
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
      { label: "Vehicles", href: "/admin/vehicles", icon: <FleetIcon /> },
      { label: "Categories", href: "/admin/categories", icon: <CategoryIcon /> },
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

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-[#395886] flex">
      {/* Permanent Elegant Sticky Sidebar */}
      <aside className="w-[260px] h-screen sticky top-0 bg-white border-r border-[#D5DEEF]/65 flex flex-col justify-between p-6 shrink-0 hidden md:flex shadow-sm z-30">
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center text-white text-lg font-black shadow-md shadow-[#395886]/10">
              LA
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#638ECB] block leading-none">Management</span>
              <span className="text-base font-extrabold text-[#395886] leading-none mt-1.5 block">Fleet Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
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

        {/* User profile & Actions */}
        <div className="flex flex-col gap-4 border-t border-[#D5DEEF]/50 pt-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#638ECB]/20 to-[#395886]/20 border border-[#D5DEEF] flex items-center justify-center text-[#395886] font-black shadow-sm text-sm">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#638ECB]/90 block truncate leading-none">Authenticated As</span>
              <span className="text-sm font-extrabold text-[#395886] truncate block mt-1.5 leading-none">
                {user?.name ?? "Administrator"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
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
              className="w-full h-11 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogoutIcon />
              <span>{loggingOut ? "Logging out..." : "Sign Out"}</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/vehicles")}
              className="w-full text-center text-xs font-bold text-[#638ECB] hover:text-[#395886] py-1 underline cursor-pointer"
            >
              Client Showcase
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
