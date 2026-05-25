"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, error, status } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_auth_failed") {
      setGoogleError("Google sign-in failed. Please try again.");
    } else if (err === "missing_role") {
      setGoogleError("Account creation failed. Please contact support.");
    }
  }, [searchParams]);

  async function handleSignIn(payload: { email: string; password: string }) {
    setSubmitting(true);
    try {
      const user = await signIn(payload);
      router.replace(user.role_id === 1 ? "/admin/vehicles" : "/vehicles");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(payload: { name: string; email: string; password: string }) {
    setSubmitting(true);
    try {
      await signUp(payload);
      router.replace("/signup");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      status={status}
      error={googleError ?? error}
      submitting={submitting}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
