"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Props = {
  small?: boolean;
};

export default function BackButton({ small }: Props) {
  const router = useRouter();
  return (
    <motion.button
      onClick={() => router.back()}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#f39c12] hover:bg-[#e08e0b] text-white font-bold shadow-sm transition-all group active:scale-95 ${
        small
          ? "px-2 py-0.5 text-[11px] leading-none"
          : "px-4 py-2 text-sm"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={small ? 13 : 16} height={small ? 13 : 16} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform group-hover:-translate-x-1">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
      </svg>
      Retour
    </motion.button>
  );
}
