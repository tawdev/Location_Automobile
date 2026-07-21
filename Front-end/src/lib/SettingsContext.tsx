"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettings, type SiteSettings } from "./adminSettingsApi";

type SettingsContextValue = {
  settings: SiteSettings;
  loading: boolean;
};

const defaults: SiteSettings = {
  address: "Marrakech, Morocco",
  phone: "+212524308038",
  email: "contact@carforfar.com",
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaults,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
