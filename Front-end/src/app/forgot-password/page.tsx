"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/auth/InputField";
import { authForgotPassword, authResetPassword, authVerifyResetCode } from "@/lib/authApi";
import { Mail, Lock, ArrowLeft, CheckCircle } from "lucide-react";

const CODE_DIGITS = 6;

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_DIGITS).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setSubmitting(true);
    try {
      await authForgotPassword({ email: email.trim() });
      setStep("code");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi du code.");
    } finally {
      setSubmitting(false);
    }
  }

  function getCode() { return codeDigits.join(""); }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullCode = getCode();
    if (fullCode.length !== CODE_DIGITS || !/^\d{6}$/.test(fullCode)) {
      setError("Veuillez entrer un code valide à 6 chiffres.");
      return;
    }

    setSubmitting(true);
    try {
      await authVerifyResetCode({ email: email.trim(), code: fullCode });
      setStep("password");
    } catch (err: any) {
      setError(err?.message || "Code invalide.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);
    setError(null);
    if (value && index < CODE_DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_DIGITS);
    const next = [...codeDigits];
    for (let i = 0; i < CODE_DIGITS; i++) next[i] = text[i] ?? "";
    setCodeDigits(next);
    inputRefs.current[Math.min(text.length, CODE_DIGITS - 1)]?.focus();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullCode = getCode();
    if (fullCode.length !== CODE_DIGITS || !/^\d{6}$/.test(fullCode)) {
      setError("Veuillez entrer un code valide à 6 chiffres.");
      return;
    }

    if (!PASSWORD_RE.test(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, avec des lettres et des chiffres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      await authResetPassword({
        email: email.trim(),
        code: fullCode,
        password,
      });
      setStep("done");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full text-[#395886] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("/ChatGPT%20Image%20May%2018%2C%202026%2C%2010_29_10%20AM.png")',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA]/0 via-[#F0F3FA]/15 to-[#F0F3FA]/30"
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[470px]"
        >
          <div className="rounded-[16px] bg-white/65 backdrop-blur-xl border border-[#D5DEEF]/55 shadow-[0_10px_30px_rgba(57,88,134,0.18)] px-[28px] py-[24px] md:px-[40px] md:py-[28px] lg:px-[54px] lg:py-[40px]">
            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(["email", "code", "password"] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      step === s || (["code", "password", "done"].includes(step) && ["email", "code", "password"].indexOf(s) < ["email", "code", "password"].indexOf(step))
                        ? "bg-[#395886] text-white"
                        : "bg-[#D5DEEF] text-[#638ECB]"
                    }`}
                  >
                    {step === "done" && ["email", "code", "password"].indexOf(s) < 3 ? "✓" : i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`h-[2px] w-12 rounded transition-all ${
                        step === "done" || (["code", "password"].includes(step) && i < 1)
                          ? "bg-[#395886]"
                          : "bg-[#D5DEEF]"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.form
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSendCode}
                >
                  <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#395886] text-center">
                    Mot de passe oublié ?
                  </h2>
                  <p className="mt-2 text-[13px] md:text-[14px] text-[#395886] text-center">
                    Entrez votre adresse email pour recevoir un code de réinitialisation.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
                      {error}
                    </div>
                  )}

                  <div className="mt-6">
                    <InputField
                      label="Adresse email"
                      type="email"
                      value={email}
                      onChange={(v) => { setEmail(v); setError(null); }}
                      autoComplete="email"
                      placeholder=""
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity"
                  >
                    {submitting ? "Envoi en cours..." : "Envoyer le code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#638ECB] hover:opacity-80 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </button>
                </motion.form>
              )}

              {step === "code" && (
                <motion.div
                  key="code-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <form onSubmit={handleVerifyCode}>
                    <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#395886] text-center">
                      Code de vérification
                    </h2>
                    <p className="mt-2 text-[13px] md:text-[14px] text-[#395886] text-center">
                      Un code à 6 chiffres vous a été envoyé à <strong>{email}</strong>.
                    </p>

                    {error && (
                      <div className="mt-4 rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
                        {error}
                      </div>
                    )}

                    <div className="mt-[28px] flex gap-2 justify-center" onPaste={handleCodePaste}>
                      {codeDigits.map((digit, i) => (
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
                      type="submit"
                      disabled={submitting || getCode().length !== CODE_DIGITS}
                      className="mt-6 w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity"
                    >
                      {submitting ? "Vérification..." : "Vérifier le code"}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#638ECB] hover:opacity-80 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modifier l&apos;email
                  </button>
                </motion.div>
              )}

              {step === "password" && (
                <motion.form
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleResetPassword}
                >
                  <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#395886] text-center">
                    Nouveau mot de passe
                  </h2>
                  <p className="mt-2 text-[13px] md:text-[14px] text-[#395886] text-center">
                    Choisissez un nouveau mot de passe sécurisé.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-[10px] border border-[#638ECB] bg-white/70 px-[14px] py-[10px] text-[13px] font-semibold text-[#395886]">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-4">
                    <InputField
                      label="Nouveau mot de passe"
                      type="password"
                      value={password}
                      onChange={(v) => { setPassword(v); setError(null); }}
                      autoComplete="new-password"
                      placeholder=""
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                    <InputField
                      label="Confirmer le mot de passe"
                      type="password"
                      value={confirmPassword}
                      onChange={(v) => { setConfirmPassword(v); setError(null); }}
                      autoComplete="new-password"
                      placeholder=""
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 disabled:opacity-60 transition-opacity"
                  >
                    {submitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("code")}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#638ECB] hover:opacity-80 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                </motion.form>
              )}

              {step === "done" && (
                <motion.div
                  key="done-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#395886]">
                    Mot de passe réinitialisé
                  </h2>
                  <p className="mt-2 text-[13px] md:text-[14px] text-[#395886]">
                    Votre mot de passe a été mis à jour avec succès.
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-8 w-full h-[48px] rounded-[10px] bg-[#638ECB] text-white font-extrabold text-[14px] shadow-[0_8px_18px_rgba(99,142,203,0.28)] hover:opacity-95 transition-opacity"
                  >
                    Se connecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
