"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user, refreshUser } = useAuth();
  const { t } = useI18n();

  const isAdmin = useMemo(() => {
    if (status !== "authenticated") return false;
    if (user?.role_id === 1 || user?.role_id === 3) return true;
    return !!user?.permissions && user.permissions.length > 0;
  }, [status, user?.role_id, user?.permissions]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !isAdmin) {
      if (user?.permissions === undefined) {
        refreshUser();
      } else {
        router.replace("/vehicules");
      }
    }
  }, [isAdmin, router, status, user?.permissions, refreshUser]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-black">
        {t("loading")}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        {t("redirecting_login")}
      </div>
    );
  }

  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-black text-xl">{t("access_denied")}</div>
          <div className="font-bold mt-2 text-sm">
            {t("access_denied_admin")}
          </div>
          <button
            type="button"
            onClick={() => router.push("/vehicules")}
            className="mt-4 font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
          >
            {t("vehicle.back")}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
