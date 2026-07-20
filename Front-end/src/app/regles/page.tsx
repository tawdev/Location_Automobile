"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Info, Gauge, Shield, IdCard, Clock, FileText, ArrowRight } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { PAGE_TITLES } from "@/lib/seo";

const RULES_KEYS = ["km", "insurance", "license", "duration", "documents"] as const;
const ICONS = [Gauge, Shield, IdCard, Clock, FileText] as const;

const IMAGES = [
  "/roles/Mileage.jpg",
  "/roles/Insurance.jpg",
  "/roles/License.jpg",
  "/roles/Duration.jpg",
  "/roles/Documents.jpg",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

function RuleCard({ ruleKey, index }: { ruleKey: string; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const { t } = useI18n();
  const Icon = ICONS[index];

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="relative group rounded-3xl overflow-hidden cursor-pointer min-h-[440px] sm:min-h-[480px]"
    >
      {/* Background image */}
      <img
        src={IMAGES[index]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isHovered
            ? "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0.2) 70%, transparent 100%)"
            : "linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.5) 35%, rgba(15,23,42,0.15) 65%, transparent 100%)",
        }}
      />

      {/* Border glow layer */}
      <div
        className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none"
        style={{
          background: isHovered
            ? "linear-gradient(135deg, rgba(245,158,11,0.6), rgba(245,158,11,0.1), rgba(255,255,255,0.15))"
            : "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04), rgba(255,255,255,0.08))",
          transition: "background 0.4s ease",
        }}
      >
        <div className="h-full w-full rounded-3xl" />
      </div>

      {/* Mouse-follow light reflection */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10"
        style={{
          background: useTransform(
            mouseX,
            [-0.5, 0, 0.5],
            [
              "radial-gradient(600px circle at 20% 30%, rgba(245,158,11,0.1), transparent 50%)",
              "radial-gradient(600px circle at 50% 50%, rgba(245,158,11,0.06), transparent 50%)",
              "radial-gradient(600px circle at 80% 30%, rgba(245,158,11,0.1), transparent 50%)",
            ]
          ),
        }}
      />

      {/* Glow shadow on hover */}
      <div
        className="absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none"
        style={{
          boxShadow: isHovered
            ? "0 25px 60px -12px rgba(245,158,11,0.25), 0 0 50px -8px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col h-full p-10 sm:p-12 lg:p-14">
        {/* Spacer */}
        <div className="flex-1" />

        {/* Label */}
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-4 text-[#F59E0B]/80 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm w-fit">
          <Icon className="w-4 h-4" />
          {t(`rules.${ruleKey}`)}
        </span>

        {/* Description */}
        <p className="text-sm sm:text-base font-medium text-white leading-relaxed mb-6">
          {t(`rules.${ruleKey}.desc`)}
        </p>

        {/* Detail box */}
        <div
          className="rounded-xl p-5 mb-10 transition-all duration-300"
          style={{
            background: isHovered
              ? "rgba(245,158,11,0.1)"
              : "rgba(255,255,255,0.05)",
            border: isHovered
              ? "1px solid rgba(245,158,11,0.2)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-xs sm:text-sm text-white leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>{t(`rules.${ruleKey}.detail`)}</span>
          </p>
        </div>

        {/* Action label */}
        <div className="w-full">
          <span
            className="flex items-center justify-center gap-3 w-full py-4 sm:py-5 rounded-xl text-sm sm:text-base font-extrabold uppercase tracking-wider transition-all duration-400"
            style={{
              background: isHovered
                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                : "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))",
              color: isHovered ? "#0F172A" : "#F59E0B",
              border: isHovered
                ? "1px solid rgba(245,158,11,0.5)"
                : "1px solid rgba(245,158,11,0.25)",
              boxShadow: isHovered
                ? "0 8px 24px -4px rgba(245,158,11,0.4)"
                : "none",
            }}
          >
            {t(`rules.${ruleKey}`)}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
    })));
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 dark:bg-[#F39C12]/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ReglesPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.regles[typedLocale] || PAGE_TITLES.regles.fr });

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f2124] via-[#1f2124] to-[#1f2124]">
        <Particles />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Info className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#FF7B00] text-sm font-bold uppercase tracking-[0.2em]">Informations</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#FF7B00] tracking-tight leading-tight">
              {t("rules.title")}
            </h1>
            <p className="text-[#FF7B00] text-base font-semibold mt-2 max-w-xl">
              {t("rules.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* Cards Section */}
      <div className="max-w-7xl mx-auto px-6 mt-8 relative z-10 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
        >
          {RULES_KEYS.map((key, index) => (
            <RuleCard key={key} ruleKey={key} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
