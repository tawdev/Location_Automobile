"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export function RequireClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  const isAdmin = status === "authenticated" && user?.role_id === 1;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (isAdmin) {
      router.replace("/admin/vehicles");
    }
  }, [isAdmin, router, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-black">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        Redirecting to login...
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-black text-xl">Accès refusé</div>
          <div className="font-bold mt-2 text-sm">
            Cette page est réservée aux clients.
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/vehicles")}
            className="mt-4 font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 cursor-pointer"
          >
            Retour à l'administration
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
