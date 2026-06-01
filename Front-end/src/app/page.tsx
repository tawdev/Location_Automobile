"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

const FEATURED_VEHICLES = [
  {
    id: 1,
    marque: "BMW",
    model: "Série 7",
    year: 2024,
    pricePerDay: 1200,
    fuelType: "Diesel",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  },
  {
    id: 2,
    marque: "Mercedes",
    model: "Classe S",
    year: 2024,
    pricePerDay: 1500,
    fuelType: "Hybride",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
  },
  {
    id: 3,
    marque: "Porsche",
    model: "Cayenne",
    year: 2024,
    pricePerDay: 1800,
    fuelType: "Essence",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
  },
  {
    id: 4,
    marque: "Audi",
    model: "Q8",
    year: 2024,
    pricePerDay: 1100,
    fuelType: "Diesel",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
  },
  {
    id: 5,
    marque: "Range Rover",
    model: "Velar",
    year: 2024,
    pricePerDay: 1600,
    fuelType: "Diesel",
    image: "https://images.unsplash.com/photo-1605020420620-20c943e46603?w=600&q=80",
  },
  {
    id: 6,
    marque: "Ferrari",
    model: "Roma",
    year: 2024,
    pricePerDay: 3500,
    fuelType: "Essence",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80",
  },
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

function NavBar() {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#F0F3FA]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(57,88,134,0.08)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 h-[72px] flex items-center justify-between">
          <CarLogo dark={!scrolled} />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className={`text-sm font-semibold tracking-wide transition-all ${scrolled ? "text-[#395886] hover:opacity-70" : "text-white/90 hover:text-white"}`}
            >
              {t("nav.login")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/register")}
              className={`text-sm font-bold tracking-wider px-6 py-2.5 rounded-xl transition-all ${
                scrolled
                  ? "bg-[#395886] hover:bg-[#2d4670] text-white shadow-[0_4px_14px_rgba(57,88,134,0.3)]"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
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
    const timer = setInterval(() => setCurrentImg((p) => (p + 1) % cars.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F0F3FA]">
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#395886]/90 via-[#395886]/60 to-[#638ECB]/40" />

      {/* Floating shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#f39c12]/20"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
        className="absolute bottom-32 left-10 w-48 h-48 rounded-full border border-[#F0F3FA]/10"
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#f39c12]/20 backdrop-blur-sm text-[#f39c12] text-xs font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-pulse" />
              Location de voitures de luxe &agrave; Marrakech
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-[-0.03em] text-white mb-6"
          >
            Conduisez
            <br />
            <span className="text-[#f39c12]">l&rsquo;Excellence</span>
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
              whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(243,156,18,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="bg-[#f39c12] hover:bg-[#d68910] text-[#395886] font-black text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-2xl transition-colors"
            >
              Commencer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login")}
              className="border-2 border-[#F0F3FA]/30 text-[#F0F3FA] font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-2xl hover:bg-white/10 transition-colors"
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
          >
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
              <rect x="1" y="1" width="22" height="34" rx="11" stroke="#D5DEEF" strokeWidth="2" />
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
  return (
    <section className="bg-[#F0F3FA] py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase">Nos Services</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] mt-3 leading-tight">
            L&rsquo;art de la<br/>location automobile
          </h2>
          <p className="text-[#638ECB] text-lg mt-4 max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour une exp&eacute;rience sans accroc.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(57,88,134,0.12)" }}
              className="bg-white rounded-3xl p-8 border border-[#D5DEEF]/40 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D5DEEF] flex items-center justify-center text-[#395886] mb-6">
                {svc.icon}
              </div>
              <h3 className="text-lg font-bold text-[#395886] mb-3">{svc.title}</h3>
              <p className="text-sm text-[#638ECB] leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-white py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase">Comment &ccedil;a marche</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] mt-3">
            Trois &eacute;tapes simples
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#D5DEEF] via-[#638ECB] to-[#D5DEEF]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className="w-16 h-16 rounded-2xl bg-[#395886] flex items-center justify-center text-[#f39c12] text-xl font-black mb-8 relative z-10 shadow-[0_8px_25px_rgba(57,88,134,0.2)]"
              >
                {step.num}
              </motion.div>
              <h3 className="text-xl font-bold text-[#395886] mb-3">{step.title}</h3>
              <p className="text-sm text-[#638ECB] leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-[#395886] py-20 px-8 relative overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#638ECB]/20"
      />
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
              className="text-center"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                className="text-4xl md:text-5xl font-black text-[#f39c12] block mb-2"
              >
                {stat.value}
              </motion.span>
              <span className="text-sm text-[#D5DEEF] font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehiclesMarquee() {
  const router = useRouter();

  const duplicated = [...FEATURED_VEHICLES, ...FEATURED_VEHICLES];

  return (
    <section className="bg-white py-28 px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase">
            Notre Flotte
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] mt-3 leading-tight">
            Des v&eacute;hicules d&rsquo;exception
          </h2>
          <p className="text-[#638ECB] text-lg mt-4 max-w-xl mx-auto">
            D&eacute;couvrez notre s&eacute;lection de v&eacute;hicules haut de gamme.
          </p>
        </motion.div>
      </div>

      <div
        className="flex gap-6 w-max"
        style={{ animation: "marquee 40s linear infinite" }}
      >
        {duplicated.map((v, i) => (
          <motion.button
            key={`${v.id}-${i}`}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/register")}
            className="shrink-0 w-[300px] bg-white rounded-3xl border border-[#D5DEEF]/40 overflow-hidden text-left shadow-sm hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="h-44 bg-[#F0F3FA] overflow-hidden">
              <img
                src={v.image}
                alt={`${v.marque} ${v.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#395886]">
                  {v.marque} {v.model}
                </h3>
                <span className="text-xs font-bold text-[#f39c12] bg-[#f39c12]/10 px-2.5 py-1 rounded-full">
                  {v.fuelType}
                </span>
              </div>
              <p className="text-sm text-[#638ECB] mb-3">{v.year}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#395886]">{v.pricePerDay.toLocaleString()}</span>
                <span className="text-sm text-[#638ECB] font-medium">DH/jour</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

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
    <section className="bg-[#D5DEEF] py-28 px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#f39c12] text-xs font-bold tracking-[0.25em] uppercase">Pr&ecirc;t &agrave; rouler?</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#395886] mt-3 mb-6 leading-tight">
            Rejoignez l&rsquo;exp&eacute;rience<br/>CARFORFAR d&egrave;s maintenant
          </h2>
          <p className="text-[#638ECB] text-lg mb-10 max-w-lg mx-auto">
            Inscrivez-vous en quelques secondes et acc&eacute;dez &agrave; notre flotte
            de v&eacute;hicules d&rsquo;exception.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(57,88,134,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/register")}
            className="bg-[#395886] hover:bg-[#2d4670] text-white font-black text-sm tracking-[0.15em] uppercase px-12 py-4 rounded-2xl transition-colors shadow-[0_4px_20px_rgba(57,88,134,0.25)]"
          >
            Cr&eacute;er un compte
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-[#395886] px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div>
            <CarLogo dark />
            <p className="text-[#D5DEEF]/60 text-sm max-w-xs mt-4 leading-relaxed">
              Location de voitures de luxe &agrave; Marrakech.
              Conduisez l&rsquo;excellence avec CARFORFAR.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <h4 className="text-[#f39c12] text-xs font-bold tracking-[0.15em] uppercase mb-4">Services</h4>
              <div className="flex flex-col gap-2.5">
                {["Location", "Conciergerie", "Assurance", "Livraison"].map((l) => (
                  <a key={l} href="#" className="text-[#D5DEEF]/70 text-sm hover:text-[#f39c12] transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[#f39c12] text-xs font-bold tracking-[0.15em] uppercase mb-4">L&eacute;gal</h4>
              <div className="flex flex-col gap-2.5">
                {["Conditions", "Confidentialit&eacute;", "Cookies"].map((l) => (
                  <a key={l} href="#" className="text-[#D5DEEF]/70 text-sm hover:text-[#f39c12] transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[#f39c12] text-xs font-bold tracking-[0.15em] uppercase mb-4">Contact</h4>
              <div className="flex flex-col gap-2.5 text-[#D5DEEF]/70 text-sm">
                <span>contact@carforfar.ma</span>
                <span>+212 5XX XX XX XX</span>
                <span>Marrakech, Maroc</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#638ECB]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#D5DEEF]/40 text-xs">&copy; 2024 CARFORFAR. Tous droits r&eacute;serv&eacute;s.</p>
          <div className="flex gap-4">
            {["Instagram", "Facebook", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="text-[#D5DEEF]/40 text-xs hover:text-[#f39c12] transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F0F3FA] font-sans overflow-x-hidden">
      <NavBar />
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
