"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Star, HeadphonesIcon, Award, ChevronRight, Sparkles, Target, HeartHandshake } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

const VALUES = [
  {
    icon: Shield,
    titleKey: "about.value1_title",
    descKey: "about.value1_desc",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Star,
    titleKey: "about.value2_title",
    descKey: "about.value2_desc",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: HeadphonesIcon,
    titleKey: "about.value3_title",
    descKey: "about.value3_desc",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Award,
    titleKey: "about.value4_title",
    descKey: "about.value4_desc",
    gradient: "from-amber-500 to-orange-500",
  },
];

const STATS = [
  { valueKey: "about.stat1_value", labelKey: "about.stat1_label" },
  { valueKey: "about.stat2_value", labelKey: "about.stat2_label" },
  { valueKey: "about.stat3_value", labelKey: "about.stat3_label" },
  { valueKey: "about.stat4_value", labelKey: "about.stat4_label" },
];

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
    })));
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 dark:bg-[#F39C12]/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function AProposPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.a_propos[typedLocale] || PAGE_TITLES.a_propos.fr });

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <Particles />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("about.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {t("about.title")}
            </h1>
            <p className="text-white/70 text-base font-semibold mt-2 max-w-xl">
              {t("about.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* Stats */}
      <div className="relative max-w-7xl mx-auto px-6 -mt-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-[#0f1729]/90 rounded-2xl shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 p-6"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-[#395886] dark:text-[#F39C12]">{t(stat.valueKey)}</p>
              <p className="text-xs font-bold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-wider mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Story section */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-[#0f1729]/90 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[#D5DEEF]/30 dark:border-[#1e293b]/70"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#F39C12]" />
            <h2 className="text-2xl font-black text-[#395886] dark:text-white">{t("about.story_title")}</h2>
          </div>
          <div className="space-y-4 text-gray-600 dark:text-[#94A3B8] text-[15px] leading-relaxed">
            <p>{t("about.story_text1")}</p>
            <p>{t("about.story_text2")}</p>
          </div>
        </motion.div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#395886] to-[#1d3560] rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shrink-0">
              <HeartHandshake className="w-6 h-6 text-[#F39C12]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-3">{t("about.mission_title")}</h2>
              <p className="text-white/80 text-[15px] leading-relaxed max-w-3xl">{t("about.mission_text")}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#395886] dark:text-white">{t("about.values_title")}</h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] font-semibold text-sm mt-2">{t("about.values_subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-[#0f1729]/90 rounded-2xl p-6 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#395886] dark:text-white flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#d08a1b] dark:text-[#F39C12] shrink-0" />
                      {t(value.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-[#94A3B8] text-sm leading-relaxed mt-2">{t(value.descKey)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
