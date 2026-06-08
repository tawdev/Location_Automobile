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
      <div className="text-[12px] font-semibold text-[#395886] dark:text-[#94A3B8]">{label}</div>

      <div className="relative">
        {leftIcon ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#638ECB] dark:text-[#94A3B8]">{leftIcon}</div>
        ) : null}

        <input
          value={value}
          type={type}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-[8px] border border-[#D5DEEF] dark:border-[#475569] bg-white/70 dark:bg-[#1e293b]/70",
            "h-[40px] px-3",
            leftIcon ? "pl-10" : "",
            rightAction ? "pr-10" : "",
            "text-[13px] text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/70 dark:placeholder:text-[#64748b]",
            "focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40 focus:border-[#638ECB] dark:focus:ring-[#638ECB]/30 dark:focus:border-[#638ECB]",
            "transition-colors",
          ].join(" ")}
        />

        {rightAction ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightAction}</div>
        ) : null}
      </div>
    </div>
  );
}
