"use client";

import { m } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useSettings } from "@/lib/SettingsContext";

const STAT_KEYS = [
  { valueKey: "stat_1_value", labelEnKey: "stat_1_label_en", labelFrKey: "stat_1_label_fr", labelArKey: "stat_1_label_ar", fallbackLabelKey: "home.stats.years" },
  { valueKey: "stat_2_value", labelEnKey: "stat_2_label_en", labelFrKey: "stat_2_label_fr", labelArKey: "stat_2_label_ar", fallbackLabelKey: "home.stats.vehicles" },
  { valueKey: "stat_3_value", labelEnKey: "stat_3_label_en", labelFrKey: "stat_3_label_fr", labelArKey: "stat_3_label_ar", fallbackLabelKey: "home.stats.clients" },
  { valueKey: "stat_4_value", labelEnKey: "stat_4_label_en", labelFrKey: "stat_4_label_fr", labelArKey: "stat_4_label_ar", fallbackLabelKey: "home.stats.support" },
];

const STAT_FALLBACK_VALUES: Record<string, string> = {
  stat_1_value: "15+",
  stat_1_label_en: "Years of expertise",
  stat_1_label_fr: "Années d'expertise",
  stat_1_label_ar: "سنوات من الخبرة",
  stat_2_value: "200+",
  stat_2_label_en: "Vehicles available",
  stat_2_label_fr: "Véhicules disponibles",
  stat_2_label_ar: "مركبة متاحة",
  stat_3_value: "5000+",
  stat_3_label_en: "Satisfied clients",
  stat_3_label_fr: "Clients satisfaits",
  stat_3_label_ar: "عميل راضٍ",
  stat_4_value: "24/7",
  stat_4_label_en: "Customer support",
  stat_4_label_fr: "Support client",
  stat_4_label_ar: "دعم العملاء",
};

export default function StatsSection() {
  const { t, locale } = useI18n();
  const { settings } = useSettings();

  const getStatValue = (key: string): string => {
    return (settings as Record<string, string>)[key] ?? STAT_FALLBACK_VALUES[key] ?? "";
  };

  const getStatLabel = (stat: (typeof STAT_KEYS)[number]): string => {
    const labelKey = locale === "en" ? stat.labelEnKey : locale === "fr" ? stat.labelFrKey : stat.labelArKey;
    const customLabel = (settings as Record<string, string>)[labelKey];
    if (customLabel) return customLabel;
    return t(stat.fallbackLabelKey);
  };

  return (
    <section className="bg-[#395886] dark:bg-[#0b1121] py-24 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Decorative elements */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#638ECB]/20 dark:border-[#638ECB]/10"
        style={{ animation: 'spin-slow 80s linear infinite' }}
      />
      <div
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full border border-[#F39C12]/10 dark:border-[#F39C12]/5"
        style={{ animation: 'spin-slow 60s linear infinite reverse' }}
      />
      <div className="absolute inset-0" style={{ background: '#666A6D' }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_KEYS.map((stat, i) => (
            <m.div
              key={stat.valueKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center group"
            >
              <m.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-5 transition-all duration-500 group-hover:bg-[#F39C12]/20 group-hover:border-[#F39C12]/30 group-hover:shadow-[0_0_30px_rgba(243,156,18,0.15)]"
              >
                <m.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  className="text-3xl md:text-4xl font-black text-[#F39C12] block"
                >
                  {getStatValue(stat.valueKey)}
                </m.span>
              </m.div>
              <span className="text-sm text-[#D5DEEF] font-medium block transition-colors duration-300 group-hover:text-white">{getStatLabel(stat)}</span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
