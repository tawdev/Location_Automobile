"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 115;
const HOUR_R = 88;
const MINUTE_R = 96;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function hourAngle(hour12: number) {
  return (hour12 % 12) * 30;
}

function minuteAngle(minute: number) {
  return minute * 6;
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
    let hour24 = h === 12 ? (ap === "AM" ? 0 : 12) : ap === "PM" ? h + 12 : h;
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

  const handAngle = mode === "hour" ? hourAngle(selHour) : minuteAngle(selMinute);
  const handLength = mode === "hour" ? HOUR_R - 10 : MINUTE_R - 8;

  return (
    <div className="select-none">
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          {/* Outer ring */}
          <circle
            cx={CX} cy={CY} r={OUTER_R}
            fill="none"
            stroke="currentColor"
            className="text-[#D5DEEF] dark:text-[#1e293b]"
            strokeWidth="1.5"
          />

          {/* Tick marks for all 12 positions */}
          {HOURS.map((h) => {
            const a = hourAngle(h);
            const outer = polarToCartesian(CX, CY, OUTER_R - 2, a);
            const inner = polarToCartesian(CX, CY, OUTER_R - 12, a);
            return (
              <line
                key={`tick-${h}`}
                x1={outer.x} y1={outer.y}
                x2={inner.x} y2={inner.y}
                stroke="currentColor"
                className="text-[#395886] dark:text-[#94A3B8]"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Minute dots */}
          {mode === "minute" &&
            MINUTES.map((m) => {
              const a = minuteAngle(m);
              const pos = polarToCartesian(CX, CY, MINUTE_R, a);
              const isSelected = m === selMinute;
              return (
                <circle
                  key={`min-${m}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 10 : 4}
                  fill={isSelected ? "#16386b" : "currentColor"}
                  className={isSelected ? "" : "text-[#94A3B8] dark:text-[#475569]"}
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                  onClick={() => handleMinuteClick(m)}
                />
              );
            })}

          {/* Hour numbers */}
          {mode === "hour" &&
            HOURS.map((h) => {
              const a = hourAngle(h);
              const pos = polarToCartesian(CX, CY, HOUR_R, a);
              const isSelected = h === selHour;
              return (
                <g
                  key={`hour-${h}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleHourClick(h)}
                >
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={18}
                      fill="#16386b"
                      className="dark:fill-[#2b4c7e]"
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isSelected ? "white" : "#395886"}
                    className="dark:fill-[#D5DEEF]"
                    fontSize="15"
                    fontWeight="700"
                    style={{ pointerEvents: "none" }}
                  >
                    {h}
                  </text>
                </g>
              );
            })}

          {/* Clock hand */}
          <g style={{ transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <line
              x1={CX}
              y1={CY}
              x2={CX + handLength * Math.cos(((handAngle - 90) * Math.PI) / 180)}
              y2={CY + handLength * Math.sin(((handAngle - 90) * Math.PI) / 180)}
              stroke="#16386b"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="dark:stroke-[#2b4c7e]"
            />
            <circle cx={CX} cy={CY} r={5} fill="#16386b" className="dark:fill-[#2b4c7e]" />
          </g>
        </svg>

        {/* Center display */}
        <div
          className="absolute flex items-center gap-0.5 cursor-pointer select-none"
          style={{
            left: CX - 24,
            top: CY + 58,
          }}
          onClick={toggleAmPm}
        >
          <span
            className={`text-[13px] font-extrabold transition-colors ${
              selAmPm === "AM"
                ? "text-[#16386b] dark:text-white"
                : "text-[#94A3B8] dark:text-[#475569]"
            }`}
          >
            AM
          </span>
          <span className="text-[13px] font-extrabold text-[#D5DEEF] dark:text-[#1e293b]">/</span>
          <span
            className={`text-[13px] font-extrabold transition-colors ${
              selAmPm === "PM"
                ? "text-[#16386b] dark:text-white"
                : "text-[#94A3B8] dark:text-[#475569]"
            }`}
          >
            PM
          </span>
        </div>
      </div>

      {/* Selected time display */}
      <div className="text-center mt-2">
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
