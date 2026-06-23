"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { SITE_NAME } from "@/lib/seo";

type LocaleKey = "fr" | "en" | "ar";

interface PageMeta {
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  titleVars?: Record<string, string>;
  descriptionVars?: Record<string, string>;
}

export function useClientMetadata(meta: PageMeta) {
  const { t } = useI18n();

  useEffect(() => {
    const locale = document.documentElement.lang as LocaleKey || "fr";

    let title: string;
    if (meta.title) {
      title = meta.title;
    } else if (meta.titleKey) {
      title = t(meta.titleKey, meta.titleVars);
    } else {
      title = SITE_NAME;
    }
    document.title = title;

    let description: string;
    if (meta.description) {
      description = meta.description;
    } else if (meta.descriptionKey) {
      description = t(meta.descriptionKey, meta.descriptionVars);
    } else {
      description = "";
    }

    let ogDesc = document.querySelector('meta[name="description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    let ogDesc2 = document.querySelector('meta[property="og:description"]');
    if (ogDesc2) {
      ogDesc2.setAttribute("content", description);
    }
  }, [meta.title, meta.description, meta.titleKey, meta.descriptionKey, meta.titleVars, meta.descriptionVars, t]);
}
