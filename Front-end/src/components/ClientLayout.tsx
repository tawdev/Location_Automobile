"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const isAdmin = status === "authenticated" && (user?.role_id === 1 || user?.role_id === 3);

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-500">
        <Header />
        <main className="flex-1 pt-16 md:pt-20 flex items-center justify-center">
          <div className="animate-pulse text-[#395886] dark:text-[#D5DEEF] font-bold">
            Redirection vers le bureau admin...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-500">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
    </div>
  );
}