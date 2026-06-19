"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  const isAdmin = status === "authenticated" && user?.role_id === 1;

  useEffect(() => {
    if (isAdmin) router.replace("/admin/vehicles");
  }, [isAdmin, router]);

  if (status === "loading" || isAdmin) {
    return <div className="min-h-screen bg-[#F0F3FA]" />;
  }

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-500">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
    </div>
  );
}