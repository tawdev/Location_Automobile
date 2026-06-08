"use client";

import React from "react";

type SocialButtonProps = {
  label: string;
  onClick?: () => void;
  icon: React.ReactNode;
  variant?: "google";
  disabled?: boolean;
};

export function SocialButton({ label, onClick, icon, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full h-[48px]",
        "rounded-[12px]",
        "border border-[#D5DEEF]/50 dark:border-[#475569]/40",
        "bg-white/70 dark:bg-[#1e293b]/60",
        "backdrop-blur-md",
        "shadow-[0_2px_8px_rgba(57,88,134,0.06)]",
        "text-[#395886] dark:text-[#D5DEEF]",
        "font-semibold",
        "transition-all duration-300 ease-out",
        "hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(57,88,134,0.12)] hover:bg-white/90 dark:hover:bg-[#1e293b]/80",
        "active:translate-y-0 active:shadow-[0_2px_8px_rgba(57,88,134,0.06)]",
        "disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_2px_8px_rgba(57,88,134,0.06)]",
      ].join(" ")}
    >
      <span className="inline-flex items-center justify-center gap-3">
        <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
        <span className="text-[14px]">{label}</span>
      </span>
    </button>
  );
}

export function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.377 4.657-5.657 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.962 3.037l5.657-5.657C34.674 6.053 29.808 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.1 19.3A15.957 15.957 0 0 1 24 8c1.04 0 2.047.138 3.013.4l-5.6 5.6A11.985 11.985 0 0 0 12 24c0 1.938.49 3.76 1.35 5.36l-6.544 4.858A19.953 19.953 0 0 1 4 24c0-3.987 1.24-7.695 2.306-9.309Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.708 0 10.574-1.953 13.967-5.333l-6.586-5.333C29.748 35.667 27.06 36 24 36c-5.646 0-9.926-3.343-11.303-8l-7.5 6.001C7.426 39.105 15.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.007 12.007 0 0 1-4.077 6.667l.026.02 7.5-6.001c.314-.86.485-1.78.485-2.785 0-1.341-.138-2.651-.389-3.917Z"
      />
    </svg>
  );
}
