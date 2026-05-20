"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F0F3FA] flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="bg-[#D5DEEF] px-10 h-20 flex items-center justify-between border-b border-[#D5DEEF]/50">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/vehicles")}
        >
          {/* Simple CARFORFAR Logo mimicking the image */}
          <div className="flex flex-col items-center">
             <div className="relative w-16 h-8 flex items-center justify-center">
               <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 16C5 16 10 6 20 6C30 6 35 16 35 16" stroke="#2B4C7E" strokeWidth="2" strokeLinecap="round" />
                 <path d="M10 16L30 16" stroke="#2B4C7E" strokeWidth="2" strokeLinecap="round" />
                 <circle cx="12" cy="18" r="3" fill="none" stroke="#2B4C7E" strokeWidth="2" />
                 <circle cx="28" cy="18" r="3" fill="none" stroke="#2B4C7E" strokeWidth="2" />
                 <path d="M18 10L25 10L27 16" stroke="#2B4C7E" strokeWidth="2" fill="none" />
               </svg>
             </div>
             <span className="text-[#2B4C7E] font-black italic tracking-widest text-sm leading-none mt-[-4px]">
               CARFORFAR
             </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => router.push("/vehicles")}
            className={`text-[#2B4C7E] text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity ${pathname === "/vehicles" ? "border-b-2 border-[#2B4C7E] pb-1" : ""}`}
          >
            Vehicles
          </button>

          <button
            onClick={() => router.push("/MyReservations")}
            className={`text-[#2B4C7E] text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity ${pathname === "/MyReservations" ? "border-b-2 border-[#2B4C7E] pb-1" : ""}`}
          >
            History
          </button>

          <button
            onClick={() => router.push("/profile")}
            className={`text-[#2B4C7E] text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity ${pathname.includes("/profile") ? "border-b-2 border-[#2B4C7E] pb-1" : ""}`}
          >
            Profile
          </button>

          <button
            onClick={async () => {
              try {
                await authLogout();
              } finally {
                clearAuthToken();
                router.push("/login");
              }
            }}
            className="flex items-center gap-1.5 text-[#2B4C7E] text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity ml-4"
          >
            Logout
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#E5E7EB] py-12 px-10 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start cursor-pointer w-fit" onClick={() => router.push("/vehicles")}>
               <div className="relative w-16 h-8 flex items-center justify-center">
                 <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M5 16C5 16 10 6 20 6C30 6 35 16 35 16" stroke="#2B4C7E" strokeWidth="2" strokeLinecap="round" />
                   <path d="M10 16L30 16" stroke="#2B4C7E" strokeWidth="2" strokeLinecap="round" />
                   <circle cx="12" cy="18" r="3" fill="none" stroke="#2B4C7E" strokeWidth="2" />
                   <circle cx="28" cy="18" r="3" fill="none" stroke="#2B4C7E" strokeWidth="2" />
                   <path d="M18 10L25 10L27 16" stroke="#2B4C7E" strokeWidth="2" fill="none" />
                 </svg>
               </div>
               <span className="text-[#2B4C7E] font-black italic tracking-widest text-sm leading-none mt-[-4px]">
                 CARFORFAR
               </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="text-gray-600 text-sm font-medium hover:text-[#2B4C7E] transition-colors underline underline-offset-4">Terms of Service</a>
              <a href="#" className="text-gray-600 text-sm font-medium hover:text-[#2B4C7E] transition-colors underline underline-offset-4">Privacy Policy</a>
              <a href="#" className="text-gray-600 text-sm font-medium hover:text-[#2B4C7E] transition-colors underline underline-offset-4">Marrakech Travel Guide</a>
              <a href="#" className="text-gray-600 text-sm font-medium hover:text-[#2B4C7E] transition-colors underline underline-offset-4">Luxury Concierge</a>
              <a href="#" className="text-gray-600 text-sm font-medium hover:text-[#2B4C7E] transition-colors underline underline-offset-4">Contact Us</a>
            </div>
          </div>
          
          <div className="pt-8 text-xs text-gray-500 font-medium">
            © 2024 CARFORFAR Car Rental. Licensed by Moroccan Tourism Authority.
          </div>
        </div>
      </footer>
    </div>
  );
}