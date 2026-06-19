"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function BackButton() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <motion.button
      onClick={() => {
        if (window.history.length <= 1) {
          router.push("/vehicules");
        } else {
          router.back();
        }
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 md:top-24 left-4 z-50 flex items-center rounded-full bg-[#f39c12] hover:bg-[#e08e0b] text-white font-bold shadow-sm transition-all duration-300 group active:scale-95"
    >
      <span className="flex items-center justify-center w-9 h-9 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform group-hover:-translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-[80px]">
        <span className="inline-block pl-1 pr-3">{t("back")}</span>
      </span>
    </motion.button>
  );
}
