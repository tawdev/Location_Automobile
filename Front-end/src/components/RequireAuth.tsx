"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  if (status === "loading" || status === "authenticated") return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-black">
      Redirecting...
    </div>
  );
}
