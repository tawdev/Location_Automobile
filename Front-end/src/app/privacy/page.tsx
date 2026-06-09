"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ArrowUp,
  Info,
  Database,
  Target,
  Clock,
  Share2,
  Lock,
  Cookie,
  UserCheck,
  FileEdit,
  Mail,
  Download,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Section = {
  title: string;
  content?: string;
  list?: string[];
  items?: { sub: string; details: string[] }[];
  after?: string;
};

const ICONS = [
  Info, Database, Target, Clock, Share2, Lock,
  Cookie, UserCheck, FileEdit, Mail,
];

const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
  "from-sky-500 to-indigo-500",
  "from-teal-500 to-green-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-violet-500",
];

const BG_LIGHTS = [
  "bg-blue-50 dark:bg-blue-950/30",
  "bg-emerald-50 dark:bg-emerald-950/30",
  "bg-rose-50 dark:bg-rose-950/30",
  "bg-amber-50 dark:bg-amber-950/30",
  "bg-violet-50 dark:bg-violet-950/30",
  "bg-sky-50 dark:bg-sky-950/30",
  "bg-teal-50 dark:bg-teal-950/30",
  "bg-orange-50 dark:bg-orange-950/30",
  "bg-pink-50 dark:bg-pink-950/30",
  "bg-indigo-50 dark:bg-indigo-950/30",
];

