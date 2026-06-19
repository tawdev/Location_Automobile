"use client";

import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SettingsProvider } from "@/lib/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
