"use client";

import { useState, useRef } from "react";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const CX = 120;
const CY = 120;
const R = 105;
const S = 240;

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

  const svgRef = useRef<SVGSVGElement>(null);

  function commitTime(h: number, m: number, ap: "AM" | "PM") {
    const hour24 = h === 12 ? (ap === "AM" ? 0 : 12) : ap === "PM" ? h + 12 : h;
    onChange(`${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  function handleClockClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - CX;
    const y = e.clientY - rect.top - CY;
    const dist = Math.sqrt(x * x + y * y);
    let angle = Math.atan2(x, -y) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    if (dist < R * 0.42) {
      const h = Math.round(angle / 30) % 12;
      setSelHour(h || 12);
      commitTime(h || 12, selMinute, selAmPm);
    } else {
      const m = Math.round(angle / 6) % 60;
      const snapped = Math.round(m / 5) * 5;
      setSelMinute(snapped);
      commitTime(selHour, snapped, selAmPm);
    }
  }

  function toggleAmPm() {
    const next = selAmPm === "AM" ? "PM" : "AM";
    setSelAmPm(next);
    commitTime(selHour, selMinute, next);
  }

  const hourAngle = (selHour % 12) * 30 + selMinute * 0.5;
  const minuteAngle = selMinute * 6;

  return (
    <div className="select-none flex flex-col items-center gap-4 w-[260px] py-2">
      {/* Digital display */}
      <div className="text-center">
        <span className="text-[36px] font-extrabold text-[#16386b] dark:text-white tracking-tight">
          {String(selHour).padStart(2, "0")}:
          {String(selMinute).padStart(2, "0")}
        </span>
        <span className="text-[18px] font-bold text-[#16386b] dark:text-white ml-1.5 tracking-wider">
          {selAmPm}
        </span>
      </div>

      {/* Analog clock */}
      <svg
        ref={svgRef}
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        className="cursor-pointer"
        onClick={handleClockClick}
      >
        {/* Clock face background */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="white"
          stroke="#D5DEEF"
          strokeWidth="1.5"
          className="dark:fill-[#1e293b] dark:stroke-[#334155]"
        />

        {/* Minute/5-minute ticks */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * (Math.PI / 180);
          const len = i % 5 === 0 ? 14 : 7;
          const inner = R - len;
          return (
            <line
              key={i}
              x1={CX + inner * Math.cos(a)}
              y1={CY + inner * Math.sin(a)}
              x2={CX + R * Math.cos(a)}
              y2={CY + R * Math.sin(a)}
              stroke={i % 5 === 0 ? "#16386b" : "#94A3B8"}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              strokeLinecap="round"
              className="dark:stroke-[#D5DEEF]/60"
            />
          );
        })}

        {/* Hour numbers */}
        {HOURS.map((h) => {
          const a = (h * 30 - 90) * (Math.PI / 180);
          const r = R - 28;
          return (
            <text
              key={h}
              x={CX + r * Math.cos(a)}
              y={CY + r * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-[15px] font-extrabold ${
                selHour === h
                  ? "fill-[#16386b] dark:fill-white"
                  : "fill-[#395886] dark:fill-[#D5DEEF]"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              {h}
            </text>
          );
        })}

        {/* Inner/outer divider ring (subtle) */}
        <circle
          cx={CX}
          cy={CY}
          r={R * 0.42}
          fill="none"
          stroke="#D5DEEF"
          strokeWidth="0.5"
          strokeDasharray="4,4"
          className="dark:stroke-[#334155]"
        />

        {/* Hour hand */}
        <line
          x1={CX}
          y1={CY}
          x2={CX + 38 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={CY - 38 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="#16386b"
          strokeWidth="4.5"
          strokeLinecap="round"
          className="dark:stroke-white"
          style={{ transition: "all 0.25s ease" }}
        />

        {/* Minute hand */}
        <line
          x1={CX}
          y1={CY}
          x2={CX + 62 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={CY - 62 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="#16386b"
          strokeWidth="3"
          strokeLinecap="round"
          className="dark:stroke-white"
          style={{ transition: "all 0.25s ease" }}
        />

        {/* Center cap */}
        <circle cx={CX} cy={CY} r={5} fill="#16386b" className="dark:fill-white" />
      </svg>

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
    </div>
  );
}