function getSections(t: (key: string) => string) {
  return [
    {
      title: t("privacy.s1_title"),
      content: t("privacy.s1_content"),
    },
    {
      title: t("privacy.s2_title"),
      content: t("privacy.s2_content"),
      items: [
        {
          sub: t("privacy.s2_item_1_sub"),
          details: [
            t("privacy.s2_item_1_detail_1"),
            t("privacy.s2_item_1_detail_2"),
            t("privacy.s2_item_1_detail_3"),
            t("privacy.s2_item_1_detail_4"),
          ],
        },
        {
          sub: t("privacy.s2_item_2_sub"),
          details: [
            t("privacy.s2_item_2_detail_1"),
            t("privacy.s2_item_2_detail_2"),
            t("privacy.s2_item_2_detail_3"),
          ],
        },
        {
          sub: t("privacy.s2_item_3_sub"),
          details: [
            t("privacy.s2_item_3_detail_1"),
            t("privacy.s2_item_3_detail_2"),
          ],
        },
        {
          sub: t("privacy.s2_item_4_sub"),
          details: [
            t("privacy.s2_item_4_detail_1"),
            t("privacy.s2_item_4_detail_2"),
            t("privacy.s2_item_4_detail_3"),
            t("privacy.s2_item_4_detail_4"),
          ],
        },
      ],
    },
    {
      title: t("privacy.s3_title"),
      content: t("privacy.s3_content"),
      list: [
        t("privacy.s3_list_1"),
        t("privacy.s3_list_2"),
        t("privacy.s3_list_3"),
        t("privacy.s3_list_4"),
        t("privacy.s3_list_5"),
        t("privacy.s3_list_6"),
        t("privacy.s3_list_7"),
      ],
    },
    {
      title: t("privacy.s4_title"),
      content: t("privacy.s4_content"),
    },
    {
      title: t("privacy.s5_title"),
      content: t("privacy.s5_content"),
      list: [
        t("privacy.s5_list_1"),
        t("privacy.s5_list_2"),
        t("privacy.s5_list_3"),
      ],
    },
    {
      title: t("privacy.s6_title"),
      content: t("privacy.s6_content"),
    },
    {
      title: t("privacy.s7_title"),
      content: t("privacy.s7_content"),
      list: [
        t("privacy.s7_list_1"),
        t("privacy.s7_list_2"),
        t("privacy.s7_list_3"),
      ],
      after: t("privacy.s7_after"),
    },
    {
      title: t("privacy.s8_title"),
      content: t("privacy.s8_content"),
      list: [
        t("privacy.s8_list_1"),
        t("privacy.s8_list_2"),
        t("privacy.s8_list_3"),
        t("privacy.s8_list_4"),
        t("privacy.s8_list_5"),
      ],
      after: t("privacy.s8_after"),
    },
    {
      title: t("privacy.s9_title"),
      content: t("privacy.s9_content"),
    },
    {
      title: t("privacy.s10_title"),
      content: t("privacy.s10_content"),
      after: t("privacy.s10_after"),
    },
  ];
}

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 dark:bg-[#f39c12]/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SectionCard({
  section,
  index,
  isOpen,
  onToggle,
}: {
  section: Section;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[index];
  const gradient = GRADIENTS[index];
  const bgLight = BG_LIGHTS[index];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group rounded-2xl border transition-all duration-500 overflow-hidden ${
        isOpen
          ? "border-[#638ECB]/30 dark:border-[#638ECB]/20 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
          : "border-[#D5DEEF]/30 dark:border-[#1e293b]/70 shadow-sm hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      } bg-white/80 dark:bg-[#0f1729]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#0f1729]`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left relative"
      >
        {/* Number badge */}
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all duration-500 ${
            isOpen
              ? `bg-gradient-to-br ${gradient} text-white shadow-lg scale-110`
              : `${bgLight} text-[#395886] dark:text-[#94A3B8] group-hover:scale-105`
          }`}
        >
          {index < 9 ? `0${index + 1}` : index + 1}
        </div>

        {/* Icon */}
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
            isOpen ? `${bgLight} scale-110` : `${bgLight}`
          }`}
        >
          <Icon
            className={`w-5 h-5 transition-colors duration-500 ${
              isOpen ? "text-[#395886] dark:text-white" : "text-[#395886] dark:text-[#94A3B8]"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className={`text-lg font-extrabold transition-colors duration-500 ${
              isOpen ? "text-[#395886] dark:text-white" : "text-[#395886] dark:text-[#D5DEEF]"
            }`}
          >
            {section.title}
          </h2>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${
            isOpen
              ? "bg-[#395886] text-white"
              : "bg-[#F0F3FA] dark:bg-[#1e293b]/60 text-[#638ECB] dark:text-[#94A3B8]"
          }`}
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={`h-px bg-gradient-to-r ${gradient} mx-6 opacity-40`} />

            <div className="px-5 md:px-6 pb-6 pt-5">
              {section.content && (
                <div className="space-y-3">
                  {section.content.split("\n\n").map((p, i) => (
                    <p key={i} className="text-[#638ECB]/80 dark:text-[#94A3B8]/80 leading-relaxed">{p}</p>
                  ))}
                </div>
              )}

              {section.items && (
                <div className="space-y-4">
                  {section.items.map((item, j) => (
                    <div key={j} className={`${bgLight} rounded-xl p-4 border border-[#D5DEEF]/20 dark:border-[#1e293b]/60`}>
                      <h3 className="font-bold text-[#395886] dark:text-[#D5DEEF] mb-2 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
                        {item.sub}
                      </h3>
                      <ul className="space-y-1 ml-4">
                        {item.details.map((d, k) => (
                          <li key={k} className="text-[#638ECB]/80 dark:text-[#94A3B8]/80 flex items-start gap-2 text-sm">
                            <span className="text-[#f39c12] mt-1 shrink-0">•</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {section.list && (
                <ul className="space-y-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="text-[#638ECB]/80 dark:text-[#94A3B8]/80 flex items-start gap-3 leading-relaxed">
                      <span className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mt-0.5`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.after && (
                <p className="text-[#638ECB]/80 dark:text-[#94A3B8]/80 leading-relaxed mt-4 italic border-l-2 border-[#f39c12]/30 pl-4">
                  {section.after}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PrivacyPage() {
  const { t } = useI18n();
  const sections = useMemo(() => getSections(t), [t]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <Particles />
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
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("legal.badge_privacy")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {t("legal.title_privacy")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-amber-300">
                {t("legal.title_privacy_accent")}
              </span>
            </h1>
            <p className="text-white/70 text-base font-semibold mt-3 max-w-xl">
              {t("legal.subtitle_privacy")}
            </p>
            <motion.a
              href="/downloads/CARFORFAR_Privacy_Policy_Full.pdf"
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 mt-5 bg-white/10 hover:bg-white/20 text-white font-extrabold px-5 py-3 rounded-xl text-xs border border-white/20 shadow-lg uppercase tracking-wider transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.a>
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
              { label: t("legal.document"), value: t("legal.doc_privacy") },
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

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 mt-8 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mb-8 text-[#638ECB]/50 dark:text-[#94A3B8]/50 text-xs font-bold uppercase tracking-[0.15em]"
        >
          <Sparkles className="w-3 h-3" />
          {t("legal.click_hint")}
          <Sparkles className="w-3 h-3" />
        </motion.div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {sections.map((section, i) => (
            <SectionCard
              key={i}
              section={section}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 dark:bg-[#0f1729]/60 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 text-xs text-[#638ECB]/60 dark:text-[#94A3B8]/60">
            <Shield className="w-3.5 h-3.5" />
            {t("legal.footer_date")}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
