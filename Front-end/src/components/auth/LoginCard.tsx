"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { InputField } from "./InputField";
import { SocialButton, GoogleIcon } from "./SocialButton";
import { API_BASE_URL } from "@/lib/config";

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
      <path d="M4 6h16v12H4V6Z" stroke="#638ECB" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" stroke="#638ECB" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#638ECB" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 11h12v10H6V11Z" stroke="#638ECB" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 15v3" stroke="#638ECB" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="#638ECB"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.5 9.5a3 3 0 0 0 4 4" stroke="#638ECB" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 3l18 18" stroke="#638ECB" strokeWidth="1.7" strokeLinecap="round" />
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
  const emailId = useId();
  const passwordId = useId();

  const EMAIL_RE = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const NAME_RE = useMemo(() => /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/, []);
  const PASSWORD_RE = useMemo(() => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, []);

  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      name: mode === "signup" ? (NAME_RE.test(trimmedName) ? null : "Le nom doit contenir au moins 2 lettres.") : null,
      email: EMAIL_RE.test(trimmedEmail) ? null : "Entrez une adresse e-mail valide.",
      password: PASSWORD_RE.test(password) ? null : "Le mot de passe doit comporter 8+ caractères avec des lettres et des chiffres.",
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
            ? "Échec de la connexion"
            : "Échec de l'inscription";
      setFormError(msg);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
    >
      <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
        <h2 className="text-[26px] md:text-[30px] lg:text-[38px] font-extrabold text-[#395886] leading-[1.05] text-center">
          {mode === "login" ? (
            <>
              Bon retour <span className="text-[#F39C12]">parmi nous</span>
            </>
          ) : (
            <>
              Créer un <span className="text-[#F39C12]">compte</span>
            </>
          )}
        </h2>

        <p className="mt-[4px] text-[13px] md:text-[14px] lg:text-[16px] text-[#395886] text-center">
          {mode === "login" ? "Connectez-vous pour continuer" : "Inscrivez-vous pour réserver facilement"}
        </p>

        {displayError ? (
          <div className="mt-[16px] rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
            {displayError}
          </div>
        ) : null}

        <form className="mt-[22px] flex flex-col gap-[14px]" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div>
              <div className="sr-only">
                <label htmlFor="signup-name">Nom</label>
              </div>
              <InputField
                label="Nom"
                type="text"
                value={name}
                onChange={(next) => {
                  setName(next);
                  setFieldErrors((prev) => ({ ...prev, name: null }));
                }}
                autoComplete="name"
                placeholder=""
                leftIcon={<div className="text-[#638ECB] font-extrabold">@</div>}
              />
              {fieldErrors.name ? (
                <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">
                  {fieldErrors.name}
                </span>
              ) : null}
            </div>
          ) : null}

          <div>
            <div className="sr-only">
              <label htmlFor={emailId}>Adresse e-mail</label>
            </div>
            <InputField
              label="Adresse e-mail"
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
              <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">
                {fieldErrors.email}
              </span>
            ) : null}
          </div>

          <div>
            <div className="flex items-end justify-between">
              <div className="text-[12px] font-semibold text-[#395886] mb-1">Mot de passe</div>

              {mode === "login" ? (
                <a href="/forgot-password" className="text-[12px] font-semibold text-[#638ECB] underline hover:opacity-80">
                  Mot de passe oublié ?
                </a>
              ) : (
                <span />
              )}
            </div>

            <div className="mt-[2px]">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#638ECB]">
                  <LockIcon />
                </div>

                <input
                  id={passwordId}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }}
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full rounded-[8px] border border-[#D5DEEF] bg-white/70 h-[40px] px-3 pl-10 pr-10 text-[13px] text-[#395886] placeholder:text-[#638ECB]/70 focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] transition-colors"
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90">
                  <EyeOffIcon />
                </div>
              </div>
              {fieldErrors.password ? (
                <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">
                  {fieldErrors.password}
                </span>
              ) : null}
            </div>
          </div>

          {mode === "login" ? (
            <label className="flex items-center gap-[10px] mt-[2px]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-[16px] h-[16px] accent-[#638ECB]"
              />
              <span className="text-[13px] text-[#395886] font-medium">Mémoriser cet appareil</span>
            </label>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-[4px] h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 disabled:hover:opacity-60 transition-opacity"
          >
            {isSubmitting ? (mode === "login" ? "Connexion..." : "Création...") : mode === "login" ? "Connexion" : "Créer un compte"}
          </button>

          <>
            <div className="flex items-center gap-[14px] mt-[6px]">
              <div className="h-[1px] flex-1 bg-[#D5DEEF]" />
              <div className="text-[11px] font-extrabold tracking-[0.16em] text-[#395886]">OU CONTINUER AVEC</div>
              <div className="h-[1px] flex-1 bg-[#D5DEEF]" />
            </div>

            <SocialButton
              label="Continuer avec Google"
              icon={<GoogleIcon />}
              disabled={isSubmitting}
              onClick={() => {
                window.location.href = `${API_BASE_URL}/auth/google/redirect`;
              }}
            />
          </>

          <div className="mt-[12px] text-center text-[13px] text-[#395886] font-medium">
            {mode === "login" ? (
              <>
                Vous n'avez pas de compte ?{" "}
                <a href="/register" className="text-[#638ECB] font-extrabold underline hover:opacity-80">
                  inscrivez-vous
                </a>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <a href="/login" className="text-[#638ECB] font-extrabold underline hover:opacity-80">
                  connectez-vous
                </a>
              </>
            )}
          </div>

          <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px] text-[11px] text-[#395886]">
            <a href="." className="hover:text-[#395886] hover:opacity-90 underline-offset-2 underline">
              Politique de confidentialité
            </a>
            <span className="opacity-50">|</span>
            <a href="." className="hover:text-[#395886] hover:opacity-90 underline-offset-2 underline">
              Conditions d'utilisation
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
