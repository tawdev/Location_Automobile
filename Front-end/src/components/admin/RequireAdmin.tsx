"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  const isAdmin = useMemo(() => {
    return status === "authenticated" && user?.role_id === 1;
  }, [status, user?.role_id]);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/vehicles");
    }
  }, [isAdmin, router, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-black">
        Loading...
      </div>
    );
  }

  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-black text-xl">Access denied</div>
          <div className="font-bold mt-2 text-sm">
            Admins only.
          </div>
          <button
            type="button"
            onClick={() => router.push("/vehicles")}
            className="mt-4 font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
          >
            Back to vehicles
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
