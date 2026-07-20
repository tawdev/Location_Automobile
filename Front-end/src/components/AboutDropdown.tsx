"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, FileText, HelpCircle, Shield, FileSignature, Car, Users, Phone, X, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type StyleVariant = "client" | "visitor";

const topLinks = [
  { labelKey: "nav.about" as const, href: "/a-propos", icon: Info },
  { labelKey: "nav.rules" as const, href: "/regles", icon: FileText },
];

const footerGroups = [
  {
    labelKey: "footer.company" as const,
    items: [
      { labelKey: "footer.careers" as const, href: "/company/careers", icon: Users },
      { labelKey: "footer.press" as const, href: "/company/press", icon: BookOpen },
      { labelKey: "footer.blog" as const, href: "/company/blog", icon: FileText },
    ],
  },
  {
    labelKey: "footer.support" as const,
    items: [
      { labelKey: "footer.help_center" as const, href: "/support/help-center", icon: HelpCircle },
      { labelKey: "footer.contact_us" as const, href: "/contact", icon: Phone },
      { labelKey: "footer.faq" as const, href: "/faq", icon: HelpCircle },
      { labelKey: "footer.cancellation" as const, href: "/support/cancellation", icon: X },
    ],
  },
  {
    labelKey: "footer.legal" as const,
    items: [
      { labelKey: "footer.privacy" as const, href: "/privacy", icon: Shield },
      { labelKey: "footer.terms" as const, href: "/terms", icon: FileSignature },
      { labelKey: "footer.insurance" as const, href: "/insurance", icon: Car },
    ],
  },
];

export default function AboutDropdown({ variant, scrolled, isActive }: { variant: StyleVariant; scrolled: boolean; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);

  const linkClass = variant === "visitor"
    ? `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
        scrolled ? "text-black/70 dark:text-[#94A3B8]/70 hover:text-black dark:hover:text-[#D5DEEF]" : "text-white/70 hover:text-white"
      }`
    : "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50";

  const triggerClass = variant === "visitor"
    ? `relative flex items-center gap-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
        isActive
          ? "border-2 border-[#F39C12] px-4 py-2 text-white"
          : "border-2 border-transparent px-4 py-2 text-white/70 hover:text-white"
      }`
    : `relative flex items-center gap-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
        isActive
          ? "border-2 border-[#F39C12] px-4 py-2 text-white"
          : "border-2 border-transparent px-4 py-2 text-[#395886]/70 dark:text-[#94A3B8]/70 hover:text-[#395886] dark:hover:text-[#D5DEEF] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50"
      }`;

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>{t("nav.resources")}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl border overflow-hidden z-[100] ${
              variant === "visitor"
                ? "bg-white/95 dark:bg-[#0f1729]/95 backdrop-blur-2xl border-white/30 dark:border-[#1e293b]/80"
                : "bg-white dark:bg-[#0f1729] border-[#D5DEEF]/40 dark:border-[#1e293b]/80"
            }`}
          >
            <div className="p-2">
              {topLinks.map((link) => {
                const Icon = link.icon;
                const isLinkActive = pathname === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => { router.push(link.href); setOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isLinkActive
                        ? variant === "visitor"
                          ? "bg-[#D5DEEF]/50 dark:bg-[#1e293b]/80 text-black dark:text-[#F39C12]"
                          : "bg-[#F0F3FA] dark:bg-[#1e293b]/80 text-[#395886] dark:text-[#D5DEEF]"
                        : variant === "visitor"
                          ? "text-black/60 dark:text-[#94A3B8] hover:bg-[#D5DEEF]/30 dark:hover:bg-[#1e293b]/50 hover:text-black dark:hover:text-[#D5DEEF]"
                          : "text-[#395886]/70 dark:text-[#94A3B8] hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50 hover:text-[#395886] dark:hover:text-[#D5DEEF]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(link.labelKey)}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#D5DEEF]/30 dark:border-[#1e293b]/60 mx-2" />

            <div className="p-2 space-y-1">
              {footerGroups.map((group) => (
                <div key={group.labelKey}>
                  <p className={`px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                    variant === "visitor"
                      ? "text-black/40 dark:text-[#64748b]"
                      : "text-[#395886]/50 dark:text-[#64748b]"
                  }`}>
                    {t(group.labelKey)}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${group.labelKey}-${item.labelKey}`}
                        onClick={() => { router.push(item.href); setOpen(false); }}
                        className={`flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          variant === "visitor"
                            ? "text-black/50 dark:text-[#94A3B8]/80 hover:bg-[#D5DEEF]/30 dark:hover:bg-[#1e293b]/50 hover:text-black dark:hover:text-[#D5DEEF]"
                            : "text-[#638ECB]/70 dark:text-[#94A3B8]/70 hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50 hover:text-[#395886] dark:hover:text-[#D5DEEF]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
