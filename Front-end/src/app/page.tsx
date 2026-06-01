"use client";

import { useState, useEffect, useRef } from "react";
import { listVehicles } from "@/lib/vehiclesApi";
import { vehicleImageUrl } from "@/lib/media";
import type { Vehicle } from "@/lib/types";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getAuthToken } from "@/lib/tokenStorage";


const MapSection = dynamic(() => import("@/components/HomeMap"), { ssr: false });

const cars = [
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
];

const services = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    title: "Location Premium",
    desc: "Une flotte de v&eacute;hicules haut de gamme s&eacute;lectionn&eacute;s pour votre confort et votre prestige.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: "Livraison Partout",
    desc: "Nous livrons votre v&eacute;hicule &agrave; l&rsquo;a&eacute;roport, votre h&ocirc;tel ou tout lieu &agrave; Marrakech.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Conciergerie 24/7",
    desc: "Un service client d&eacute;di&eacute;, disponible &agrave; tout moment pour r&eacute;pondre &agrave; vos besoins.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    // 
    title: "Assurance Incluse",
    desc: "Chaque r&eacute;servation comprend une assurance tous risques pour rouler en toute s&eacute;r&eacute;nit&eacute;.",
  },
];

const steps = [
  { num: "01", title: "Choisissez", desc: "Parcourez notre flotte et s&eacute;lectionnez le v&eacute;hicule qui vous correspond." },
  { num: "02", title: "Réservez", desc: "Choisissez vos dates et finalisez votre réservation en quelques clics." },
  { num: "03", title: "Conduisez", desc: "R&eacute;cup&eacute;rez votre v&eacute;hicule et profitez de votre exp&eacute;rience." },
];



function CarLogo({ className, dark }: { className?: string; dark?: boolean }) {
  const stroke = dark ? "#F0F3FA" : "#395886";
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <svg width="46" height="28" viewBox="0 0 46 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18C6 18 12 6 23 6C34 6 40 18 40 18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 18L34 18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="20.5" r="3.5" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="31" cy="20.5" r="3.5" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M21 11L29 11L31 18" stroke={stroke} strokeWidth="2" fill="none" />
        <path d="M3 20L4 18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M43 20L42 18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className={`font-black italic tracking-[0.25em] text-sm leading-none mt-1 ${dark ? "text-[#F0F3FA]" : "text-[#395886]"}`}>
        CARFORFAR
      </span>
    </div>
  );
}

