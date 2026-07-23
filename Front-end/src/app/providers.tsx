"use client";

import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SettingsProvider } from "@/lib/SettingsContext";
import { useClientPushSubscription } from "@/hooks/useClientPushSubscription";

function PushSubscriber() {
  useClientPushSubscription();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SettingsProvider>
          <PushSubscriber />
          {children}
        </SettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
