"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { InputField } from "./InputField";
import { SocialButton, GoogleIcon } from "./SocialButton";
import { API_BASE_URL } from "@/lib/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type AuthCardStatus = "loading" | "authenticated" | "unauthenticated";

type LoginCardProps = {
  onSignIn: (payload: { email: string; password: string }) => Promise<void>;
  onSignUp: (payload: { name: string; email: string; password: string }) => Promise<void>;
  status: AuthCardStatus;
  error?: string | null;
  submitting?: boolean;
  initialMode?: "login" | "signup";
};

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

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 9.5a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

export function LoginCard({
  onSignIn,
  onSignUp,
  error,
  submitting,
  initialMode = "login",
}: LoginCardProps) {
  const { t } = useI18n();

  const emailId = useId();
  const passwordId = useId();

  const EMAIL_RE = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const NAME_RE = useMemo(() => /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/, []);
  const PASSWORD_RE = useMemo(() => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, []);

  const [currentSearch, setCurrentSearch] = useState("");
  useEffect(() => { setCurrentSearch(window.location.search); }, []);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

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

  useEffect(() => {
    setMode(initialMode);
    setFormError(null);
    setFieldErrors({ name: null, email: null, password: null });
    setPassword("");
    setName("");
    setRemember(true);
  }, [initialMode]);

  const isSubmitting = !!submitting;

  const displayError = useMemo(() => formError ?? error ?? null, [formError, error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextErrors = {
      name: mode === "signup" ? (NAME_RE.test(trimmedName) ? null : t("auth.name_error")) : null,
      email: EMAIL_RE.test(trimmedEmail) ? null : t("auth.email_error"),
      password: PASSWORD_RE.test(password) ? null : t("auth.password_error"),
    };

    setFieldErrors(nextErrors);

    const hasAnyError = Boolean(nextErrors.name || nextErrors.email || nextErrors.password);
    if (hasAnyError) return;

    try {
      if (mode === "login") {
        await onSignIn({ email: trimmedEmail, password });
      } else {
        await onSignUp({ name: trimmedName, email: trimmedEmail, password });
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : mode === "login"
            ? t("auth.login_failed")
            : t("auth.signup_failed");
      setFormError(msg);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
    >
      <div className="relative rounded-[20px] bg-white/[0.07] backdrop-blur-2xl border border-[#D5DEEF]/25 shadow-[0_8px_32px_rgba(57,88,134,0.10)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px] overflow-hidden">
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-[#638ECB]/0 via-[#638ECB] to-[#FF8D21]/0 rounded-full" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#638ECB]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#FF8D21]/5 rounded-full blur-3xl pointer-events-none" />

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[28px] md:text-[32px] lg:text-[40px] font-extrabold text-[#395886] leading-[1.05] text-center tracking-tight"
        >
          {mode === "login" ? (
            <>
              {t("auth.login_title")} <span className="text-[#FF8D21]">{t("auth.login_title_highlight")}</span>
            </>
          ) : (
            <>
              {t("auth.signup_title")} <span className="text-[#FF8D21]">{t("auth.signup_title_highlight")}</span>
            </>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-[6px] text-[14px] md:text-[15px] lg:text-[17px] text-[#395886]/70 text-center font-medium"
        >
          {mode === "login" ? t("auth.login_subtitle") : t("auth.signup_subtitle")}
        </motion.p>

        {displayError ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-[18px] rounded-[12px] border border-[#FF8D21]/40 bg-[#FF8D21]/8 px-[16px] py-[12px] text-[13px] font-semibold text-[#395886] backdrop-blur-md"
          >
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#FF8D21]">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16v0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {displayError}
            </span>
          </motion.div>
        ) : null}

        <form className="mt-[24px] flex flex-col gap-[16px]" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="sr-only">
                <label htmlFor="signup-name">{t("auth.name")}</label>
              </div>
              <InputField
                label={t("auth.name")}
                type="text"
                value={name}
                onChange={(next) => {
                  setName(next);
                  setFieldErrors((prev) => ({ ...prev, name: null }));
                }}
                autoComplete="name"
                placeholder=""
                leftIcon={<div className="font-extrabold">@</div>}
              />
              {fieldErrors.name ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#FF8D21]">
                  {fieldErrors.name}
                </motion.span>
              ) : null}
            </motion.div>
          ) : null}

          <div>
            <div className="sr-only">
              <label htmlFor={emailId}>{t("auth.email")}</label>
            </div>
            <InputField
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(next) => {
                setEmail(next);
                setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              autoComplete="email"
              placeholder=""
              leftIcon={<MailIcon />}
            />
            {fieldErrors.email ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#FF8D21]">
                {fieldErrors.email}
              </motion.span>
            ) : null}
          </div>

          <div>
            <div className="flex items-end justify-between">
              <div className="text-[13px] font-bold text-[#395886] dark:text-[#94A3B8] mb-1 tracking-tight">{t("auth.password")}</div>

              {mode === "login" ? (
                <a href="/forgot-password" className="text-[12px] font-semibold text-[#638ECB] underline-offset-2 underline hover:text-[#395886] transition-colors duration-200">
                  {t("auth.forgot_password")}
                </a>
              ) : (
                <span />
              )}
            </div>

            <div className="mt-[2px]">
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#638ECB]/60 dark:text-[#94A3B8]/60 group-focus-within:text-[#638ECB] transition-colors duration-300">
                  <LockIcon />
                </div>

                <input
                  id={passwordId}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }}
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
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {fieldErrors.password ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[6px] block text-[11px] font-extrabold text-[#FF8D21]">
                  {fieldErrors.password}
                </motion.span>
              ) : null}
            </div>
          </div>

          {mode === "login" ? (
            <label className="flex items-center gap-[10px] mt-[2px] cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer w-[16px] h-[16px] accent-[#638ECB] cursor-pointer rounded"
                />
              </div>
              <span className="text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium group-hover:text-[#638ECB] transition-colors duration-200">{t("auth.remember")}</span>
            </label>
          ) : null}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.015 } : {}}
            whileTap={!isSubmitting ? { scale: 0.985 } : {}}
            className="mt-[6px] h-[50px] rounded-[12px] bg-gradient-to-r from-[#638ECB] to-[#4a7bb8] text-white font-extrabold text-[15px] shadow-[0_8px_24px_rgba(99,142,203,0.30)] hover:shadow-[0_12px_36px_rgba(99,142,203,0.45)] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-[0_8px_24px_rgba(99,142,203,0.30)] transition-all duration-300 ease-out"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2.5">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {mode === "login" ? t("auth.signing_in") : t("auth.creating")}
              </span>
            ) : (
              mode === "login" ? t("auth.sign_in") : t("auth.create_account")
            )}
          </motion.button>

          <div className="flex items-center gap-[12px] mt-[4px]">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D5DEEF] to-transparent dark:via-[#475569]" />
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#395886]/50 dark:text-[#94A3B8]/50">{t("auth.or_continue_with")}</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D5DEEF] to-transparent dark:via-[#475569]" />
          </div>

          <SocialButton
            label={t("auth.continue_google")}
            icon={<GoogleIcon />}
            disabled={isSubmitting}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const redirect = params.get("redirect");
              if (redirect) localStorage.setItem("pendingVehicleRedirect", redirect);
              window.location.href = `${API_BASE_URL}/auth/google/redirect`;
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-[10px] text-center text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium"
          >
            {mode === "login" ? (
              <>
                {t("auth.no_account")}{" "}
                <a href={`/register${currentSearch}`} className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline-offset-2 underline hover:text-[#FF8D21] dark:hover:text-[#FF8D21] transition-colors duration-200">
                  {t("auth.sign_up_link")}
                </a>
              </>
            ) : (
              <>
                {t("auth.has_account")}{" "}
                <a href={`/login${currentSearch}`} className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline-offset-2 underline hover:text-[#FF8D21] dark:hover:text-[#FF8D21] transition-colors duration-200">
                  {t("auth.sign_in_link")}
                </a>
              </>
            )}
          </motion.div>

          <div className="mt-[16px] flex flex-wrap items-center justify-center gap-[12px] text-[11px] text-[#395886]/60 dark:text-[#94A3B8]/60">
            <a href="/privacy" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">
              {t("auth.privacy")}
            </a>
            <span className="w-[3px] h-[3px] rounded-full bg-[#D5DEEF] dark:bg-[#475569]" />
            <a href="/terms" className="hover:text-[#395886] dark:hover:text-[#D5DEEF] underline-offset-2 underline transition-colors duration-200">
              {t("auth.terms")}
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
