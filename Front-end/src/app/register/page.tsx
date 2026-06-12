"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/auth/HeroSection";
import { SocialButton, GoogleIcon } from "@/components/auth/SocialButton";
import { InputField } from "@/components/auth/InputField";
import { API_BASE_URL } from "@/lib/config";

const CODE_DIGITS = 6;

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 11h12v10H6V11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 15v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 9.5a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, verifyEmail, error, status } = useAuth();
  const { t } = useI18n();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    const next = !dark;

    html.classList.add("theme-transition");
    html.classList.toggle("dark", next);

    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.classList.remove("theme-transition");
      });
    });
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
  const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const [mode, setMode] = useState<"login" | "signup">(searchParams.get("mode") === "login" ? "login" : "signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
  }>({ name: null, email: null, password: null });
  const [submitting, setSubmitting] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [code, setCode] = useState<string[]>(Array(CODE_DIGITS).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || localStorage.getItem("pendingVehicleRedirect") || null
    : null;

  useEffect(() => {
    if (status === "authenticated") {
      localStorage.removeItem("pendingVehicleRedirect");
      router.replace(redirectTo || "/vehicles");
    }
  }, [status, router, redirectTo]);

  const displayError = formError ?? error ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextErrors = {
      name: mode === "signup" ? (NAME_RE.test(trimmedName) ? null : t("register.name_error")) : null,
      email: EMAIL_RE.test(trimmedEmail) ? null : t("register.email_error"),
      password: PASSWORD_RE.test(password) ? null : t("register.password_error"),
    };

    setFieldErrors(nextErrors);

    const hasAnyError = Boolean(nextErrors.name || nextErrors.email || nextErrors.password);
    if (hasAnyError) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn({ email: trimmedEmail, password });
      } else {
        const res = await signUp({ name: trimmedName, email: trimmedEmail, password });
        if (res && res.user_id) {
          setUserId(res.user_id);
          setEmail(trimmedEmail);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
      }
    } catch (err) {
      const msg = (err as any)?.message || (mode === "login" ? t("register.login_failed") : t("register.signup_failed"));
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setCodeError(null);
    if (value && index < CODE_DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_DIGITS);
    const next = [...code];
    for (let i = 0; i < CODE_DIGITS; i++) next[i] = text[i] ?? "";
    setCode(next);
    inputRefs.current[Math.min(text.length, CODE_DIGITS - 1)]?.focus();
  }

  async function handleVerifyCode() {
    const fullCode = code.join("");
    if (fullCode.length !== CODE_DIGITS) { setCodeError(t("register.code_error")); return; }
    if (userId === null) return;
    setCodeSubmitting(true);
    setCodeError(null);
    try {
      await verifyEmail({ user_id: userId, code: fullCode });
      localStorage.removeItem("pendingVehicleRedirect");
      router.replace(redirectTo || "/vehicles");
    } catch (err) {
      setCodeError((err as any)?.message || t("register.invalid_code"));
      setCode(Array(CODE_DIGITS).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setCodeSubmitting(false);
    }
  }

  async function handleResend() {
    if (userId === null) return;
    setResending(true);
    try {
      const { authResendCode } = await import("@/lib/authApi");
      await authResendCode({ user_id: userId });
    } catch { /* silent */ }
    finally { setResending(false); }
  }

  function backToForm() {
    setUserId(null);
    setCode(Array(CODE_DIGITS).fill(""));
    setCodeError(null);
  }

  const formVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  };

  return (
    <div className="relative min-h-screen w-full text-[#395886] dark:text-[#D5DEEF] overflow-hidden">
      {/* Light mode background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{ backgroundImage: 'url("/ChatGPT%20Image%20May%2018%2C%202026%2C%2010_29_10%20AM.png")' }}
        aria-hidden="true"
      />
      {/* Dark mode background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block"
        style={{ backgroundImage: 'url("/auth-hero-dark.png")' }}
        aria-hidden="true"
      />
      {/* Light mode gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA]/0 via-[#F0F3FA]/5 to-[#F0F3FA]/10 dark:hidden" aria-hidden="true" />
      {/* Dark mode gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1729]/0 via-[#0f1729]/10 to-[#0f1729]/20 hidden dark:block" aria-hidden="true" />

      {/* Dark mode toggle button */}
      <motion.button
        type="button"
        onClick={toggleDark}
        aria-label="Toggle dark mode"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85, rotate: 30 }}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl border border-[#D5DEEF]/40 bg-white/60 dark:bg-[#1e293b]/50 backdrop-blur-md text-[#395886] hover:bg-white/90 dark:border-[#475569]/50 dark:text-[#D5DEEF] dark:hover:bg-[#1e293b]/70 flex items-center justify-center shadow-sm transition-all duration-300 cursor-pointer"
      >
        <motion.div
          key={dark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </motion.div>
      </motion.button>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="w-full lg:flex-[1.1]">
          <HeroSection />
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:px-[34px] lg:py-[70px] lg:flex-[0.9] lg:justify-start lg:pl-[50px]">
          <div className="w-full">
            {userId ? (
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
              >
                <div className="relative rounded-[20px] bg-white/[0.07] dark:bg-[#0f1729]/20 backdrop-blur-2xl border border-[#D5DEEF]/25 dark:border-[#334155]/40 shadow-[0_8px_32px_rgba(57,88,134,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.30)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px] overflow-hidden">
                  <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-[#638ECB]/0 via-[#638ECB] to-[#F39C12]/0 rounded-full" />
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#638ECB]/5 dark:bg-[#638ECB]/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#F39C12]/5 dark:bg-[#F39C12]/8 rounded-full blur-3xl pointer-events-none" />

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-[28px] md:text-[32px] lg:text-[40px] font-extrabold text-[#395886] dark:text-[#D5DEEF] leading-[1.05] text-center tracking-tight"
                  >
                    {t("register.verify_title")} <span className="text-[#F39C12]">{t("register.verify_title_highlight")}</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-[6px] text-[14px] md:text-[15px] lg:text-[17px] text-[#395886]/70 dark:text-[#94A3B8]/80 text-center font-medium"
                  >
                    {t("register.verify_sent")} <span className="font-black text-[#395886] dark:text-[#D5DEEF]">{email}</span>
                  </motion.p>

                  {codeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mt-[18px] rounded-[12px] border border-[#F39C12]/40 bg-[#F39C12]/8 dark:border-[#F39C12]/30 dark:bg-[#F39C12]/5 px-[16px] py-[12px] text-[13px] font-semibold text-[#395886] dark:text-[#D5DEEF] backdrop-blur-md"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#F39C12]">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M12 8v4M12 16v0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {codeError}
                      </span>
                    </motion.div>
                  )}

                  <div className="mt-[32px] flex gap-3 justify-center" onPaste={handleCodePaste}>
                    {code.map((digit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * i }}
                      >
                        <input
                          ref={(el) => { inputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-black border border-[#D5DEEF]/60 dark:border-[#475569]/50 rounded-[12px] bg-white/[0.12] dark:bg-[#1e293b]/20 text-[#395886] dark:text-[#D5DEEF] focus:outline-none focus:ring-[3px] focus:ring-[#638ECB]/20 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/15 dark:focus:border-[#638ECB] hover:border-[#638ECB]/30 dark:hover:border-[#638ECB]/30 transition-all duration-300 ease-out"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    disabled={codeSubmitting}
                    onClick={handleVerifyCode}
                    whileHover={!codeSubmitting ? { scale: 1.015 } : {}}
                    whileTap={!codeSubmitting ? { scale: 0.985 } : {}}
                    className="mt-[24px] w-full h-[50px] rounded-[12px] bg-gradient-to-r from-[#638ECB] to-[#4a7bb8] text-white font-extrabold text-[15px] shadow-[0_8px_24px_rgba(99,142,203,0.30)] hover:shadow-[0_12px_36px_rgba(99,142,203,0.45)] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-[0_8px_24px_rgba(99,142,203,0.30)] transition-all duration-300 ease-out cursor-pointer"
                  >
                    {codeSubmitting ? (
                      <span className="inline-flex items-center gap-2.5">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {t("register.verifying")}
                      </span>
                    ) : t("register.verify_code")}
                  </motion.button>

                  <div className="mt-[18px] flex items-center justify-between text-[13px] font-semibold">
                    <button type="button" onClick={backToForm} className="text-[#638ECB] dark:text-[#94A3B8] underline-offset-2 underline hover:text-[#F39C12] dark:hover:text-[#F39C12] transition-colors duration-200 cursor-pointer">
                      {t("register.back")}
                    </button>
                    <button type="button" onClick={handleResend} disabled={resending} className="text-[#638ECB] dark:text-[#94A3B8] underline-offset-2 underline hover:text-[#F39C12] dark:hover:text-[#F39C12] disabled:opacity-40 disabled:hover:text-[#638ECB] dark:disabled:hover:text-[#94A3B8] transition-colors duration-200 cursor-pointer">
                      {resending ? t("register.resending") : t("register.resend")}
                    </button>
                  </div>

                  <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[12px] text-[11px] text-[#395886]/60 dark:text-[#94A3B8]/60">
                    <a href="/privacy" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">{t("auth.privacy")}</a>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#D5DEEF] dark:bg-[#475569]" />
                    <a href="/terms" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">{t("auth.terms")}</a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
              >
                <div className="relative rounded-[20px] bg-white/[0.07] dark:bg-[#0f1729]/20 backdrop-blur-2xl border border-[#D5DEEF]/25 dark:border-[#334155]/40 shadow-[0_8px_32px_rgba(57,88,134,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.30)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px] overflow-hidden">
                  <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-[#638ECB]/0 via-[#638ECB] to-[#F39C12]/0 rounded-full" />
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#638ECB]/5 dark:bg-[#638ECB]/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#F39C12]/5 dark:bg-[#F39C12]/8 rounded-full blur-3xl pointer-events-none" />

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-[28px] md:text-[32px] lg:text-[40px] font-extrabold text-[#395886] dark:text-[#D5DEEF] leading-[1.05] text-center tracking-tight"
                  >
                    {mode === "login" ? <>{t("auth.login_title")} <span className="text-[#F39C12]">{t("auth.login_title_highlight")}</span></> : <>{t("auth.signup_title")} <span className="text-[#F39C12]">{t("auth.signup_title_highlight")}</span></>}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-[6px] text-[14px] md:text-[15px] lg:text-[17px] text-[#395886]/70 dark:text-[#94A3B8]/80 text-center font-medium"
                  >
                    {mode === "login" ? t("auth.login_subtitle") : t("auth.signup_subtitle")}
                  </motion.p>

                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mt-[18px] rounded-[12px] border border-[#F39C12]/40 bg-[#F39C12]/8 dark:border-[#F39C12]/30 dark:bg-[#F39C12]/5 px-[16px] py-[12px] text-[13px] font-semibold text-[#395886] dark:text-[#D5DEEF] backdrop-blur-md"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#F39C12]">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M12 8v4M12 16v0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {displayError}
                      </span>
                    </motion.div>
                  )}

                  <form className="mt-[24px] flex flex-col gap-[16px]" onSubmit={handleSubmit}>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="sr-only"><label>{t("auth.name")}</label></div>
                        <InputField label={t("auth.name")} type="text" value={name} onChange={(next) => { setName(next); setFieldErrors((prev) => ({ ...prev, name: null })); }} autoComplete="name" placeholder="" leftIcon={<div className="font-extrabold">@</div>} />
                        {fieldErrors.name && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.name}</motion.span>}
                      </motion.div>
                    )}

                    <div>
                      <InputField label={t("auth.email")} type="email" value={email} onChange={(next) => { setEmail(next); setFieldErrors((prev) => ({ ...prev, email: null })); }} autoComplete="email" placeholder="" leftIcon={<MailIcon />} />
                      {fieldErrors.email && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.email}</motion.span>}
                    </div>

                    <div>
                      <div className="flex items-end justify-between">
                        <div className="text-[13px] font-bold text-[#395886] dark:text-[#94A3B8] mb-1 tracking-tight">{t("auth.password")}</div>
                        {mode === "login" && <a href="/forgot-password" className="text-[12px] font-semibold text-[#638ECB] dark:text-[#94A3B8] underline-offset-2 underline hover:text-[#F39C12] dark:hover:text-[#F39C12] transition-colors duration-200">{t("auth.forgot_password")}</a>}
                      </div>
                      <div className="mt-[2px]">
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#638ECB]/60 dark:text-[#94A3B8]/60 group-focus-within:text-[#638ECB] transition-colors duration-300"><LockIcon /></div>
                          <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: null })); }}
                            type={showPassword ? "text" : "password"}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            className="w-full rounded-[12px] border border-[#D5DEEF]/60 dark:border-[#475569]/50 bg-white/[0.12] dark:bg-[#1e293b]/20 h-[46px] px-3 pl-[42px] pr-[42px] text-[14px] text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 dark:placeholder:text-[#64748b]/50 focus:outline-none focus:ring-[3px] focus:ring-[#638ECB]/20 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/15 dark:focus:border-[#638ECB] hover:border-[#638ECB]/30 dark:hover:border-[#638ECB]/30 transition-all duration-300 ease-out"
                            required
                            minLength={mode === "signup" ? 8 : undefined}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#638ECB]/60 hover:text-[#638ECB] transition-colors duration-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                        {fieldErrors.password && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.password}</motion.span>}
                      </div>
                    </div>

                    {mode === "login" && (
                      <label className="flex items-center gap-[10px] mt-[2px] cursor-pointer group">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer w-[16px] h-[16px] accent-[#638ECB] cursor-pointer rounded" />
                        <span className="text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium group-hover:text-[#638ECB] transition-colors duration-200">{t("auth.remember")}</span>
                      </label>
                    )}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={!submitting ? { scale: 1.015 } : {}}
                      whileTap={!submitting ? { scale: 0.985 } : {}}
                      className="mt-[6px] h-[50px] rounded-[12px] bg-gradient-to-r from-[#638ECB] to-[#4a7bb8] text-white font-extrabold text-[15px] shadow-[0_8px_24px_rgba(99,142,203,0.30)] hover:shadow-[0_12px_36px_rgba(99,142,203,0.45)] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-[0_8px_24px_rgba(99,142,203,0.30)] transition-all duration-300 ease-out cursor-pointer"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2.5">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          {mode === "login" ? t("auth.signing_in") : t("auth.creating")}
                        </span>
                      ) : mode === "login" ? t("auth.sign_in") : t("auth.create_account")}
                    </motion.button>

                    <div className="flex items-center gap-[12px] mt-[4px]">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D5DEEF] to-transparent dark:via-[#475569]" />
                      <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#395886]/50 dark:text-[#94A3B8]/50">{t("auth.or_continue_with")}</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D5DEEF] to-transparent dark:via-[#475569]" />
                    </div>

                    <SocialButton label={t("auth.continue_google")} icon={<GoogleIcon />} disabled={submitting} onClick={() => { if (redirectTo) localStorage.setItem("pendingVehicleRedirect", redirectTo); window.location.href = `${API_BASE_URL}/auth/google/redirect`; }} />

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-[10px] text-center text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium"
                    >
                      {mode === "login" ? (
                        <>{t("auth.no_account")} <a href="/register" className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline-offset-2 underline hover:text-[#F39C12] dark:hover:text-[#F39C12] transition-colors duration-200">{t("auth.sign_up_link")}</a></>
                      ) : (
                        <>{t("auth.has_account")} <a href="/login" className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline-offset-2 underline hover:text-[#F39C12] dark:hover:text-[#F39C12] transition-colors duration-200">{t("auth.sign_in_link")}</a></>
                      )}
                    </motion.div>

                    <div className="mt-[16px] flex flex-wrap items-center justify-center gap-[12px] text-[11px] text-[#395886]/60 dark:text-[#94A3B8]/60">
                      <a href="/privacy" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">{t("auth.privacy")}</a>
                      <span className="w-[3px] h-[3px] rounded-full bg-[#D5DEEF] dark:bg-[#475569]" />
                      <a href="/terms" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">{t("auth.terms")}</a>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
