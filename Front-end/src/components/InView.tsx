"use client";

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";

type AnimationPreset = "fade-up" | "fade-left" | "fade-right" | "scale-in" | "fade-up-scale";

interface InViewProps {
  children: ReactNode;
  className?: string;
  preset?: AnimationPreset;
  delay?: number;
  once?: boolean;
  margin?: string;
  as?: "div" | "span";
  style?: CSSProperties;
}

const hiddenStyles: Record<AnimationPreset, CSSProperties> = {
  "fade-up": { opacity: 0, transform: "translateY(2rem)" },
  "fade-left": { opacity: 0, transform: "translateX(-2rem)" },
  "fade-right": { opacity: 0, transform: "translateX(2rem)" },
  "scale-in": { opacity: 0, transform: "scale(0.95)" },
  "fade-up-scale": { opacity: 0, transform: "translateY(2rem) scale(0.95)" },
};

const visibleStyle: CSSProperties = { opacity: 1, transform: "translateY(0) translateX(0) scale(1)" };

export default function InView({
  children,
  className = "",
  preset = "fade-up",
  delay = 0,
  once = true,
  margin = "-40px",
  as = "div",
  style,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, margin]);

  const Tag = as as "div" | "span";

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease-out, transform 0.7s ease-out`,
        transitionDelay: `${delay}s`,
        ...(inView ? visibleStyle : hiddenStyles[preset]),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
