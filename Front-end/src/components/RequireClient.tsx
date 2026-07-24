"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function RequireClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const { t } = useI18n();

  const isAdmin = status === "authenticated" && (user?.role_id === 1 || user?.role_id === 3);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router, status]);

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

  if (isAdmin) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-black text-xl">{t("access_denied")}</div>
          <div className="font-bold mt-2 text-sm">
            {t("access_denied_client")}
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="mt-4 font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100 cursor-pointer"
          >
            {t("back_to_admin")}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
