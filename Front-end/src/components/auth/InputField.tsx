"use client";

import React from "react";

type InputFieldProps = {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
};

export function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  leftIcon,
  rightAction,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[13px] font-bold text-[#395886] dark:text-[#94A3B8] tracking-tight">{label}</div>

      <div className="relative group">
        {leftIcon ? (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#638ECB]/60 dark:text-[#94A3B8]/60 group-focus-within:text-[#638ECB] transition-colors duration-300">{leftIcon}</div>
        ) : null}

        <input
          value={value}
          type={type}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-[12px] border border-[#D5DEEF]/60 dark:border-[#475569]/50 bg-white/[0.12] dark:bg-[#1e293b]/20",
            "h-[46px] px-3",
            leftIcon ? "pl-[42px]" : "",
            rightAction ? "pr-[42px]" : "",
            "text-[14px] text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 dark:placeholder:text-[#64748b]/50",
            "focus:outline-none focus:ring-[3px] focus:ring-[#638ECB]/20 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/15 dark:focus:border-[#638ECB]",
            "hover:border-[#638ECB]/30 dark:hover:border-[#638ECB]/30",
            "transition-all duration-300 ease-out",
          ].join(" ")}
        />

        {rightAction ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightAction}</div>
        ) : null}
      </div>
    </div>
  );
}
