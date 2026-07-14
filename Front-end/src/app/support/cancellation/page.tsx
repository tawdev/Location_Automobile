"use client";

import { motion } from "framer-motion";
import { X, RotateCcw, Clock, Calendar, Shield, ChevronRight, Sparkles } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

const SECTIONS = [
  { key: "refund", icon: RotateCcw, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "fees", icon: Clock, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { key: "modify", icon: Calendar, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

export default function CancellationPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.cancellation[typedLocale] || PAGE_TITLES.cancellation.fr });
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
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
                <X className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("footer.cancellation")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {t("footer.cancellation")}
            </h1>
            <p className="text-white/70 text-base font-semibold mt-3 max-w-xl">
              {t("faq.a6")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {SECTIONS.map(({ key, icon: Icon, gradient, bg }) => (
            <motion.div
              key={key}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-[#0f1729]/90 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 hover:border-[#638ECB]/30 dark:hover:border-[#ff8d21]/20 transition-all duration-500 hover:shadow-xl"
            >
              <div className={`absolute top-0 left-6 right-6 h-1.5 rounded-full bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-left`} />
              <div className="flex items-start gap-5 relative z-10">
                <div className={`shrink-0 w-14 h-14 rounded-2xl ${bg} flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <Icon className="w-6 h-6 text-[#395886] dark:text-[#94A3B8] relative z-10 group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-[#1d3560] dark:text-[#D5DEEF] mb-2 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[#d08a1b] dark:text-[#ff8d21] shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                    {t(`cancellation.${key}_title`)}
                  </h2>
                  <p className="text-gray-600 dark:text-[#94A3B8] text-[15px] leading-relaxed">
                    {t(`cancellation.${key}_desc`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <Shield className="w-3.5 h-3.5" />
            {t("faq.more_help")}
            <a href="/contact" className="text-[#ff8d21] hover:underline font-bold ml-1">
              {t("faq.contact_link")}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
