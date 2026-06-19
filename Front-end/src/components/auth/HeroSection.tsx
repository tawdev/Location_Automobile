"use client";

import React from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function HeroSection() {
  const { t } = useI18n();
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex flex-col px-[44px] pt-[38px] pb-[30px] overflow-hidden min-h-[340px] lg:min-h-[100vh]"
    >
      <div className="relative flex flex-col h-full w-full">
        <div className="flex items-start justify-start">
          <Logo />
        </div>

        <div className="mt-[126px] lg:mt-[160px]">
          <h1
            style={{ fontFamily: "var(--font-geist-sans)" }}
            className="font-sans text-[42px] lg:text-[50px] leading-[1.02] font-black tracking-[-0.4px] ml-[22px] lg:ml-[80px] text-[#F0F3FA] drop-shadow-[0_2px_10px_rgba(0,0,0,0.20)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.50)]"
          >
            {t("auth.hero_highlight")}
            <br />
            <span className="text-[#F0F3FA]">{t("auth.hero_our")}</span>
            <span className="text-[#F39C12]">{t("auth.hero_priority")}</span>
          </h1>
        </div>
      </div>
    </motion.section>
  );
}
