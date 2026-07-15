"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Target,
  Heart,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
  Globe,
  Coffee,
  Mail,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getCareers } from "@/lib/careersApi";
import type { Career } from "@/lib/types";

function Counter({ from, to, label, suffix = "", duration = 2, decimals = 0 }: { from: number; to: number; label: string; suffix?: string; duration?: number; decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    let start = performance.now();
    const step = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-[#395886] dark:text-[#F39C12] tabular-nums">
        {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
      </div>
      <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-2 font-semibold">{label}</p>
    </div>
  );
}

const perks = [
  { icon: Globe, labelKey: "careers.perk_remote", descKey: "careers.perk_remote_desc" },
  { icon: Coffee, labelKey: "careers.perk_coffee", descKey: "careers.perk_coffee_desc" },
  { icon: Heart, labelKey: "careers.perk_health", descKey: "careers.perk_health_desc" },
  { icon: Zap, labelKey: "careers.perk_budget", descKey: "careers.perk_budget_desc" },
  { icon: Star, labelKey: "careers.perk_hours", descKey: "careers.perk_hours_desc" },
  { icon: TrendingUp, labelKey: "careers.perk_equity", descKey: "careers.perk_equity_desc" },
];

export default function CareersPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isRtl = locale === "ar";
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const typeKeys: Record<string, string> = {
    "Full-time": "careers.job_type_fulltime",
    "Part-time": "careers.job_type_parttime",
  };
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    getCareers()
      .then(setCareers)
      .catch(() => setCareers([]))
      .finally(() => setLoading(false));
  }, []);

  const depts = ["All", ...new Set(careers.map((c) => c.department).filter(Boolean) as string[])];
  const deptKeys: Record<string, string> = {
    All: "careers.filter_all",
    Engineering: "careers.dept_engineering",
    Design: "careers.dept_design",
    Operations: "careers.dept_operations",
    Marketing: "careers.dept_marketing",
    Support: "careers.dept_support",
    Data: "careers.dept_data",
  };

  const filtered = selectedDept === "All" ? careers : careers.filter((p) => p.department === selectedDept);

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124] pb-24 md:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#638ECB]/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-[#FF7B00] text-xs font-semibold mb-6">
              <Users className="w-3.5 h-3.5" />
              <span>{t("footer.careers")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#FF7B00] leading-tight mb-4">
              {t("careers.hero_title")}{" "}
              <span className="text-[#FF7B00]">{t("careers.hero_accent")}</span>
            </h1>
            <p className="text-[#FF7B00] text-lg max-w-2xl mx-auto leading-relaxed">
              {t("careers.hero_desc")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold shadow-lg shadow-[#FF7B00]/20 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>{t("careers.view_positions")}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </motion.button>
          </motion.div>

          {/* ── Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
          {[
          { from: 0, to: 200, suffix: "+", labelKey: "careers.stat_employees", decimals: 0 },
          { from: 0, to: 15, suffix: "", labelKey: "careers.stat_nationalities", decimals: 0 },
          { from: 0, to: 4.8, suffix: "", labelKey: "careers.stat_rating", decimals: 1 },
          { from: 0, to: 95, suffix: "%", labelKey: "careers.stat_satisfaction", decimals: 0 },
        ].map((stat) => (
          <div
            key={stat.labelKey}
            className="bg-white dark:bg-[#0f1729] rounded-2xl p-6 shadow-lg border border-[#D5DEEF]/40 dark:border-[#1e293b]/60"
          >
            <Counter from={0} to={stat.to} suffix={stat.suffix} label={t(stat.labelKey)} decimals={stat.decimals} />
          </div>
        ))}
      </motion.div>
        </div>
      </div>

      {/* ── Culture ── */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#395886]/10 dark:bg-[#D5DEEF]/10 text-[#395886] dark:text-[#F39C12] text-xs font-semibold mb-4">
            <Target className="w-3.5 h-3.5" />
            <span>{t("careers.why_title")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#395886] dark:text-[#D5DEEF]">
            {t("careers.perks_title")}
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.labelKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(57,88,134,0.12)" }}
                className="bg-white dark:bg-[#0f1729] rounded-2xl p-6 border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-5 group-hover:bg-[#F39C12] group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] mb-2">{t(perk.labelKey)}</h3>
                <p className="text-sm text-[#638ECB] dark:text-[#94A3B8]">{t(perk.descKey)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Open Positions ── */}
      <div id="positions" className="bg-white/50 dark:bg-[#0a0f1f]/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#395886]/10 dark:bg-[#D5DEEF]/10 text-[#395886] dark:text-[#F39C12] text-xs font-semibold mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t("careers.section_title")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#395886] dark:text-[#D5DEEF] mb-4">
              {t("careers.positions_title")}
            </h2>
            <p className="text-[#638ECB] dark:text-[#94A3B8] max-w-xl mx-auto">
              {t("careers.positions_count", { count: String(careers.length), depts: String(depts.length - 1) })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {depts.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDept === dept
                    ? "bg-[#395886] text-white shadow-lg shadow-[#395886]/20"
                    : "bg-white dark:bg-[#0f1729] text-[#395886]/70 dark:text-[#94A3B8] border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 hover:border-[#395886]/30 dark:hover:border-[#D5DEEF]/30"
                }`}
              >
                {t(deptKeys[dept])}
              </button>
            ))}
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#395886] dark:text-[#D5DEEF]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#0f1729] rounded-2xl p-6 border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#F39C12] transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#638ECB] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.type && typeKeys[job.type] ? t(typeKeys[job.type]) : job.type}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0F3FA] dark:bg-[#1e293b] text-[10px] font-semibold">
                          {job.department && deptKeys[job.department] ? t(deptKeys[job.department]) : job.department}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] group-hover:bg-[#F39C12] group-hover:text-white transition-all duration-300 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  {job.requirements && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.requirements.split("\n").filter(Boolean).map((req, ri) => (
                        <span
                          key={ri}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886]/70 dark:text-[#94A3B8]"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                  <motion.button
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F39C12] group/btn"
                  >
                    <span>{t("careers.apply_now")}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto text-[#638ECB]/40 dark:text-[#94A3B8]/40 mb-4" />
              <p className="text-[#638ECB] dark:text-[#94A3B8] font-semibold">{t("careers.no_positions")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#395886] to-[#1d3560] rounded-3xl p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{t("careers.cta_title")}</h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8">
              {t("careers.cta_desc")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold shadow-lg shadow-[#FF7B00]/20 transition-all inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{t("careers.cta_button")}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
