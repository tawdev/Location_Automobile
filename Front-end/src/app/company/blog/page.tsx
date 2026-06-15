"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  User,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Heart,
  Car,
  MapPin,
  Sun,
  Smartphone,
  Shield,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const catKeys: Record<string, string> = {
  All: "blog.filter_all",
  "Travel Tips": "blog.cat_travel_tips",
  "Car Reviews": "blog.cat_car_reviews",
  "Morocco Guides": "blog.cat_morocco_guides",
  "Tech & Innovation": "blog.cat_tech",
  "Company News": "blog.cat_company",
  Sustainability: "blog.cat_sustainability",
};

const categories = Object.keys(catKeys);

const featuredPost = {
  title: "The Ultimate Road Trip Guide: Exploring Morocco's Atlantic Coast",
  excerpt:
    "From Tangier to Dakhla — 2,500 km of stunning coastline, hidden beaches, and unforgettable stops. Here is everything you need to plan the perfect road trip.",
  author: "Karim B.",
  role: "Travel Editor",
  date: "Jun 10, 2026",
  readTime: "8 min read",
  category: "Travel Tips",
  image: null,
};

const blogPosts = [
  {
    title: "Top 5 Electric Cars for City Driving in 2026",
    excerpt: "Affordable, eco-friendly, and perfect for navigating narrow medina streets.",
    author: "Leila M.",
    date: "Jun 5, 2026",
    readTime: "5 min",
    category: "Car Reviews",
    icon: Car,
  },
  {
    title: "Essential Moroccan Arabic Phrases for Travelers",
    excerpt: "15 phrases that will make your trip smoother and locals will appreciate.",
    author: "Sofia R.",
    date: "May 28, 2026",
    readTime: "4 min",
    category: "Travel Tips",
    icon: MapPin,
  },
  {
    title: "Summer 2026: Best Beach Destinations in Morocco",
    excerpt: "Agadir, Essaouira, Saïdia — where to go for the perfect summer getaway.",
    author: "Youssef A.",
    date: "May 20, 2026",
    readTime: "6 min",
    category: "Morocco Guides",
    icon: Sun,
  },
  {
    title: "How AI is Transforming the Car Rental Experience",
    excerpt: "From smart recommendations to frictionless check-in — the future is here.",
    author: "Karim B.",
    date: "May 12, 2026",
    readTime: "7 min",
    category: "Tech & Innovation",
    icon: Sparkles,
  },
  {
    title: "Customer Spotlight: Remote Workers Driving Across Morocco",
    excerpt: "How digital nomads are combining work and travel with flexible car rental.",
    author: "Leila M.",
    date: "May 4, 2026",
    readTime: "5 min",
    category: "Company News",
    icon: TrendingUp,
  },
  {
    title: "Sustainable Driving: How to Reduce Your Carbon Footprint",
    excerpt: "Simple habits that make your rental more eco-friendly without extra cost.",
    author: "Sofia R.",
    date: "Apr 25, 2026",
    readTime: "4 min",
    category: "Sustainability",
    icon: Heart,
  },
  {
    title: "Marrakech to Merzouga: The Ultimate Desert Road Trip",
    excerpt: "Cross the Atlas Mountains and sleep under the stars in the Sahara.",
    author: "Youssef A.",
    date: "Apr 18, 2026",
    readTime: "9 min",
    category: "Morocco Guides",
    icon: Car,
  },
  {
    title: "Safe Driving Tips for Tourists in Morocco",
    excerpt: "Everything you need to know about Moroccan road rules, signage, and etiquette.",
    author: "Karim B.",
    date: "Apr 10, 2026",
    readTime: "6 min",
    category: "Travel Tips",
    icon: Shield,
  },
  {
    title: "Inside CarForFar: Our Tech Stack and Engineering Culture",
    excerpt: "A look at how we build and scale our platform for thousands of customers.",
    author: "Leila M.",
    date: "Apr 2, 2026",
    readTime: "8 min",
    category: "Tech & Innovation",
    icon: Smartphone,
  },
];

