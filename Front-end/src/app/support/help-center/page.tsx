"use client";

import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageSquare, FileText, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

export default function HelpCenterPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.support[typedLocale] || PAGE_TITLES.support.fr });
  const router = useRouter();

  const helpOptions = [
    {
      icon: MessageSquare,
      labelKey: "footer.faq",
      href: "/faq",
      descKey: "faq.subtitle",
    },
    {
      icon: Mail,
      labelKey: "footer.contact_us",
      href: "/contact",
      descKey: "contact.subtitle",
    },
    {
      icon: FileText,
      labelKey: "footer.terms",
      href: "/terms",
      descKey: "terms.subtitle",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">{t("footer.help_center")}</h1>
              <p className="text-white/60 text-sm mt-1">{t("contact.subtitle")}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {helpOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(57,88,134,0.12)" }}
                onClick={() => router.push(opt.href)}
                className="bg-white dark:bg-[#0f1729] rounded-2xl p-6 text-left border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-4 group-hover:bg-[#395886] dark:group-hover:bg-[#f39c12] group-hover:text-white dark:group-hover:text-[#0f1729] transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] mb-2">{t(opt.labelKey)}</h3>
                <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed">{t(opt.descKey)}</p>
                <div className="flex items-center gap-1 mt-4 text-[#f39c12] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{t("home.services.learn_more")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
