"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  X,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { faqPageLD } from "@/lib/faq-ld";
import { PAGE_TITLES } from "@/lib/seo";
import {
  CardStack,
  CardsContainer,
  CardTransformed,
} from "@/components/ui/scroll-card-stack";

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

function FAQCard({
  item,
  index,
  total,
  isRtl,
  onClick,
}: {
  item: FAQItem;
  index: number;
  total: number;
  isRtl: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-3 text-left w-full h-full cursor-pointer group ${isRtl ? "text-right" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#F39C12] to-[#FF7B00] flex items-center justify-center shadow-lg shadow-[#F39C12]/20 group-hover:scale-110 transition-transform duration-200">
          <MessageCircleQuestion className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F39C12]">
            Question
          </span>
          <span className="text-[10px] font-extrabold text-[#638ECB]/40 dark:text-[#94A3B8]/40">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <h3 className="text-base md:text-lg font-black text-[#395886] dark:text-white leading-snug group-hover:text-[#F39C12] transition-colors duration-200">
        {item.q}
      </h3>

      <p className="text-xs md:text-sm font-semibold leading-relaxed text-slate-500 dark:text-[#94A3B8]/80 whitespace-pre-line overflow-y-auto max-h-[180px] pr-1 custom-scrollbar">
        {item.a}
      </p>

      <div className="mt-auto pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F39C12]/60 group-hover:text-[#F39C12] transition-colors duration-200">
          {isRtl ? "اضغط للتفاصيل" : "Cliquez pour plus de détails"} →
        </span>
      </div>
    </button>
  );
}

export default function FaqPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.faq[typedLocale] || PAGE_TITLES.faq.fr });
  const items = useMemo(() => getFaqItems(t), [t]);
  const faqLD = useMemo(
    () =>
      faqPageLD(
        items.map((item) => ({ question: item.q, answer: item.a }))
      ),
    [items]
  );
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const isRtl = locale === "ar";

  const filtered = items.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(filtered.length - 1, prev + 1));
  }, [filtered.length]);

  const openCard = useCallback(
    (idx: number) => {
      setExpandedIndex(idx);
    },
    []
  );

  const expandPrev = useCallback(() => {
    setExpandedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const expandNext = useCallback(() => {
    setExpandedIndex((prev) =>
      prev !== null && prev < filtered.length - 1 ? prev + 1 : prev
    );
  }, [filtered.length]);

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <JsonLd id="faq-ld" data={faqLD as unknown as Record<string, unknown>} />
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
              {t("faq.title")}
              <br />
              <span className="text-[#FF7B00]">
                {t("faq.title_accent")}
              </span>
            </h1>
            <p className="text-[#FF7B00] text-base font-semibold mt-3 max-w-xl">
              {t("faq.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* ── Search ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#638ECB]/50 dark:text-[#94A3B8]/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            placeholder={t("faq.search_placeholder")}
            className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 bg-white dark:bg-[#0f1729] text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#F39C12]/30 focus:border-[#F39C12]/50 shadow-sm transition-all ${isRtl ? "text-right" : "text-left"}`}
          />
        </motion.div>
      </div>

      {/* ── Card Stack ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 mx-auto text-[#638ECB]/30 dark:text-[#94A3B8]/30 mb-3" />
          <p className="text-sm font-bold text-[#638ECB]/60 dark:text-[#94A3B8]/60">{t("faq.no_results")}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            {/* Left nav button */}
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className={`absolute -left-2 md:-left-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border shadow-lg flex items-center justify-center transition-all duration-200 ${
                activeIndex === 0
                  ? "bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 border-[#D5DEEF]/20 dark:border-[#1e293b]/40 text-[#638ECB]/30 dark:text-[#94A3B8]/30 cursor-not-allowed"
                  : "bg-white dark:bg-[#0f1729] border-[#D5DEEF]/40 dark:border-[#1e293b]/80 text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F39C12] hover:text-white hover:border-[#F39C12] hover:scale-110"
              }`}
            >
              {isRtl ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Right nav button */}
            <button
              onClick={goNext}
              disabled={activeIndex === filtered.length - 1}
              className={`absolute -right-2 md:-right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border shadow-lg flex items-center justify-center transition-all duration-200 ${
                activeIndex === filtered.length - 1
                  ? "bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 border-[#D5DEEF]/20 dark:border-[#1e293b]/40 text-[#638ECB]/30 dark:text-[#94A3B8]/30 cursor-not-allowed"
                  : "bg-white dark:bg-[#0f1729] border-[#D5DEEF]/40 dark:border-[#1e293b]/80 text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F39C12] hover:text-white hover:border-[#F39C12] hover:scale-110"
              }`}
            >
              {isRtl ? <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            <CardStack activeIndex={activeIndex} total={filtered.length}>
              <CardsContainer className="h-[520px] md:h-[480px] w-full">
                {filtered.map((item, idx) => (
                  <CardTransformed
                    key={idx}
                    index={idx}
                    arrayLength={filtered.length}
                    variant="light"
                    incrementY={8}
                    incrementZ={10}
                    incrementRotation={-idx * 4 + 4}
                    className="w-full h-[220px] md:h-[200px]"
                  >
                    <FAQCard
                      item={item}
                      index={idx}
                      total={filtered.length}
                      isRtl={isRtl}
                      onClick={() => openCard(idx)}
                    />
                  </CardTransformed>
                ))}
              </CardsContainer>
            </CardStack>

            {/* Dots indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {filtered.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-6 h-2 bg-[#F39C12]"
                      : "w-2 h-2 bg-[#638ECB]/30 dark:bg-[#94A3B8]/30 hover:bg-[#638ECB]/50 dark:hover:bg-[#94A3B8]/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded Card Overlay ── */}
      <AnimatePresence>
        {expandedIndex !== null && filtered[expandedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
            onClick={() => setExpandedIndex(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-[#D5DEEF]/30 dark:border-[#1e293b]/80 bg-white dark:bg-[#0f1729] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F39C12] to-[#FF7B00]" />
              <button
                onClick={() => setExpandedIndex(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#638ECB] dark:text-[#94A3B8] hover:bg-[#D5DEEF] dark:hover:bg-[#2d3a50] transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {expandedIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); expandPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-sm border border-[#D5DEEF]/30 dark:border-[#1e293b]/80 flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#2d3a50] hover:scale-110 transition-all z-10 shadow-lg"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              )}
              {expandedIndex < filtered.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); expandNext(); }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-sm border border-[#D5DEEF]/30 dark:border-[#1e293b]/80 flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#2d3a50] hover:scale-110 transition-all z-10 shadow-lg"
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}

              <div className={`p-6 md:p-8 ${isRtl ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#F39C12] to-[#FF7B00] flex items-center justify-center shadow-lg shadow-[#F39C12]/20">
                    <MessageCircleQuestion className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F39C12]">
                      Question
                    </span>
                    <p className="text-[10px] font-extrabold text-[#638ECB]/40 dark:text-[#94A3B8]/40">
                      {String(expandedIndex + 1).padStart(2, "0")}/{String(filtered.length).padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-[#395886] dark:text-white leading-snug mb-4">
                  {filtered[expandedIndex].q}
                </h2>

                <div className="border-t border-[#D5DEEF]/30 dark:border-[#1e293b]/60 pt-4">
                  <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-[#94A3B8]/80 whitespace-pre-line max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {filtered[expandedIndex].a}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── More Help ── */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <HelpCircle className="w-3.5 h-3.5" />
            {t("faq.more_help")}
            <a href="/contact" className="text-[#F39C12] hover:underline font-bold ml-1">
              {t("faq.contact_link")}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
