"use client";

import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  Newspaper,
  Calendar,
  ArrowLeft,
  Clock,
  Share2,
  Building2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { pressReleases, catKeys } from "@/lib/data/press";

export default function PressDetailPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams();
  const isRtl = locale === "ar";

  const release = pressReleases.find((r) => r.slug === params.slug);

  if (!release) {
    return (
      <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 mx-auto text-[#638ECB]/40 mb-4" />
          <h1 className="text-2xl font-bold text-[#395886] dark:text-[#D5DEEF]">Press release not found</h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => router.push("/company/press")}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#395886] text-white text-sm font-bold"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>Back to Press Room</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(release.date).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => router.push("/company/press")}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold mb-8 transition-all"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{t("press.latest_title")}</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider">
                {t(catKeys[release.category])}
              </span>
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {Math.ceil(release.content.split(" ").length / 200)} min read
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {release.title}
            </h1>
            <p className="text-white/60 text-lg mt-4 max-w-2xl leading-relaxed">
              {release.excerpt}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-[#0f1729] rounded-3xl p-8 md:p-12 shadow-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/60"
        >
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-[#D5DEEF]/30 dark:border-[#1e293b]/60">
              <div className="w-12 h-12 rounded-full bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#395886] dark:text-[#D5DEEF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#395886] dark:text-[#D5DEEF]">CarForFar Press</p>
                <p className="text-xs text-[#638ECB] dark:text-[#94A3B8]">{formattedDate}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886]/70 dark:text-[#94A3B8] hover:text-[#395886] dark:hover:text-[#D5DEEF] text-xs font-bold transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </motion.button>
            </div>

            {release.content.split("\n\n").map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="text-[#395886]/80 dark:text-[#94A3B8] leading-relaxed mb-6 last:mb-0"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* ── Back CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => router.push("/company/press")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#395886] hover:bg-[#2b4c7e] text-white text-sm font-bold shadow-lg shadow-[#395886]/20 transition-all"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{t("press.latest_title")}</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
