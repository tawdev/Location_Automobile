"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Vehicles", href: "/admin/vehicles" },
  { label: "Categories", href: "/admin/categories" },
];

function SidebarLink({
  label,
  href,
  active,
  onClick,
}: {
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left font-black px-3 py-2 transition-colors border-2",
        active
          ? "bg-[#638ECB] border-[#395886] text-white"
          : "bg-[#D5DEEF] border-[#395886] text-[#395886] hover:bg-[#c7d5ef]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const activeHref = useMemo(() => {
    const found = navItems.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    );
    return found?.href ?? "/admin/vehicles";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-[#395886]">
      <div className="flex">
        <aside className="w-[280px] p-4 hidden md:block">
          <div className="bg-[#D5DEEF] border-2 border-[#395886] shadow-[6px_6px_0px_0px_rgba(57,88,134,0.7)] p-4 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black text-2xl leading-tight">Admin</div>
                <div className="font-bold text-sm mt-1">{user?.name ?? ""}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  active={activeHref === item.href}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>

            <div className="mt-5">
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
                className={[
                  "w-full font-black px-3 py-2 border-2 rounded-md transition-colors",
                  "bg-[#F39C12] border-[#395886] text-[#151515] hover:opacity-95 disabled:opacity-50",
                ].join(" ")}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>

              <div className="mt-2 text-xs font-bold text-[#395886]">
                Client:
                <button
                  type="button"
                  onClick={() => router.push("/vehicles")}
                  className="ml-1 underline"
                >
                  Vehicles
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:p-6 p-4">{children}</main>
      </div>
    </div>
  );
}
