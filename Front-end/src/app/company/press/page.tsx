"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Download,
  ExternalLink,
  Calendar,
  ArrowRight,
  FileText,
  Image,
  TrendingUp,
  Award,
  BarChart3,
  Loader2,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";
import { catKeys } from "@/lib/data/press";
import { getPress } from "@/lib/pressApi";
import { vehicleImageUrl } from "@/lib/media";
import type { PressRelease } from "@/lib/types";

function downloadFile(filename: string, url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadBrandAssets() {
  downloadFile("CarForFar_Brand_Guidelines.pdf", "/downloads/CarForFar_Brand_Guidelines.pdf");
}

function downloadPressKit() {
  downloadFile("CarForFar_Press_Kit.pdf", "/downloads/CarForFar_Press_Kit.pdf");
}

function downloadFactSheet() {
  downloadFile("CarForFar_Fact_Sheet.pdf", "/downloads/CarForFar_Fact_Sheet.pdf");
}

const mediaKit = [
  { icon: Image, labelKey: "press.kit_brand", descKey: "press.kit_brand_desc", onClick: downloadBrandAssets },
  { icon: FileText, labelKey: "press.kit_pdf", descKey: "press.kit_pdf_desc", onClick: downloadPressKit },
  { icon: BarChart3, labelKey: "press.kit_factsheet", descKey: "press.kit_factsheet_desc", onClick: downloadFactSheet },
];

export default function PressPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isRtl = locale === "ar";
  const [press, setPress] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPress()
      .then(setPress)
      .catch(() => setPress([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = press[0];

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#638ECB]/10 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Newspaper className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FF7B00] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{t("press.badge")}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#FF7B00]">
                  {t("press.title")} <span className="text-[#FF7B00]">{t("press.accent")}</span>
                </h1>
              </div>
            </div>
            <p className="text-[#FF7B00] text-lg max-w-2xl leading-relaxed">
              {t("press.hero_desc")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Featured Press ── */}
      {featured && (
        <div className="max-w-6xl mx-auto px-6 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-[#0f1729] rounded-3xl shadow-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F39C12]/5 to-transparent dark:from-[#F39C12]/10" />
            {featured.featured_image && (
              <div className="relative h-48 md:h-56 w-full overflow-hidden">
                <NextImage
                  src={vehicleImageUrl(featured.featured_image)}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="relative flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F39C12]/10 dark:bg-[#F39C12]/20 flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-[#F39C12]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F39C12]/10 text-[#F39C12] text-[10px] font-bold uppercase">{t("press.featured")}</span>
                  <span className="text-xs text-[#638ECB] dark:text-[#94A3B8]">{featured.published_at ? formatDate(featured.published_at) : ""}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#F39C12] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-2 max-w-2xl">
                  {featured.excerpt}
                </p>
              </div>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => router.push(`/company/press/${featured.slug}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#395886] hover:bg-[#2b4c7e] text-white text-sm font-bold transition-all shrink-0"
              >
                <span>{t("press.read_full")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Press Releases ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("press.latest_title")}</h2>
            <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-1">{t("press.latest_desc")}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-[#638ECB] dark:text-[#94A3B8]">
            <Download className="w-3.5 h-3.5" />
            <span>{t("press.subscribe")}</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#395886] dark:text-[#D5DEEF]" />
          </div>
        ) : press.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#638ECB] dark:text-[#94A3B8]">{t("admin.no_press")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {press.map((item, i) => {
              const d = item.published_at ? new Date(item.published_at) : null;
              const day = d ? String(d.getDate()).padStart(2, "0") : "";
              const month = d ? d.toLocaleString("en", { month: "short" }) : "";
              const year = d ? String(d.getFullYear()) : "";
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  onClick={() => router.push(`/company/press/${item.slug}`)}
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#0f1729] border border-[#D5DEEF]/30 dark:border-[#1e293b]/60 hover:shadow-lg hover:border-[#F39C12]/30 dark:hover:border-[#F39C12]/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="hidden md:flex flex-col items-center min-w-[60px]">
                    <span className="text-2xl font-extrabold text-[#395886] dark:text-[#D5DEEF]">
                      {day}
                    </span>
                    <span className="text-[10px] font-semibold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-wider">
                      {month}
                    </span>
                    <span className="text-[10px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                      {year}
                    </span>
                  </div>

                  {item.featured_image && (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
                      <NextImage
                        src={vehicleImageUrl(item.featured_image)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 md:hidden">
                      <Calendar className="w-3 h-3 text-[#638ECB] dark:text-[#94A3B8]" />
                      <span className="text-xs text-[#638ECB] dark:text-[#94A3B8]">{item.published_at ? formatDate(item.published_at) : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886]/70 dark:text-[#94A3B8]">
                        {item.category && catKeys[item.category] ? t(catKeys[item.category]) : item.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#F39C12] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-1 line-clamp-2">{item.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => router.push(`/company/press/${item.slug}`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886]/70 dark:text-[#94A3B8] hover:text-[#395886] dark:hover:text-[#D5DEEF] text-xs font-bold transition-all"
                    >
                      <span>{t("press.read")}</span>
                      <ArrowRight className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Media Kit ── */}
      <div className="bg-white/50 dark:bg-[#0a0f1f]/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#395886]/10 dark:bg-[#D5DEEF]/10 text-[#395886] dark:text-[#F39C12] text-xs font-semibold mb-4">
              <Download className="w-3.5 h-3.5" />
              <span>{t("press.kit_title")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("press.kit_title")}</h2>
            <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-2">{t("press.kit_desc")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {mediaKit.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.labelKey}
                  onClick={item.onClick}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#0f1729] rounded-2xl p-6 text-left border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 hover:shadow-xl hover:border-[#F39C12]/30 dark:hover:border-[#F39C12]/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-4 group-hover:bg-[#F39C12] group-hover:text-white transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#395886] dark:text-[#D5DEEF] mb-1">{t(item.labelKey)}</h3>
                  <p className="text-xs text-[#638ECB] dark:text-[#94A3B8]">{t(item.descKey)}</p>
                  <div className="flex items-center gap-1 mt-4 text-[#F39C12] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{t("press.download")}</span>
                    <Download className="w-3 h-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Coverage Logos ── */}
      <div className="max-w-6xl mx-auto px-6 py-14 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.15em] text-[#638ECB] dark:text-[#94A3B8] mb-8"
        >
          {t("press.as_featured")}
        </motion.p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-40 dark:opacity-30">
          {["Le Matin", "Hespress", "Médias24", "TelQuel", "Le Desk", "Challenge"].map((pub) => (
            <span key={pub} className="text-lg font-extrabold text-[#395886] dark:text-[#D5DEEF] tracking-tight">
              {pub}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
