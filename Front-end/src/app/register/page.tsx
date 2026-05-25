"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const { signIn, signUp, verifyEmail, error, status } = useAuth();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
  const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const [mode, setMode] = useState<"login" | "signup">("signup");

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

  useEffect(() => {
    if (status === "authenticated") router.replace("/vehicles");
  }, [status, router]);

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
      router.replace("/vehicles");
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
    <div className="relative min-h-screen w-full text-[#395886] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/ChatGPT%20Image%20May%2018%2C%202026%2C%2010_29_10%20AM.png")' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA]/0 via-[#F0F3FA]/15 to-[#F0F3FA]/30" aria-hidden="true" />

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
                <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
                  <h2 className="text-[26px] md:text-[30px] lg:text-[38px] font-extrabold text-[#395886] leading-[1.05] text-center">
                    Check <span className="text-[#F39C12]">Your Email</span>
                  </h2>
                  <p className="mt-[4px] text-[13px] md:text-[14px] lg:text-[16px] text-[#395886] text-center">
                    We sent a 6-digit code to <span className="font-black">{email}</span>
                  </p>

                  {codeError && (
                    <div className="mt-[16px] rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
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
                        className="w-11 h-14 text-center text-xl font-black border border-[#D5DEEF] rounded-[8px] bg-white/70 text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] transition-colors"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={codeSubmitting}
                    onClick={handleVerifyCode}
                    className="mt-[22px] w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                  >
                    {codeSubmitting ? "Verifying..." : "Verify Code"}
                  </button>

                  <div className="mt-[16px] flex items-center justify-between text-[13px] font-semibold">
                    <button type="button" onClick={backToForm} className="text-[#638ECB] underline hover:opacity-80 cursor-pointer">
                      Back
                    </button>
                    <button type="button" onClick={handleResend} disabled={resending} className="text-[#638ECB] underline hover:opacity-80 disabled:opacity-50 cursor-pointer">
                      {resending ? "Sending..." : "Resend code"}
                    </button>
                  </div>

                  <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px] text-[11px] text-[#395886]">
                    <a href="." className="hover:opacity-90 underline-offset-2 underline">Privacy Policy</a>
                    <span className="opacity-50">|</span>
                    <a href="." className="hover:opacity-90 underline-offset-2 underline">Terms of Service</a>
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
                <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
                  <h2 className="text-[26px] md:text-[30px] lg:text-[38px] font-extrabold text-[#395886] leading-[1.05] text-center">
                    {mode === "login" ? <>Welcome <span className="text-[#F39C12]">Back</span></> : <>Create <span className="text-[#F39C12]">Account</span></>}
                  </h2>

                  <p className="mt-[4px] text-[13px] md:text-[14px] lg:text-[16px] text-[#395886] text-center">
                    {mode === "login" ? "Sign in to continue your journey" : "Sign up to start booking with ease"}
                  </p>

                  {displayError && (
                    <div className="mt-[16px] rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
                      {displayError}
                    </div>
                  )}

                  <form className="mt-[22px] flex flex-col gap-[14px]" onSubmit={handleSubmit}>
                    {mode === "signup" && (
                      <div>
                        <div className="sr-only"><label>Name</label></div>
                        <InputField label="Name" type="text" value={name} onChange={(next) => { setName(next); setFieldErrors((prev) => ({ ...prev, name: null })); }} autoComplete="name" placeholder="" leftIcon={<div className="text-[#638ECB] font-extrabold">@</div>} />
                        {fieldErrors.name && <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.name}</span>}
                      </div>
                    )}

                    <div>
                      <InputField label="Email Address" type="email" value={email} onChange={(next) => { setEmail(next); setFieldErrors((prev) => ({ ...prev, email: null })); }} autoComplete="email" placeholder="" leftIcon={<MailIcon />} />
                      {fieldErrors.email && <span className="mt-[6px] block text-[11px] font-extrabold text-[#F39C12]">{fieldErrors.email}</span>}
                    </div>

                    <div>
                      <div className="flex items-end justify-between">
                        <div className="text-[12px] font-semibold text-[#395886] mb-1">Password</div>
                        {mode === "login" && <a href="." className="text-[12px] font-semibold text-[#638ECB] underline hover:opacity-80">Forgot Password?</a>}
                      </div>
                      <div className="mt-[2px]">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#638ECB]"><LockIcon /></div>
                          <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: null })); }}
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            className="w-full rounded-[8px] border border-[#D5DEEF] bg-white/70 h-[40px] px-3 pl-10 pr-10 text-[13px] text-[#395886] placeholder:text-[#638ECB]/70 focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] transition-colors"
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
                        <span className="text-[13px] text-[#395886] font-medium">Remember this device</span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-[4px] h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                    >
                      {submitting ? (mode === "login" ? "Signing in..." : "Creating...") : mode === "login" ? "Sign In" : "Create Account"}
                    </button>

                    <div className="flex items-center gap-[14px] mt-[6px]">
                      <div className="h-[1px] flex-1 bg-[#D5DEEF]" />
                      <div className="text-[11px] font-extrabold tracking-[0.16em] text-[#395886]">OR CONTINUE WITH</div>
                      <div className="h-[1px] flex-1 bg-[#D5DEEF]" />
                    </div>

                    <SocialButton label="Continue with Google" icon={<GoogleIcon />} disabled={submitting} onClick={() => { window.location.href = `${API_BASE_URL}/auth/google/redirect`; }} />

                    <div className="mt-[12px] text-center text-[13px] text-[#395886] font-medium">
                      {mode === "login" ? (
                        <>Don't have an account? <a href="/register" className="text-[#638ECB] font-extrabold underline hover:opacity-80">register</a></>
                      ) : (
                        <>Already have an account? <a href="/login" className="text-[#638ECB] font-extrabold underline hover:opacity-80">login</a></>
                      )}
                    </div>

                    <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px] text-[11px] text-[#395886]">
                      <a href="." className="hover:opacity-90 underline-offset-2 underline">Privacy Policy</a>
                      <span className="opacity-50">|</span>
                      <a href="." className="hover:opacity-90 underline-offset-2 underline">Terms of Service</a>
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
