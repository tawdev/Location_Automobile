"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Download, ArrowUp, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { PAGE_TITLES } from "@/lib/seo";

const AnimatedTestimonials = dynamic(
  () => import("@/components/ui/animated-testimonials").then((m) => m.AnimatedTestimonials),
  { ssr: false }
);

type Section = {
  title: string;
  content?: string;
  list?: string[];
  items?: { sub: string; details: string[] }[];
  after?: string;
};

const SECTION_IMAGES = [
  "/images/legal/purpose.svg",
  "/images/legal/eligibility.svg",
  "/images/legal/accounts.svg",
  "/images/legal/booking.svg",
  "/images/legal/pricing.svg",
  "/images/legal/cancellation.svg",
  "/images/legal/insurance.svg",
  "/images/legal/liability.svg",
  "/images/legal/prohibited.svg",
  "/images/legal/privacy.svg",
  "/images/legal/ip.svg",
  "/images/legal/governing.svg",
];

function getSections(t: (key: string) => string): Section[] {
  return [
    {
      title: t("terms.s1_title"),
      content: t("terms.s1_content"),
    },
    {
      title: t("terms.s2_title"),
      content: t("terms.s2_content"),
    },
    {
      title: t("terms.s3_title"),
      content: t("terms.s3_content"),
      list: [
        t("terms.s3_list_1"),
        t("terms.s3_list_2"),
        t("terms.s3_list_3"),
        t("terms.s3_list_4"),
      ],
    },
    {
      title: t("terms.s4_title"),
      list: [
        t("terms.s4_list_1"),
        t("terms.s4_list_2"),
        t("terms.s4_list_3"),
        t("terms.s4_list_4"),
      ],
      after: t("terms.s4_after"),
    },
    {
      title: t("terms.s5_title"),
      items: [
        { sub: t("terms.s5_item_1_sub"), details: [t("terms.s5_item_1_detail_1")] },
        { sub: t("terms.s5_item_2_sub"), details: [t("terms.s5_item_2_detail_1")] },
        { sub: t("terms.s5_item_3_sub"), details: [t("terms.s5_item_3_detail_1")] },
        { sub: t("terms.s5_item_4_sub"), details: [t("terms.s5_item_4_detail_1")] },
      ],
    },
    {
      title: t("terms.s6_title"),
      list: [
        t("terms.s6_list_1"),
        t("terms.s6_list_2"),
        t("terms.s6_list_3"),
        t("terms.s6_list_4"),
      ],
    },
    {
      title: t("terms.s7_title"),
      list: [
        t("terms.s7_list_1"),
        t("terms.s7_list_2"),
        t("terms.s7_list_3"),
        t("terms.s7_list_4"),
      ],
    },
    {
      title: t("terms.s8_title"),
      list: [
        t("terms.s8_list_1"),
        t("terms.s8_list_2"),
        t("terms.s8_list_3"),
        t("terms.s8_list_4"),
        t("terms.s8_list_5"),
        t("terms.s8_list_6"),
      ],
    },
    {
      title: t("terms.s9_title"),
      content: t("terms.s9_content"),
    },
    {
      title: t("terms.s10_title"),
      content: t("terms.s10_content"),
    },
    {
      title: t("terms.s11_title"),
      content: t("terms.s11_content"),
    },
    {
      title: t("terms.s12_title"),
      content: t("terms.s12_content"),
    },
  ];
}

function sectionToQuote(section: Section): string {
  const parts: string[] = [];
  if (section.content) parts.push(section.content);
  if (section.list) parts.push(section.list.join(" "));
  if (section.items) {
    for (const item of section.items) {
      parts.push(item.sub);
      parts.push(item.details.join(" "));
    }
  }
  if (section.after) parts.push(section.after);
  return parts.join(" ");
}

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
          className="absolute rounded-full bg-white/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function TermsPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.terms[typedLocale] || PAGE_TITLES.terms.fr });
  const sections = useMemo(() => getSections(t), [t]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = useMemo(
    () =>
      sections.map((section, i) => ({
        name: section.title,
        designation: `Section ${i < 9 ? `0${i + 1}` : i + 1}`,
        quote: sectionToQuote(section),
        src: SECTION_IMAGES[i] || SECTION_IMAGES[0],
      })),
    [sections]
  );

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <Particles />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-14">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#FF7B00] text-sm font-bold uppercase tracking-[0.2em]">{t("legal.badge_terms")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#FF7B00] tracking-tight leading-tight">
              {t("legal.title_terms")}
              <br />
              <span className="text-[#FF7B00]">
                {t("legal.title_terms_accent")}
              </span>
            </h1>
            <p className="text-[#FF7B00] text-base font-semibold mt-3 max-w-xl">
              {t("legal.subtitle_terms")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10"
          >
            {[
              { label: t("legal.sections"), value: sections.length },
              { label: t("legal.last_updated"), value: "Juin 2026" },
              { label: t("legal.document"), value: t("legal.doc_terms") },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.1em]">{s.label}</p>
                <p className="text-white/90 text-sm font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* Animated Testimonials Viewer */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 -mt-4 relative z-0 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mb-4 text-[#638ECB]/50 dark:text-[#94A3B8]/50 text-xs font-bold uppercase tracking-[0.15em]"
        >
          <Sparkles className="w-3 h-3" />
          {t("legal.click_hint")}
          <Sparkles className="w-3 h-3" />
        </motion.div>
      </div>

      <div className="dark:bg-[#070b14]">
        <AnimatedTestimonials
          testimonials={testimonials}
          className="max-w-sm md:max-w-5xl lg:max-w-6xl"
        />
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-0 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#E5E7EB] dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <Shield className="w-3.5 h-3.5" />
            {t("legal.footer_date")}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <motion.a
            href="/downloads/CARFORFAR_Terms_of_Use_Professional.pdf"
            download
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 bg-[#395886] hover:bg-[#2b4c7e] dark:bg-white/10 dark:hover:bg-white/20 text-white font-extrabold px-5 py-3.5 rounded-xl text-xs border border-white/20 shadow-lg uppercase tracking-wider transition-all inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-[#395886] to-[#2b4c7e] dark:from-[#F59E0B] dark:to-[#D97706] text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
