"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function HtmlLangSync() {
  const { locale, dir } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = locale;
    // Don't change direction on admin pages — they must stay LTR
    if (!pathname.startsWith("/admin")) {
      document.documentElement.dir = dir;
    }
  }, [locale, dir, pathname]);

  return null;
}
