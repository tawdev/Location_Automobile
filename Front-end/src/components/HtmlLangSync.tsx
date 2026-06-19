"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function HtmlLangSync() {
  const { locale, dir } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
