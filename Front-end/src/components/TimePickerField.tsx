"use client";

import { useState, useRef, useEffect } from "react";
import ClockPicker from "@/components/ui/clock-picker";

export default function TimePickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-[120px] h-[62px] rounded-[18px] border border-[#d9dee6] dark:border-[#1e293b] px-3 text-[15px] outline-none transition bg-white dark:bg-[#0f1729] dark:text-[#D5DEEF] flex items-center justify-center gap-1.5 font-bold cursor-pointer hover:border-[#16386b] focus:border-[#16386b]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {value}
      </button>

      {open && (
        <div
          className="absolute right-0 z-[300] bg-white dark:bg-[#0f1729] rounded-2xl border border-[#D5DEEF] dark:border-[#1e293b] shadow-xl"
          style={{ bottom: "calc(100% + 8px)" }}
        >
          <div className="p-4">
            <ClockPicker value={value} onChange={(v) => { onChange(v); setOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}
