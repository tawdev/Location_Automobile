"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type FAQItem = {
  q: string;
  a: string;
};

function getFaqItems(t: (key: string) => string): FAQItem[] {
  return [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
    { q: t("faq.q9"), a: t("faq.a9") },
    { q: t("faq.q10"), a: t("faq.a10") },
  ];
}

export default function FaqPage() {
  const { t, locale } = useI18n();
  const items = useMemo(() => getFaqItems(t), [t]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const isRtl = locale === "ar";

  const filtered = items.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
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
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("faq.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {t("faq.title")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-amber-300">
                {t("faq.title_accent")}
              </span>
            </h1>
            <p className="text-white/70 text-base font-semibold mt-3 max-w-xl">
              {t("faq.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#638ECB]/50 dark:text-[#94A3B8]/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            placeholder={t("faq.search_placeholder")}
            className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 bg-white dark:bg-[#0f1729] text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#f39c12]/30 focus:border-[#f39c12]/50 shadow-sm transition-all ${isRtl ? "text-right" : "text-left"}`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mb-6 text-[#638ECB]/50 dark:text-[#94A3B8]/50 text-xs font-bold uppercase tracking-[0.15em]"
        >
          <Sparkles className="w-3 h-3" />
          {t("faq.click_hint")}
          <Sparkles className="w-3 h-3" />
        </motion.div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 mx-auto text-[#638ECB]/30 dark:text-[#94A3B8]/30 mb-3" />
            <p className="text-sm font-bold text-[#638ECB]/60 dark:text-[#94A3B8]/60">{t("faq.no_results")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-[#638ECB]/30 bg-white dark:bg-[#0f1729] shadow-md"
                      : "border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-white/50 dark:bg-[#0f1729]/20 hover:bg-white dark:hover:bg-[#0f1729]/40"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-5 text-left"
                  >
                    <span className={`font-bold text-sm text-[#395886] dark:text-white pr-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 w-8 h-8 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#638ECB] dark:text-[#94A3B8]"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`px-5 pb-5 pt-1 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 mt-1 whitespace-pre-line ${isRtl ? "text-right" : "text-left"}`}>
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <HelpCircle className="w-3.5 h-3.5" />
            {t("faq.more_help")}
            <a href="/contact" className="text-[#f39c12] hover:underline font-bold ml-1">
              {t("faq.contact_link")}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
