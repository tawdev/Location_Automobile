"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { HeroSection } from "./HeroSection";
import { LoginCard } from "./LoginCard";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function AuthLayout({
  onSignIn,
  onSignUp,
  initialMode,
  status,
  error,
  submitting,
}: {
  onSignIn: (payload: { email: string; password: string }) => Promise<void>;
  onSignUp: (payload: { name: string; email: string; password: string }) => Promise<void>;
  initialMode?: "login" | "signup";
  status: AuthStatus;
  error?: string | null;
  submitting?: boolean;
}) {
  const pathname = usePathname();
  return (
    <div className="relative min-h-screen w-full text-[#395886] overflow-hidden">
      {/* Full-page cinematic background (sits behind everything) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("/ChatGPT%20Image%20May%2018%2C%202026%2C%2010_29_10%20AM.png")',
        }}
        aria-hidden="true"
      />
      {/* Soft wash (lighter to preserve sky clarity) */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#F0F3FA]/0 via-[#F0F3FA]/5 to-[#F0F3FA]/10"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="w-full lg:flex-[1.1]">
          <HeroSection />
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:px-[34px] lg:py-[70px] lg:flex-[0.9] lg:justify-start lg:pl-[50px]">
          <div className="w-full">
            <LoginCard key={pathname}
              onSignIn={onSignIn}
              onSignUp={onSignUp}
              initialMode={initialMode}
              status={status}
              error={error}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
