"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn, signUp, error, status } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(payload: { email: string; password: string }) {
    setSubmitting(true);
    try {
      const user = await signIn(payload);
      router.replace(user.role_id === 1 ? "/admin" : "/vehicles");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(payload: { name: string; email: string; password: string }) {
    setSubmitting(true);
    try {
      const user = await signUp(payload);
      router.replace(user.role_id === 1 ? "/admin" : "/vehicles");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      initialMode="signup"
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      status={status}
      error={error}
      submitting={submitting}
    />
  );
}
