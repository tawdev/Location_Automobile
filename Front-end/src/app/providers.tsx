"use client";

import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
