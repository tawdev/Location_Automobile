import React from "react";

type FeatureItemProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function FeatureItem({ title, description, icon }: FeatureItemProps) {
  return (
    <div className="flex flex-col items-center gap-[6px] w-[120px] text-center">
      <div className="w-[46px] h-[46px] rounded-[10px] bg-[#F0F3FA]/75 backdrop-blur-sm border border-[#D5DEEF]/95 flex items-center justify-center">
        <div className="text-[#638ECB]">{icon}</div>
      </div>
      <div className="text-[13px] font-extrabold text-[#F0F3FA] drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">{title}</div>
      <div className="text-[11px] leading-[1.1] text-[#D5DEEF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.22)]">{description}</div>
    </div>
  );
}

export function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 20 6v7c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 12.2 11 14.5l4.6-5"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DriverIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 12a4.2 4.2 0 1 0-0.01 0Z"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.7 21c1.5-4.2 4.4-6 7.3-6s5.8 1.8 7.3 6"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 12a8 8 0 0 1 16 0"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18h6"
        stroke="#638ECB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
