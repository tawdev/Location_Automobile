"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";

type CardData = {
  key: string;
  icon: typeof Phone;
  label: string;
  value: string;
  description: string;
  href: string;
  buttonText: string;
  image: string;
};

function GlassCard({ card, index }: { card: CardData; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
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
    (e: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <motion.a
      ref={cardRef}
      href={card.href}
      target={card.href.startsWith("mailto:") || card.href.startsWith("tel:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: index * 0.15,
      }}
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
      className="relative group block rounded-3xl overflow-hidden cursor-pointer min-h-[440px] sm:min-h-[480px]"
    >
      {/* Background image */}
      <img
        src={card.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Dark overlay for text readability */}
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
      <div className="relative z-20 flex flex-col items-center text-center h-full p-10 sm:p-12 lg:p-14">
        {/* Spacer to push content to bottom half where image overlay is darker */}
        <div className="flex-1" />

        {/* Label */}
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-4 text-[#F59E0B]/80 px-4 py-2 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
          {card.label}
        </span>

        {/* Main value */}
        <p className="text-xl sm:text-2xl font-bold text-white mb-4 break-all leading-snug">
          {card.value}
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base font-medium text-white leading-relaxed mb-10 max-w-[320px]">
          {card.description}
        </p>

        {/* Action button */}
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
            {card.buttonText}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function SupportContactCards({
  phone,
  email,
  labels,
}: {
  phone: string;
  email: string;
  labels: {
    phoneLabel: string;
    emailLabel: string;
    contactLabel: string;
    phoneDescription: string;
    emailDescription: string;
    contactDescription: string;
    phoneButton: string;
    emailButton: string;
    contactButton: string;
  };
}) {
  const cards: CardData[] = [
    {
      key: "phone",
      icon: Phone,
      label: labels.phoneLabel,
      value: phone,
      description: labels.phoneDescription,
      href: `tel:${phone.replace(/\s/g, "")}`,
      buttonText: labels.phoneButton,
      image: "/support/Phone.jpg",
    },
    {
      key: "email",
      icon: Mail,
      label: labels.emailLabel,
      value: email,
      description: labels.emailDescription,
      href: `mailto:${email}`,
      buttonText: labels.emailButton,
      image: "/support/Email.jpg",
    },
    {
      key: "chat",
      icon: MessageCircle,
      label: labels.contactLabel,
      value: "/contact",
      description: labels.contactDescription,
      href: "/contact",
      buttonText: labels.contactButton,
      image: "/support/Contact.jpg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
      {cards.map((card, index) => (
        <GlassCard key={card.key} card={card} index={index} />
      ))}
    </div>
  );
}
