"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/auth/HeroSection";
import { SocialButton, GoogleIcon } from "@/components/auth/SocialButton";
import { InputField } from "@/components/auth/InputField";
import { API_BASE_URL } from "@/lib/config";

const CODE_DIGITS = 6;

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
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="#638ECB" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 9.5a3 3 0 0 0 4 4" stroke="#638ECB" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 3l18 18" stroke="#638ECB" strokeWidth="1.7" strokeLinecap="round" />
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, verifyEmail, error, status } = useAuth();
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
      name: mode === "signup" ? (NAME_RE.test(trimmedName) ? null : "Name must be at least 2 letters.") : null,
      email: EMAIL_RE.test(trimmedEmail) ? null : "Enter a valid email address.",
      password: PASSWORD_RE.test(password) ? null : "Password must be 8+ chars and include letters + numbers.",
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
      const msg = (err as any)?.message || (mode === "login" ? "Sign in failed" : "Sign up failed");
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
    if (fullCode.length !== CODE_DIGITS) { setCodeError("Enter the full code."); return; }
    if (userId === null) return;
    setCodeSubmitting(true);
    setCodeError(null);
    try {
      await verifyEmail({ user_id: userId, code: fullCode });
      localStorage.removeItem("pendingVehicleRedirect");
      router.replace(redirectTo || "/vehicles");
    } catch (err) {
      setCodeError((err as any)?.message || "Invalid code");
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA]/0 via-[#F0F3FA]/15 to-[#F0F3FA]/30 dark:hidden" aria-hidden="true" />
      {/* Dark mode gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1729]/0 via-[#0f1729]/30 to-[#0f1729]/50 hidden dark:block" aria-hidden="true" />

      {/* Dark mode toggle button */}
      <motion.button
        type="button"
        onClick={toggleDark}
        aria-label="Toggle dark mode"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85, rotate: 30 }}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl border border-[#D5DEEF]/60 bg-white/70 backdrop-blur-md text-[#395886] hover:bg-white dark:border-[#475569] dark:bg-[#1e293b]/70 dark:text-[#D5DEEF] dark:hover:bg-[#1e293b] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
              >
                <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] dark:bg-[#0f1729]/80 dark:border-[#334155]/60 dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
                  <h2 className="text-[26px] md:text-[30px] lg:text-[38px] font-extrabold text-[#395886] dark:text-[#D5DEEF] leading-[1.05] text-center">
                    Vérifiez <span className="text-[#F39C12]">votre e-mail</span>
                  </h2>
                  <p className="mt-[4px] text-[13px] md:text-[14px] lg:text-[16px] text-[#395886] dark:text-[#94A3B8] text-center">
                    Nous avons envoyé un code à 6 chiffres à <span className="font-black">{email}</span>
                  </p>

                  {codeError && (
                    <div className="mt-[16px] rounded-[10px] border border-[#638ECB] bg-white/70 dark:border-[#638ECB]/50 dark:bg-[#1e293b]/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886] dark:text-[#D5DEEF]">
                      {codeError}
                    </div>
                  )}

                  <div className="mt-[28px] flex gap-2 justify-center" onPaste={handleCodePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        className="w-11 h-14 text-center text-xl font-black border border-[#D5DEEF] dark:border-[#475569] rounded-[8px] bg-white/70 dark:bg-[#1e293b]/70 text-[#395886] dark:text-[#D5DEEF] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/30 dark:focus:border-[#638ECB] transition-colors"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={codeSubmitting}
                    onClick={handleVerifyCode}
                    className="mt-[22px] w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                  >
                    {codeSubmitting ? "Vérification..." : "Vérifier le code"}
                  </button>

                  <div className="mt-[16px] flex items-center justify-between text-[13px] font-semibold">
                    <button type="button" onClick={backToForm} className="text-[#638ECB] dark:text-[#94A3B8] underline hover:opacity-80 cursor-pointer">
                      Retour
                    </button>
                    <button type="button" onClick={handleResend} disabled={resending} className="text-[#638ECB] dark:text-[#94A3B8] underline hover:opacity-80 disabled:opacity-50 cursor-pointer">
                      {resending ? "Envoi..." : "Renvoyer le code"}
                    </button>
                  </div>

                  <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px] text-[11px] text-[#395886] dark:text-[#94A3B8]">
                    <a href="." className="hover:opacity-90 underline-offset-2 underline">Politique de confidentialité</a>
                    <span className="opacity-50">|</span>
                    <a href="." className="hover:opacity-90 underline-offset-2 underline">Conditions d'utilisation</a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="w-full max-w-[470px] mx-auto md:max-w-[560px] lg:max-w-[650px]"
              >
                <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] dark:bg-[#0f1729]/80 dark:border-[#334155]/60 dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
                  <h2 className="text-[26px] md:text-[30px] lg:text-[38px] font-extrabold text-[#395886] dark:text-[#D5DEEF] leading-[1.05] text-center">
                    {mode === "login" ? <>Bon retour <span className="text-[#F39C12]">parmi nous</span></> : <>Créer un <span className="text-[#F39C12]">compte</span></>}
                  </h2>

                  <p className="mt-[4px] text-[13px] md:text-[14px] lg:text-[16px] text-[#395886] dark:text-[#94A3B8] text-center">
                    {mode === "login" ? "Connectez-vous pour continuer" : "Inscrivez-vous pour réserver facilement"}
                  </p>

                  {displayError && (
                    <div className="mt-[16px] rounded-[10px] border border-[#638ECB] bg-white/70 dark:border-[#638ECB]/50 dark:bg-[#1e293b]/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886] dark:text-[#D5DEEF]">
                      {displayError}
                    </div>
                  )}

                  <form className="mt-[22px] flex flex-col gap-[14px]" onSubmit={handleSubmit}>
                    {mode === "signup" && (
                      <div>
                        <div className="sr-only"><label>Nom</label></div>
                        <InputField label="Nom" type="text" value={name} onChange={(next) => { setName(next); setFieldErrors((prev) => ({ ...prev, name: null })); }} autoComplete="name" placeholder="" leftIcon={<div className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold">@</div>} />
                        {fieldErrors.name && <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.name}</span>}
                      </div>
                    )}

                    <div>
                      <InputField label="Adresse e-mail" type="email" value={email} onChange={(next) => { setEmail(next); setFieldErrors((prev) => ({ ...prev, email: null })); }} autoComplete="email" placeholder="" leftIcon={<MailIcon />} />
                      {fieldErrors.email && <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.email}</span>}
                    </div>

                    <div>
                      <div className="flex items-end justify-between">
                        <div className="text-[12px] font-semibold text-[#395886] dark:text-[#94A3B8] mb-1">Mot de passe</div>
                        {mode === "login" && <a href="." className="text-[12px] font-semibold text-[#638ECB] dark:text-[#94A3B8] underline hover:opacity-80">Mot de passe oublié ?</a>}
                      </div>
                      <div className="mt-[2px]">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#638ECB] dark:text-[#94A3B8]"><LockIcon /></div>
                          <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: null })); }}
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            className="w-full rounded-[8px] border border-[#D5DEEF] dark:border-[#475569] bg-white/70 dark:bg-[#1e293b]/70 h-[40px] px-3 pl-10 pr-10 text-[13px] text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/70 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/30 dark:focus:border-[#638ECB] transition-colors"
                            required
                            minLength={mode === "signup" ? 8 : undefined}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90"><EyeOffIcon /></div>
                        </div>
                        {fieldErrors.password && <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.password}</span>}
                      </div>
                    </div>

                    {mode === "login" && (
                      <label className="flex items-center gap-[10px] mt-[2px]">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-[16px] h-[16px] accent-[#638ECB]" />
                        <span className="text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium">Mémoriser cet appareil</span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-[4px] h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                    >
                      {submitting ? (mode === "login" ? "Connexion..." : "Création...") : mode === "login" ? "Connexion" : "Créer un compte"}
                    </button>

                    <div className="flex items-center gap-[14px] mt-[6px]">
                      <div className="h-[1px] flex-1 bg-[#D5DEEF] dark:bg-[#475569]" />
                      <div className="text-[11px] font-extrabold tracking-[0.16em] text-[#395886] dark:text-[#94A3B8]">OU CONTINUER AVEC</div>
                      <div className="h-[1px] flex-1 bg-[#D5DEEF] dark:bg-[#475569]" />
                    </div>

                    <SocialButton label="Continuer avec Google" icon={<GoogleIcon />} disabled={submitting} onClick={() => { if (redirectTo) localStorage.setItem("pendingVehicleRedirect", redirectTo); window.location.href = `${API_BASE_URL}/auth/google/redirect`; }} />

                    <div className="mt-[12px] text-center text-[13px] text-[#395886] dark:text-[#94A3B8] font-medium">
                      {mode === "login" ? (
                        <>Vous n'avez pas de compte ? <a href="/register" className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline hover:opacity-80">inscrivez-vous</a></>
                      ) : (
                        <>Vous avez déjà un compte ? <a href="/login" className="text-[#638ECB] dark:text-[#94A3B8] font-extrabold underline hover:opacity-80">connectez-vous</a></>
                      )}
                    </div>

                    <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px] text-[11px] text-[#395886] dark:text-[#94A3B8]">
                      <a href="." className="hover:opacity-90 underline-offset-2 underline">Politique de confidentialité</a>
                      <span className="opacity-50">|</span>
                      <a href="." className="hover:opacity-90 underline-offset-2 underline">Conditions d'utilisation</a>
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
