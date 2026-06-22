"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function polarToCss(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    left: cx + r * Math.cos(rad),
    top: cy + r * Math.sin(rad),
  };
}

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

  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [selHour, setSelHour] = useState(hour12);
  const [selMinute, setSelMinute] = useState(parsedMin);
  const [selAmPm, setSelAmPm] = useState<"AM" | "PM">(ampm);

  function commitTime(h: number, m: number, ap: "AM" | "PM") {
    const hour24 = h === 12 ? (ap === "AM" ? 0 : 12) : ap === "PM" ? h + 12 : h;
    onChange(`${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  function handleHourClick(h: number) {
    setSelHour(h);
    setMode("minute");
  }

  function handleMinuteClick(m: number) {
    setSelMinute(m);
    commitTime(selHour, m, selAmPm);
    setMode("hour");
  }

  function toggleAmPm() {
    const next = selAmPm === "AM" ? "PM" : "AM";
    setSelAmPm(next);
    commitTime(selHour, selMinute, next);
  }

  const CX = 130;
  const CY = 120;
  const ringR = 82;
  const btnR = 22;

  return (
    <div className="select-none flex flex-col items-center gap-3">
      {/* Clock face */}
      <div
        className="relative"
        style={{ width: 260, height: 240 }}
      >
        {/* Outer ring decoration */}
        <div
          className="absolute rounded-full border pointer-events-none"
          style={{
            left: CX - ringR - 8,
            top: CY - ringR - 8,
            width: (ringR + 8) * 2,
            height: (ringR + 8) * 2,
            borderColor: "#D5DEEF",
          }}
        />

        {/* Center dot */}
        <div
          className="absolute rounded-full bg-[#16386b] dark:bg-[#2b4c7e] pointer-events-none"
          style={{ left: CX - 4, top: CY - 4, width: 8, height: 8 }}
        />

        {/* Hand */}
        <div
          className="absolute origin-bottom pointer-events-none"
          style={{
            left: CX - 2,
            top: CY,
            width: 4,
            height: mode === "hour" ? ringR - 6 : ringR + 4,
            backgroundColor: "#16386b",
            borderRadius: 2,
            transform: `rotate(${mode === "hour" ? (selHour % 12) * 30 : selMinute * 6}deg)`,
            transformOrigin: "center top",
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* Mode: Hours */}
        {mode === "hour" &&
          HOURS.map((h) => {
            const pos = polarToCss(CX, CY, ringR, (h % 12) * 30);
            const active = h === selHour;
            return (
              <button
                key={`h-${h}`}
                type="button"
                onClick={() => handleHourClick(h)}
                style={{
                  position: "absolute",
                  left: pos.left - btnR,
                  top: pos.top - btnR,
                  width: btnR * 2,
                  height: btnR * 2,
                }}
                className={`rounded-full text-[15px] font-bold transition-all flex items-center justify-center ${
                  active
                    ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-md scale-110"
                    : "bg-transparent text-[#395886] dark:text-[#D5DEEF] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]"
                }`}
              >
                {h}
              </button>
            );
          })}

        {/* Mode: Minutes */}
        {mode === "minute" &&
          MINUTES.map((m) => {
            const pos = polarToCss(CX, CY, ringR + 6, m * 6);
            const active = m === selMinute;
            return (
              <button
                key={`m-${m}`}
                type="button"
                onClick={() => handleMinuteClick(m)}
                style={{
                  position: "absolute",
                  left: pos.left - (active ? 18 : 14),
                  top: pos.top - (active ? 18 : 14),
                  width: (active ? 18 : 14) * 2,
                  height: (active ? 18 : 14) * 2,
                }}
                className={`rounded-full text-[12px] font-bold transition-all flex items-center justify-center ${
                  active
                    ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white shadow-md scale-110"
                    : "bg-[#E8EDF5] dark:bg-[#1e293b] text-[#395886] dark:text-[#94A3B8] hover:bg-[#D5DEEF] dark:hover:bg-[#334155]"
                }`}
              >
                {String(m).padStart(2, "0")}
              </button>
            );
          })}
      </div>

      {/* AM/PM toggle */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (selAmPm !== "AM") toggleAmPm();
          }}
          className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold transition-all ${
            selAmPm === "AM"
              ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white"
              : "text-[#94A3B8] dark:text-[#475569] hover:text-[#395886]"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => {
            if (selAmPm !== "PM") toggleAmPm();
          }}
          className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold transition-all ${
            selAmPm === "PM"
              ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white"
              : "text-[#94A3B8] dark:text-[#475569] hover:text-[#395886]"
          }`}
        >
          PM
        </button>
      </div>

      {/* Selected time display */}
      <div className="text-center">
        <span className="text-[22px] font-extrabold text-[#16386b] dark:text-white">
          {String(selHour).padStart(2, "0")}:{String(selMinute).padStart(2, "0")}
        </span>
        <span className="text-[16px] font-bold text-[#16386b] dark:text-white ml-1">
          {selAmPm}
        </span>
      </div>
    </div>
  );
}
