"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, error, status } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await signUp({ name, email, password });
      router.replace("/vehicles");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign up failed";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

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
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-3xl font-black tracking-tight mb-2"
        >
          Sign up
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-6 font-semibold"
        >
          Create your account
        </motion.p>

        {status === "authenticated" && (
          <div className="mb-4 p-3 border-2 border-black font-bold">
            You are already logged in.
          </div>
        )}

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
            <span className="font-bold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-black p-2 rounded-none"
              type="text"
              autoComplete="name"
              required
            />
          </motion.label>

          <motion.label
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.48 }}
            className="flex flex-col gap-2"
          >
            <span className="font-bold">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-black p-2 rounded-none"
              type="email"
              autoComplete="email"
              required
            />
          </motion.label>

          <motion.label
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.56 }}
            className="flex flex-col gap-2"
          >
            <span className="font-bold">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-black p-2 rounded-none"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </motion.label>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.65 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create account"}
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
              className="underline font-bold"
            >
              I have an account
            </button>

            <button
              type="button"
              onClick={() => router.push("/vehicles")}
              className="underline font-bold"
            >
              Browse vehicles
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
