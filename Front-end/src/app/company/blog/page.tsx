"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  User,
  ChevronRight,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/dateUtils";
import { getPublishedBlogs } from "@/lib/blogApi";
import { vehicleImageUrl } from "@/lib/media";
import type { Blog } from "@/lib/types";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

export default function BlogPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.blog[typedLocale] || PAGE_TITLES.blog.fr });
  const router = useRouter();
  const isRtl = locale === "ar";
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered.length > 0 ? filtered[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;

  function formatDateStr(dateStr: string | null) {
    if (!dateStr) return "";
    return formatDate(dateStr);
  }

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      <JsonLd
        id="ld-breadcrumb-blog"
        data={breadcrumbLD([
          { name: "CARFORFAR", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/company/blog` },
        ])}
      />
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <div className="absolute inset-0">
          <div className="absolute top-5 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#638ECB]/10 blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#FF7B00]">
                  <span className="text-[#FF7B00]">{t("blog.hero_title")}</span>
                </h1>
                <p className="text-[#FF7B00] text-sm mt-0.5">{t("blog.hero_desc")}</p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative max-w-md mt-8"
          >
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 ${isRtl ? "right-4" : "left-4"}`} />
            <input
              type="text"
              placeholder={t("blog.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 rounded-xl py-3 text-sm font-medium outline-none focus:border-white/30 transition-all ${
                isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
              }`}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#395886] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && blogs.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-[#638ECB]/40 dark:text-[#94A3B8]/40 mb-4" />
          <p className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF]">{t("blog.no_results_title")}</p>
          <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-1">{t("blog.no_results_desc")}</p>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <>
          {/* ── Featured Post ── */}
          {featured && (
            <div className="max-w-6xl mx-auto px-6 py-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => router.push(`/company/blog/${featured.slug}`)}
                className="relative bg-gradient-to-br from-[#395886]/5 to-[#2b4c7e]/5 dark:from-[#0f1729] dark:to-[#0f1729] rounded-3xl overflow-hidden border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F39C12]/5 to-transparent dark:from-[#F39C12]/10" />
                {featured.featured_image ? (
                  <div className="relative h-56 md:h-72 w-full overflow-hidden">
                    <Image
                      src={vehicleImageUrl(featured.featured_image)}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : null}
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#F39C12]/10 text-[#F39C12] text-[10px] font-bold uppercase tracking-wider">
                      {t("blog.featured")}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#F39C12] transition-colors leading-tight mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] max-w-2xl leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#638ECB] dark:text-[#94A3B8] mb-6">
                    {featured.author && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {featured.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateStr(featured.published_at)}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#395886] hover:bg-[#2b4c7e] text-white text-sm font-bold transition-all"
                  >
                    <span>{t("blog.read_article")}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* ── Blog Grid ── */}
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(57,88,134,0.12)" }}
                  onClick={() => router.push(`/company/blog/${post.slug}`)}
                  className="bg-white dark:bg-[#0f1729] rounded-2xl overflow-hidden border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  <div className="h-40 bg-gradient-to-br from-[#395886]/10 to-[#2b4c7e]/10 dark:from-[#1e293b] dark:to-[#0f1729] flex items-center justify-center relative overflow-hidden">
                    {post.featured_image ? (
                      <Image
                        src={vehicleImageUrl(post.featured_image)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzOTU4ODYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                        <FileText className="w-12 h-12 text-[#395886]/20 dark:text-[#D5DEEF]/20 group-hover:scale-110 transition-transform duration-500" />
                      </>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] text-[#638ECB] dark:text-[#94A3B8] mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateStr(post.published_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#F39C12] transition-colors leading-snug mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#638ECB] dark:text-[#94A3B8] leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                      <span className="text-[10px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                        {post.author ? t("blog.by_author", { author: post.author }) : ""}
                      </span>
                      <motion.span
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-0.5 text-[10px] font-bold text-[#F39C12]"
                      >
                        <span>{t("blog.read")}</span>
                        <ChevronRight className="w-3 h-3" />
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Newsletter ── */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#395886] to-[#1d3560] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative">
            <BookOpen className="w-10 h-10 mx-auto text-[#F39C12] mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{t("blog.newsletter_title")}</h2>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
              {t("blog.newsletter_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t("blog.newsletter_placeholder")}
                className={`flex-1 bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-white/30 transition-all ${
                  isRtl ? "text-right" : ""
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] font-bold text-sm transition-all shadow-lg shadow-[#FF7B00]/20"
              >
                {t("blog.newsletter_button")}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
