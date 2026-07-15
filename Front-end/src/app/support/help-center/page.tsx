"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Mail, Phone, ChevronRight, Sparkles } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useSettings } from "@/lib/SettingsContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

const CONTACT_METHODS = [
  { key: "phone", icon: Phone },
  { key: "email", icon: Mail },
  { key: "chat", icon: MessageCircle },
] as const;

const HELP_TOPICS = ["booking", "payment", "modification", "support"] as const;

const TOPIC_ICONS = [HelpCircle, HelpCircle, HelpCircle, HelpCircle] as const;

export default function HelpCenterPage() {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.support[typedLocale] || PAGE_TITLES.support.fr });
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#FF7B00] text-sm font-bold uppercase tracking-[0.2em]">{t("faq.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#FF7B00] tracking-tight leading-tight">
              {t("footer.help_center")}
            </h1>
            <p className="text-[#FF7B00] text-base font-semibold mt-3 max-w-xl">
              {t("faq.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#0f1729] rounded-2xl p-8 shadow-sm border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 mb-6"
        >
          <h2 className="text-xl font-bold text-[#1d3560] dark:text-[#D5DEEF] mb-4">
            {t("faq.more_help")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTACT_METHODS.map(({ key, icon: Icon }) => (
              <a
                key={key}
                href={key === "email" ? `mailto:${settings.email || "contact@carforfar.ma"}` : key === "phone" ? `tel:${settings.phone?.replace(/\s/g, "") || "+2125XXXXXXXX"}` : "/contact"}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b]/50 hover:bg-[#e5eaf3] dark:hover:bg-[#1e293b] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#0f1729] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#395886] dark:text-[#F39C12]" />
                </div>
                <span className="font-bold text-sm text-[#395886] dark:text-[#94A3B8] group-hover:text-[#F39C12] transition-colors">
                  {key === "email" ? (settings.email || "contact@carforfar.ma") : key === "phone" ? (settings.phone || "+212 5XX XX XX XX") : t("footer.contact_us")}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <Sparkles className="w-3.5 h-3.5" />
            {t("faq.more_help")}
            <a href="/faq" className="text-[#F39C12] hover:underline font-bold ml-1">
              {t("footer.faq")}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
