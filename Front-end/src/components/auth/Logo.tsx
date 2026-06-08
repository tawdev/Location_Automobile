import React from "react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="6" y="6" width="52" height="52" rx="14" fill="#F0F3FA" className="dark:fill-[#1e293b]" />
        <path
          d="M19 43C23.5 33.5 28 28.2 32 21C36 28.2 40.5 33.5 45 43"
          stroke="#395886"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-[#D5DEEF]"
        />
        <path
          d="M24 43L32 29L40 43"
          stroke="#638ECB"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-[#94A3B8]"
        />
      </svg>

      <div className="leading-none">
        <div className="text-[15px] font-extrabold tracking-[0.2px] text-[#395886] dark:text-[#D5DEEF]">CARFORAR</div>
      </div>
    </div>
  );
}
