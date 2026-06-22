"use client";

import { useState, useRef, useEffect } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const ALL_MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export default function ClockPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const [parsedHour, parsedMin] = value
    ? value.split(":").map(Number)
    : [10, 0];
  const ampm = parsedHour < 12 ? "AM" : "PM";
  const hour12 = parsedHour % 12 || 12;

  const [selHour, setSelHour] = useState(hour12);
  const [selMinute, setSelMinute] = useState(parsedMin);
  const [selAmPm, setSelAmPm] = useState<"AM" | "PM">(ampm);
  const [minuteInput, setMinuteInput] = useState(String(parsedMin).padStart(2, "0"));
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMinuteInput(String(selMinute).padStart(2, "0"));
  }, [selMinute]);

  function commitTime(h: number, m: number, ap: "AM" | "PM") {
    const hour24 = h === 12 ? (ap === "AM" ? 0 : 12) : ap === "PM" ? h + 12 : h;
    onChange(`${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  function handleHourClick(h: number) {
    setSelHour(h);
    commitTime(h, selMinute, selAmPm);
  }

  function handleMinuteClick(m: number) {
    setSelMinute(m);
    commitTime(selHour, m, selAmPm);
  }

  function handleMinuteInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMinuteInput(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= 59) {
      setSelMinute(num);
      commitTime(selHour, num, selAmPm);
    }
  }

  function handleMinuteInputBlur() {
    const num = parseInt(minuteInput, 10);
    if (isNaN(num) || num < 0 || num > 59) {
      setMinuteInput(String(selMinute).padStart(2, "0"));
    } else {
      setMinuteInput(String(num).padStart(2, "0"));
    }
  }

  function toggleAmPm() {
    const next = selAmPm === "AM" ? "PM" : "AM";
    setSelAmPm(next);
    commitTime(selHour, selMinute, next);
  }

  return (
    <div className="select-none flex flex-col items-center gap-5 w-[260px] py-2">
      {/* Selected time display */}
      <div className="text-center">
        <span className="text-[36px] font-extrabold text-[#16386b] dark:text-white tracking-tight">
          {String(selHour).padStart(2, "0")}:
          <input
            ref={minuteRef}
            value={minuteInput}
            onChange={handleMinuteInputChange}
            onBlur={handleMinuteInputBlur}
            className="w-[48px] bg-transparent outline-none text-center"
            maxLength={2}
            type="text"
            inputMode="numeric"
          />
        </span>
        <span className="text-[18px] font-bold text-[#16386b] dark:text-white ml-1.5 tracking-wider">
          {selAmPm}
        </span>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex items-center bg-[#F0F3FA] dark:bg-[#1e293b] rounded-full p-1">
        <button
          type="button"
          onClick={() => { if (selAmPm !== "AM") toggleAmPm(); }}
          className={`px-6 py-1.5 rounded-full text-[14px] font-extrabold transition-all duration-200 ${
            selAmPm === "AM"
              ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-sm"
              : "text-[#94A3B8] dark:text-[#64748B] hover:text-[#395886] dark:hover:text-[#D5DEEF]"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => { if (selAmPm !== "PM") toggleAmPm(); }}
          className={`px-6 py-1.5 rounded-full text-[14px] font-extrabold transition-all duration-200 ${
            selAmPm === "PM"
              ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-sm"
              : "text-[#94A3B8] dark:text-[#64748B] hover:text-[#395886] dark:hover:text-[#D5DEEF]"
          }`}
        >
          PM
        </button>
      </div>

      {/* Hours Grid */}
      <div className="w-full">
        <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">
          Heure
        </div>
        <div className="grid grid-cols-4 gap-2">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => handleHourClick(h)}
              className={`h-12 rounded-xl text-[17px] font-extrabold transition-all duration-200 ${
                selHour === h
                  ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-md scale-105"
                  : "bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886] dark:text-[#D5DEEF] hover:bg-[#D5DEEF] dark:hover:bg-[#334155]"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Minutes Grid */}
      <div className="w-full">
        <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">
          Minutes
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ALL_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMinuteClick(m)}
              className={`h-12 rounded-xl text-[17px] font-extrabold transition-all duration-200 ${
                selMinute === m
                  ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-md scale-105"
                  : "bg-[#F0F3FA] dark:bg-[#1e293b] text-[#395886] dark:text-[#D5DEEF] hover:bg-[#D5DEEF] dark:hover:bg-[#334155]"
              }`}
            >
              {String(m).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
