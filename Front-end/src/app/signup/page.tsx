"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { motion, AnimatePresence } from "framer-motion";

const CODE_DIGITS = 6;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, verifyEmail, error, status, user } = useAuth();

  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || localStorage.getItem("pendingVehicleRedirect") || null
    : null;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
  const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [code, setCode] = useState<string[]>(Array(CODE_DIGITS).fill(""));
  const [step, setStep] = useState<"form" | "code">("form");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [fieldErrors, setFieldErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
  }>({ name: null, email: null, password: null });

  useEffect(() => {
    if (status === "authenticated") {
      localStorage.removeItem("pendingVehicleRedirect");
      const isAdminUser = user?.role_id === 1 || user?.role_id === 3 || (user?.permissions && user.permissions.length > 0);
      router.replace(redirectTo || (isAdminUser ? "/admin" : "/vehicules"));
    }
  }, [status, router, redirectTo, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors = {
      name: NAME_RE.test(trimmedName) ? null : "Le nom doit contenir au moins 2 lettres.",
      email: EMAIL_RE.test(trimmedEmail) ? null : "Entrez une adresse e-mail valide.",
      password: PASSWORD_RE.test(password) ? null : "Le mot de passe doit comporter 8+ caractères avec des lettres et des chiffres.",
    };

    setFieldErrors(nextErrors);

    const hasAnyError = Boolean(nextErrors.name || nextErrors.email || nextErrors.password);
    if (hasAnyError) return;

    setSubmitting(true);
    try {
      const res = await signUp({ name: trimmedName, email: trimmedEmail, password });
      if (res && res.user_id) {
        setUserId(res.user_id);
        setStep("code");
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      const msg = (err as any)?.message || "Échec de l'inscription";
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
    for (let i = 0; i < CODE_DIGITS; i++) {
      next[i] = text[i] ?? "";
    }
    setCode(next);
    const nextIndex = Math.min(text.length, CODE_DIGITS - 1);
    inputRefs.current[nextIndex]?.focus();
  }

  async function handleVerifyCode() {
    const fullCode = code.join("");
    if (fullCode.length !== CODE_DIGITS) {
      setCodeError("Veuillez entrer le code complet.");
      return;
    }
    if (userId === null) return;

    setCodeSubmitting(true);
    setCodeError(null);
    try {
      await verifyEmail({ user_id: userId, code: fullCode });
      localStorage.removeItem("pendingVehicleRedirect");
      router.replace(redirectTo || "/vehicules");
    } catch (err) {
      setCodeError((err as any)?.message || "Code invalide");
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
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  }

  function backToForm() {
    setStep("form");
    setCode(Array(CODE_DIGITS).fill(""));
    setCodeError(null);
  }

  const formContent = (
    <>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-3xl font-black tracking-tight mb-2"
      >
        Inscription
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-6 font-semibold"
      >
        Créez votre compte
      </motion.p>

      {(error || formError) && (
        <div className="mb-4 p-3 border-2 border-black font-bold">
          {formError ?? error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <motion.label
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="flex flex-col gap-2"
        >
          <span className="font-bold">Nom</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: null }));
            }}
            className="border-2 border-black p-2 rounded-none"
            type="text"
            autoComplete="name"
            required
          />
          {fieldErrors.name ? (
            <span className="text-[11px] font-extrabold text-[#F39C12] mt-[-6px]">
              {fieldErrors.name}
            </span>
          ) : null}
        </motion.label>

        <motion.label
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.48 }}
          className="flex flex-col gap-2"
        >
          <span className="font-bold">E-mail</span>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: null }));
            }}
            className="border-2 border-black p-2 rounded-none"
            type="email"
            autoComplete="email"
            required
          />
          {fieldErrors.email ? (
            <span className="text-[11px] font-extrabold text-[#F39C12] mt-[-6px]">
              {fieldErrors.email}
            </span>
          ) : null}
        </motion.label>

        <motion.label
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.56 }}
          className="flex flex-col gap-2"
        >
          <span className="font-bold">Mot de passe</span>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: null }));
            }}
            className="border-2 border-black p-2 rounded-none"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {fieldErrors.password ? (
            <span className="text-[11px] font-extrabold text-[#F39C12] mt-[-6px]">
              {fieldErrors.password}
            </span>
          ) : null}
        </motion.label>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.65 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="mt-2 h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Création..." : "Créer un compte"}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.72 }}
          className="pt-2 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="underline font-bold cursor-pointer"
          >
            J'ai déjà un compte
          </button>

          <button
            type="button"
            onClick={() => router.push("/vehicules")}
            className="underline font-bold cursor-pointer"
          >
            Parcourir les véhicules
          </button>
        </motion.div>
      </motion.form>
    </>
  );

  const codeContent = (
    <>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl font-black tracking-tight mb-2"
      >
        Vérifiez votre e-mail
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6 font-semibold"
      >
        Nous avons envoyé un code à 6 chiffres à <span className="font-black">{email}</span>
      </motion.p>

      {codeError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 border-2 border-black font-bold"
        >
          {codeError}
        </motion.div>
      )}

      <div className="flex flex-col gap-6">
        <div
          className="flex gap-2 justify-center"
          onPaste={handleCodePaste}
        >
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
              className="w-11 h-14 text-center text-xl font-black border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerifyCode}
          disabled={codeSubmitting}
          className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50 cursor-pointer"
        >
          {codeSubmitting ? "Vérification..." : "Vérifier le code"}
        </motion.button>

        <div className="flex items-center justify-between text-sm font-bold">
          <button
            type="button"
            onClick={backToForm}
            className="underline cursor-pointer"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="underline cursor-pointer disabled:opacity-50"
          >
            {resending ? "Envoi..." : "Renvoyer le code"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 text-black"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === "code" ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === "code" ? -40 : 40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === "form" ? formContent : codeContent}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