function NavBar({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-[#F0F3FA]/80 dark:bg-[#0f1729]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(57,88,134,0.12)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-[#D5DEEF]/30 dark:border-[#1e293b]/80"
            : "bg-transparent dark:bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 h-[72px] flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <CarLogo dark={!scrolled && !dark} />
          </motion.div>
          <div className="flex items-center gap-2">
            <DarkModeToggle dark={dark} onToggle={onToggleDark} />
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full ${
                scrolled
                  ? "text-[#395886] dark:text-[#94A3B8] after:bg-[#395886] dark:after:bg-[#94A3B8]"
                  : "text-white/90 hover:text-white after:bg-white"
              }`}
            >
              {t("nav.login")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className={`text-sm font-bold tracking-wider px-6 py-2.5 rounded-xl transition-all duration-300 ${
                scrolled
                  ? "bg-[#395886] dark:bg-[#f39c12] hover:bg-[#2d4670] dark:hover:bg-[#d68910] text-white dark:text-[#0f1729] shadow-[0_4px_14px_rgba(57,88,134,0.3)] dark:shadow-[0_4px_14px_rgba(243,156,18,0.3)] hover:shadow-[0_6px_20px_rgba(57,88,134,0.4)] dark:hover:shadow-[0_6px_20px_rgba(243,156,18,0.4)]"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              }`}
            >
              {t("nav.signup")}
            </motion.button>
          </div>
        </div>
      </motion.nav>
  );
}

function HeroSection() {
  const router = useRouter();
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentImg((p) => (p + 1) % cars.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F0F3FA] dark:bg-[#070b14]">
      {/* Background image slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImg}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cars[currentImg]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#395886]/90 via-[#395886]/60 to-[#638ECB]/40 dark:from-[#050a14]/95 dark:via-[#0d1b3e]/90 dark:to-[#1a2744]/80" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(-45deg, #395886, #638ECB, #f39c12, #395886)', backgroundSize: '400% 400%', animation: 'gradient-shift 15s ease infinite' }} />

      {/* Floating shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#f39c12]/20"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
        className="absolute bottom-32 left-10 w-48 h-48 rounded-full border border-[#F0F3FA]/10"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      />
      {/* Extra floating particles */}
      <div className="absolute top-40 left-1/4 w-3 h-3 rounded-full bg-[#f39c12]/30" style={{ animation: 'float 5s ease-in-out infinite' }} />
      <div className="absolute bottom-40 right-1/4 w-2 h-2 rounded-full bg-white/20" style={{ animation: 'float 7s ease-in-out infinite 1s' }} />
      <div className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full bg-[#638ECB]/20" style={{ animation: 'float 6s ease-in-out infinite 2s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#f39c12]/20 backdrop-blur-sm text-[#f39c12] text-xs font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6 border border-[#f39c12]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-pulse" />
              Location de voitures de luxe &agrave; Marrakech
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-[-0.04em] text-white mb-6"
          >
            Conduisez
            <br />
            <span className="text-[#f39c12] relative inline-block after:absolute after:inset-x-0 after:bottom-1 after:h-3 after:bg-[#f39c12]/20 after:blur-sm">l&rsquo;Excellence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-[#D5DEEF] max-w-xl leading-relaxed mb-10"
          >
            D&eacute;couvrez une exp&eacute;rience automobile sur mesure.
            Des v&eacute;hicules d&rsquo;exception, un service de conciergerie
            disponible 24h/24, rien que pour vous.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(243,156,18,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="relative overflow-hidden bg-[#f39c12] hover:bg-[#d68910] text-[#395886] font-black text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(243,156,18,0.3)] hover:shadow-[0_8px_30px_rgba(243,156,18,0.5)] shimmer-btn"
            >
              Commencer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login")}
              className="border-2 border-[#F0F3FA]/30 text-[#F0F3FA] font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Se connecter
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#D5DEEF" strokeWidth="2" opacity="0.6" />
              <motion.circle
                cx="12" cy="12" r="3"
                fill="#f39c12"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const refs = cardsRef.current;
    const handlers: (() => void)[] = [];

    refs.forEach((card) => {
      if (!card) return;
      const handler = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      };
      const reset = () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      };
      card.addEventListener('mousemove', handler);
      card.addEventListener('mouseleave', reset);
      handlers.push(() => { card.removeEventListener('mousemove', handler); card.removeEventListener('mouseleave', reset); });
    });
    return () => handlers.forEach(h => h());
  }, []);

  return (
    <section className="bg-[#F0F3FA] dark:bg-[#070b14] py-28 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#395886 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Floating decorative icons */}
      <div className="absolute top-20 left-10 text-[#638ECB]/10 dark:text-[#638ECB]/5 text-6xl pointer-events-none" style={{ animation: 'float-slow 7s ease-in-out infinite' }}>&#9670;</div>
      <div className="absolute bottom-40 right-16 text-[#f39c12]/10 dark:text-[#f39c12]/5 text-4xl pointer-events-none" style={{ animation: 'float-drift 12s ease-in-out infinite' }}>&#9679;</div>
      <div className="absolute top-60 right-20 text-[#395886]/8 dark:text-[#395886]/5 text-5xl pointer-events-none" style={{ animation: 'float-slow 9s ease-in-out infinite 2s' }}>&#9641;</div>

      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1200 64" className="w-full h-full text-white fill-current">
          <path d="M0,32 C300,64 600,0 1200,32 L1200,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full border border-[#f39c12]/20">Nos Services</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            L&rsquo;art de la<br/>location automobile
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour une exp&eacute;rience sans accroc.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              ref={(el) => { cardsRef.current[i] = el; }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ boxShadow: "0 30px 70px rgba(57,88,134,0.18)" }}
              className="group gradient-border-card bg-white dark:bg-[#0f1729] rounded-3xl p-8 border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 transition-all duration-500 hover:border-transparent dark:hover:border-transparent cursor-default dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D5DEEF] to-[#c5d0e4] dark:from-[#1e293b] dark:to-[#253249] flex items-center justify-center text-[#395886] dark:text-[#D5DEEF] mb-6 transition-all duration-500 group-hover:from-[#395886] group-hover:to-[#2d4670] dark:group-hover:from-[#f39c12] dark:group-hover:to-[#d68910] group-hover:text-white group-hover:shadow-[0_8px_25px_rgba(57,88,134,0.3)] dark:group-hover:shadow-[0_8px_25px_rgba(243,156,18,0.3)]">
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  {svc.icon}
                </motion.div>
              </div>
              <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#f39c12] group-hover:translate-x-1">{svc.title}</h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed mb-4">{svc.desc}</p>
              <div className="flex items-center gap-2 text-[#f39c12] text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <span>En savoir plus</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="bg-white dark:bg-[#0b1121] py-28 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Background decorations */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#f39c12]/5 dark:bg-[#f39c12]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#395886 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full border border-[#f39c12]/20">Comment &ccedil;a marche</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6">
            Trois &eacute;tapes simples
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Animated connector with dots */}
          <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%]">
            <div className="relative h-[3px] bg-gradient-to-r from-[#D5DEEF] via-[#638ECB] to-[#D5DEEF] dark:from-[#1e293b] dark:via-[#395886] dark:to-[#1e293b]" style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 4s ease infinite' }}>
              {/* Connection dots */}
              <div className="absolute -top-[5px] left-0 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite' }} />
              <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite 0.6s' }} />
              <div className="absolute -top-[5px] right-0 w-3 h-3 rounded-full bg-[#638ECB] shadow-[0_0_10px_rgba(99,142,203,0.5)]" style={{ animation: 'pulse-glow 2s ease infinite 1.2s' }} />
            </div>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              className="relative flex flex-col items-center text-center group bg-white/50 dark:bg-[#0f1729]/50 backdrop-blur-sm rounded-3xl p-8 border border-[#D5DEEF]/30 dark:border-[#1e293b]/50 transition-all duration-500 hover:bg-white dark:hover:bg-[#131c31] hover:border-[#638ECB]/20 dark:hover:border-[#638ECB]/10 hover:shadow-[0_20px_60px_rgba(57,88,134,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              {/* Step badge */}
              <div className="absolute top-4 right-4 text-[10px] font-bold text-[#638ECB]/40 dark:text-[#638ECB]/30 tracking-widest uppercase">
                {activeStep === i ? 'En cours' : `Étape ${i + 1}`}
              </div>

              {/* Number */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#395886] to-[#2d4670] flex items-center justify-center text-[#f39c12] text-xl font-black mb-6 relative z-10 shadow-[0_8px_25px_rgba(57,88,134,0.2)] transition-all duration-500 group-hover:shadow-[0_12px_40px_rgba(57,88,134,0.4)]"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: i * 0.2 + 0.3 }}
                >
                  {step.num}
                </motion.span>
                {/* Glow ring */}
                <motion.div
                  animate={activeStep === i ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-2xl ring-2 ring-[#f39c12]/30"
                />
              </motion.div>

              {/* Content */}
              <motion.h3
                className="text-xl font-bold text-[#395886] dark:text-[#D5DEEF] mb-3 transition-all duration-300 group-hover:text-[#f39c12]"
                animate={activeStep === i ? { x: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {step.title}
              </motion.h3>
              <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] leading-relaxed max-w-xs">{step.desc}</p>

              {/* Bottom indicator line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#638ECB] to-[#f39c12] origin-left"
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-xs text-[#638ECB]/50 dark:text-[#638ECB]/30 mt-12 tracking-widest uppercase"
        >
          &mdash; Pr&ecirc;t ? Commencez d&egrave;s maintenant &mdash;
        </motion.p>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-[#395886] dark:bg-[#0b1121] py-24 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#638ECB]/20 dark:border-[#638ECB]/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full border border-[#f39c12]/10 dark:border-[#f39c12]/5"
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(243,156,18,0.05) 0%, transparent 60%)' }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "15+", label: "Ann&eacute;es d&rsquo;expertise" },
            { value: "200+", label: "V&eacute;hicules disponibles" },
            { value: "5000+", label: "Clients satisfaits" },
            { value: "24/7", label: "Support client" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-5 transition-all duration-500 group-hover:bg-[#f39c12]/20 group-hover:border-[#f39c12]/30 group-hover:shadow-[0_0_30px_rgba(243,156,18,0.15)]"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  className="text-3xl md:text-4xl font-black text-[#f39c12] block"
                >
                  {stat.value}
                </motion.span>
              </motion.div>
              <span className="text-sm text-[#D5DEEF] font-medium block transition-colors duration-300 group-hover:text-white">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehiclesMarquee() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listVehicles()
      .then((data) => { setVehicles(data); setLoading(false); })
      .catch(() => { setVehicles([]); setLoading(false); });
  }, []);

  const duplicated = [...vehicles, ...vehicles];

  return (
    <section className="bg-white dark:bg-[#070b14] py-28 px-8 overflow-hidden relative transition-colors duration-500">
      {/* Subtle radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#638ECB]/5 dark:bg-[#638ECB]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-[#f39c12]/10 px-4 py-2 rounded-full">
            Notre Flotte
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 leading-tight">
            Des v&eacute;hicules d&rsquo;exception
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] text-lg mt-4 max-w-xl mx-auto">
            D&eacute;couvrez notre s&eacute;lection de v&eacute;hicules haut de gamme.
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex gap-6 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[300px] rounded-3xl overflow-hidden">
              <div className="h-44 bg-[#F0F3FA] dark:bg-[#1e293b] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-3/4" />
                <div className="h-4 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-1/4" />
                <div className="h-6 bg-[#F0F3FA] dark:bg-[#1e293b] rounded-lg animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length > 0 && (
        <div
          className="flex gap-6 w-max"
          style={{ animation: "marquee 40s linear infinite" }}
        >
          {duplicated.map((v, i) => {
            const imgSrc = v.pictures?.[0]
              ? vehicleImageUrl(v.pictures[0].path)
              : "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80";
            return (
              <motion.button
                key={`${v.id}-${i}`}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (getAuthToken()) {
                    router.push(`/vehicles/${v.id}`);
                  } else {
                    localStorage.setItem("pendingVehicleRedirect", `/vehicles/${v.id}`);
                    router.push(`/login?redirect=/vehicles/${v.id}`);
                  }
                }}
                className="shrink-0 w-[300px] bg-white dark:bg-[#0f1729] rounded-3xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 overflow-hidden text-left shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_50px_rgba(57,88,134,0.15)] dark:hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] transition-all duration-500 group"
              >
                <div className="h-44 bg-[#F0F3FA] dark:bg-[#1e293b] overflow-hidden relative">
                  <img
                    src={imgSrc}
                    alt={`${v.marque} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#395886] dark:text-[#D5DEEF] group-hover:text-[#f39c12] transition-colors duration-300">
                      {v.marque} {v.model}
                    </h3>
                    <span className="text-xs font-bold text-[#f39c12] bg-[#f39c12]/10 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:bg-[#f39c12] group-hover:text-white">
                      {v.fuelType}
                    </span>
                  </div>
                  <p className="text-sm text-[#638ECB] dark:text-[#94A3B8] mb-3">{v.year}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#395886] dark:text-[#f39c12]">{v.pricePerDay.toLocaleString()}</span>
                    <span className="text-sm text-[#638ECB] dark:text-[#94A3B8] font-medium">DH/jour</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function CTASection() {
  const router = useRouter();

  return (
    <section className="bg-[#D5DEEF] dark:bg-[#0b1121] py-32 px-8 relative overflow-hidden transition-colors duration-500">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          background: 'linear-gradient(135deg, #D5DEEF, #b0c4de, #f39c12, #395886, #D5DEEF)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 12s ease infinite',
        }}
      />
      {/* Overlay to keep readability */}
      <div className="absolute inset-0 bg-[#D5DEEF]/60 dark:bg-[#0b1121]/80 backdrop-blur-[2px]" />

      {/* Floating geometric shapes */}
      <div className="absolute top-16 left-1/4 w-4 h-4 rounded-full bg-[#f39c12]/40 pointer-events-none" style={{ animation: 'float-slow 5s ease-in-out infinite' }} />
      <div className="absolute top-32 right-1/3 w-3 h-3 bg-[#395886]/30 pointer-events-none" style={{ animation: 'float-drift 8s ease-in-out infinite 1s', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute bottom-20 left-1/3 w-6 h-6 rounded-full bg-[#638ECB]/20 pointer-events-none" style={{ animation: 'float-slow 6s ease-in-out infinite 2s' }} />
      <div className="absolute top-1/2 right-1/4 w-5 h-5 border-2 border-[#f39c12]/20 pointer-events-none" style={{ animation: 'spin-slow 20s linear infinite', transformOrigin: 'center' }} />
      <div className="absolute bottom-1/3 left-[15%] w-8 h-8 border border-[#395886]/15 pointer-events-none" style={{ animation: 'spin-slow 25s linear infinite reverse', transformOrigin: 'center', borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%' }} />

      {/* Twinkling sparkle dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#f39c12]/40 pointer-events-none"
          style={{
            top: `${15 + i * 12}%`,
            left: `${10 + i * 15}%`,
            animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase bg-white/70 dark:bg-[#1e293b]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#f39c12]/20 shadow-[0_2px_10px_rgba(243,156,18,0.1)] dark:shadow-[0_2px_10px_rgba(243,156,18,0.05)]"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#f39c12]"
            />
            Pr&ecirc;t &agrave; rouler?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#395886] dark:text-[#D5DEEF] mt-6 mb-6 leading-tight"
          >
            Rejoignez l&rsquo;exp&eacute;rience
            <br />
            <span className="relative inline-block text-[#f39c12]">
              CARFORFAR
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-2 bg-[#f39c12]/20 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            <span> d&egrave;s maintenant</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[#638ECB] dark:text-[#94A3B8] text-lg mb-10 max-w-lg mx-auto"
          >
            Inscrivez-vous en quelques secondes et acc&eacute;dez &agrave; notre flotte
            de v&eacute;hicules d&rsquo;exception.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative inline-flex"
          >
            {/* Pulsing ring behind button */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#395886]/30 dark:border-[#f39c12]/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 15px 50px rgba(57,88,134,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="relative overflow-hidden bg-gradient-to-r from-[#395886] via-[#2d4670] to-[#395886] hover:from-[#2d4670] hover:to-[#1e3560] text-white font-black text-sm tracking-[0.15em] uppercase px-14 py-5 rounded-2xl transition-all duration-500 shadow-[0_8px_30px_rgba(57,88,134,0.35)] shimmer-btn"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10">Cr&eacute;er un compte</span>
            </motion.button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-[11px] text-[#638ECB]/50 dark:text-[#94A3B8]/40 mt-8 tracking-wider"
          >
            Gratuit &bull; Sans engagement &bull; 24/7
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-[#395886] dark:bg-[#050a14] px-8 py-16 relative overflow-hidden transition-colors duration-500">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f39c12]/30 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <CarLogo dark />
            </div>
            <p className="text-[#D5DEEF]/60 text-sm max-w-xs mt-4 leading-relaxed">
              Location de voitures de luxe &agrave; Marrakech.
              Conduisez l&rsquo;excellence avec CARFORFAR.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { title: "Services", links: ["Location", "Conciergerie", "Assurance", "Livraison"] },
              { title: "L&eacute;gal", links: ["Conditions", "Confidentialit&eacute;", "Cookies"] },
              { title: "Contact", links: ["contact@carforfar.ma", "+212 5XX XX XX XX", "Marrakech, Maroc"] },
            ].map((col, ci) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <h4 className="text-[#f39c12] text-xs font-bold tracking-[0.15em] uppercase mb-4">{col.title}</h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <a key={l} href="#" className="text-[#D5DEEF]/70 text-sm hover:text-[#f39c12] transition-all duration-300 hover:translate-x-1 inline-block w-fit">
                      {l}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-[#638ECB]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-[#D5DEEF]/40 text-xs">&copy; 2024 CARFORFAR. Tous droits r&eacute;serv&eacute;s.</p>
          <div className="flex gap-4">
            {["Instagram", "Facebook", "LinkedIn"].map((s) => (
              <motion.a
                key={s}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-[#D5DEEF]/40 text-xs hover:text-[#f39c12] transition-colors duration-300"
              >
                {s}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${
        dark
          ? "bg-[#1e293b] text-[#f39c12] border border-[#f39c12]/20 hover:bg-[#1e293b]/80"
          : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
      }`}
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      <motion.div
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}

export default function HomePage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] font-sans overflow-x-hidden transition-colors duration-500">
      <style>{`
        html { scroll-behavior: smooth; }
        ::selection { background: #638ECB/30; color: #395886; }
        .dark ::selection { background: #f39c12/40; color: #fff; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(15px, -15px); }
          50% { transform: translate(30px, 0); }
          75% { transform: translate(15px, 15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(243,156,18,0.2); }
          50% { box-shadow: 0 0 40px rgba(243,156,18,0.5); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes border-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scale-bounce {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes reveal-up {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
          border-radius: inherit;
        }
        .gradient-border-card {
          position: relative;
          background-clip: padding-box;
          border: 1px solid transparent;
        }
        .gradient-border-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #D5DEEF, #638ECB, #f39c12, #D5DEEF);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .gradient-border-card:hover::before {
          opacity: 1;
          animation: border-shimmer 3s ease infinite;
        }
        .dark .gradient-border-card::before {
          background: linear-gradient(135deg, #1e293b, #638ECB, #f39c12, #1e293b);
        }
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-track { background: #0f1729; }
        .dark ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        /* Dark mode radial backgrounds */
        .dark .hero-gradient { background: radial-gradient(ellipse at 50% 50%, rgba(57,88,134,0.15) 0%, transparent 70%); }
        /* Dark glow for cards */
        .dark .card-glow { box-shadow: 0 0 30px rgba(57,88,134,0.05); }
      `}</style>
      <NavBar dark={dark} onToggleDark={toggleDark} />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <VehiclesMarquee />
      <StatsSection />
      <CTASection />
      <MapSection />
      <FooterSection />
    </div>
  );
}