export default function BlogPage() {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = blogPosts.filter(
    (p) =>
      (activeCat === "All" || p.category === activeCat) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
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
                <h1 className="text-3xl md:text-5xl font-extrabold text-white">
                  <span className="bg-gradient-to-r from-[#f39c12] to-[#e67e22] bg-clip-text text-transparent">{t("blog.hero_title")}</span>
                </h1>
                <p className="text-white/50 text-sm mt-0.5">{t("blog.hero_desc")}</p>
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

      {/* ── Category Tabs ── */}
      <div className="sticky top-0 z-20 bg-[#F0F3FA]/80 dark:bg-[#070b14]/80 backdrop-blur-xl border-b border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
        <div className="max-w-6xl mx-auto px-6 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCat === cat
                    ? "bg-[#395886] text-white shadow-lg shadow-[#395886]/20"
                    : "bg-white dark:bg-[#0f1729] text-[#395886]/70 dark:text-[#94A3B8] border border-[#D5DEEF]/30 dark:border-[#1e293b]/60 hover:border-[#395886]/30"
                }`}
              >
                {t(catKeys[cat])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Post ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#395886]/5 to-[#2b4c7e]/5 dark:from-[#0f1729] dark:to-[#0f1729] rounded-3xl overflow-hidden border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f39c12]/5 to-transparent dark:from-[#f39c12]/10" />
          <div className="relative p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#f39c12]/10 text-[#f39c12] text-[10px] font-bold uppercase tracking-wider">
                {t("blog.featured")}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0F3FA] dark:bg-[#1e293b] text-[10px] font-semibold text-[#395886]/70 dark:text-[#94A3B8]">
                {t(catKeys[featuredPost.category])}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#f39c12] transition-colors leading-tight mb-3">
              {featuredPost.title}
            </h2>
            <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] max-w-2xl leading-relaxed mb-6">
              {featuredPost.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#638ECB] dark:text-[#94A3B8] mb-6">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {featuredPost.author} &middot; {featuredPost.role}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {featuredPost.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {featuredPost.readTime}
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

      {/* ── Blog Grid ── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => {
            const Icon = post.icon;
            return (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(57,88,134,0.12)" }}
                className="bg-white dark:bg-[#0f1729] rounded-2xl overflow-hidden border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="h-40 bg-gradient-to-br from-[#395886]/10 to-[#2b4c7e]/10 dark:from-[#1e293b] dark:to-[#0f1729] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzOTU4ODYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                  <Icon className="w-12 h-12 text-[#395886]/20 dark:text-[#D5DEEF]/20 group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#0f1729]/80 text-[10px] font-bold text-[#395886] dark:text-[#D5DEEF] backdrop-blur-sm">
                    {t(catKeys[post.category])}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[10px] text-[#638ECB] dark:text-[#94A3B8] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#f39c12] transition-colors leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#638ECB] dark:text-[#94A3B8] leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#D5DEEF]/20 dark:border-[#1e293b]/40">
                    <span className="text-[10px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                      {t("blog.by_author", { author: post.author })}
                    </span>
                    <motion.span
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-0.5 text-[10px] font-bold text-[#f39c12]"
                    >
                      <span>{t("blog.read")}</span>
                      <ChevronRight className="w-3 h-3" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-[#638ECB]/40 dark:text-[#94A3B8]/40 mb-4" />
            <p className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF]">{t("blog.no_results_title")}</p>
            <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mt-1">{t("blog.no_results_desc")}</p>
          </div>
        )}
      </div>

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
            <BookOpen className="w-10 h-10 mx-auto text-[#f39c12] mb-4" />
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
                className="px-6 py-3 rounded-xl bg-[#f39c12] hover:bg-[#e67e22] text-white font-bold text-sm transition-all shadow-lg shadow-[#f39c12]/20"
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
