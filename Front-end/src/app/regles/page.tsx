"use client";

import { motion } from "framer-motion";
import { Info, Gauge, Shield, Ban, Clock, FileText, ChevronRight, Sparkles } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const RULES_KEYS = ["km", "insurance", "age", "duration", "documents"] as const;

const ICONS = [Gauge, Shield, Ban, Clock, FileText] as const;

const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
] as const;

const BG_LIGHTS = [
  "bg-blue-50",
  "bg-emerald-50",
  "bg-rose-50",
  "bg-amber-50",
  "bg-violet-50",
] as const;

const BORDER_HOVERS = [
  "hover:border-blue-200",
  "hover:border-emerald-200",
  "hover:border-rose-200",
  "hover:border-amber-200",
  "hover:border-violet-200",
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ReglesPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
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
                <Info className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">Informations</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {t("rules.title")}
            </h1>
            <p className="text-white/70 text-base font-semibold mt-2 max-w-xl">
              {t("rules.subtitle")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {RULES_KEYS.map((key, index) => {
            const Icon = ICONS[index];
            return (
              <motion.div
                key={key}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#D5DEEF]/30 ${BORDER_HOVERS[index]} transition-all duration-300 relative overflow-hidden`}
              >
                <div
                  className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${GRADIENTS[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="flex items-start gap-5">
                  <div
                    className={`shrink-0 w-14 h-14 rounded-2xl ${BG_LIGHTS[index]} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <Icon className="w-6 h-6 text-[#395886] relative z-10 group-hover:text-white transition-colors duration-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#1d3560] mb-2 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#d08a1b] shrink-0" />
                      {t(`rules.${key}`)}
                    </h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                      {t(`rules.${key}.desc`)}
                    </p>
                    <div className={`${BG_LIGHTS[index]} rounded-xl p-4 border border-[#D5DEEF]/20`}>
                      <p className="text-sm text-gray-500 leading-relaxed flex items-start gap-2">
                        <Info className="w-4 h-4 text-[#395886] shrink-0 mt-0.5" />
                        <span>{t(`rules.${key}.detail`)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
