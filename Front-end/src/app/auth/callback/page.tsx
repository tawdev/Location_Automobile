"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { setAuthToken } from "@/lib/tokenStorage";
import { authUser } from "@/lib/authApi";
import { Loader2 } from "lucide-react";

function CallbackInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Connexion Google échouée. Veuillez réessayer.");
      return;
    }

    // Token is in the URL fragment (#token=xxx) to avoid server logging
    const hash = window.location.hash;
    let token: string | null = null;
    if (hash) {
      const match = hash.match(/[#&]token=([^&]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      setError("Réponse d'authentification invalide.");
      return;
    }

    // Clean up the hash
    window.history.replaceState(null, "", window.location.pathname);

    setAuthToken(token);

    authUser()
      .then((res) => {
        const user = res.data;
        const pendingRedirect = localStorage.getItem("pendingVehicleRedirect");
        localStorage.removeItem("pendingVehicleRedirect");
        window.location.href = pendingRedirect || (user.role_id === 1 ? "/admin" : "/vehicules");
      })
      .catch(() => {
        const pendingRedirect = localStorage.getItem("pendingVehicleRedirect");
        localStorage.removeItem("pendingVehicleRedirect");
        window.location.href = pendingRedirect || "/vehicules";
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
      {error ? (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-4">{error}</p>
          <a
            href="/login"
            className="inline-block bg-[#2B4C7E] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1d3560] transition-colors"
          >
            Retour à la connexion
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#2B4C7E] animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Connexion en cours...</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#2B4C7E] animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Connexion en cours...</p>
        </div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
