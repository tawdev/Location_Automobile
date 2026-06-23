"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && user?.role_id === 1) {
      router.replace("/admin/vehicles");
    }
  }, [status, user, router]);

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-500">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
    </div>
  );
}