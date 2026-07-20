"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames, type Locale, type DayButtonProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function CalendarDayButton({ size, ...props }: DayButtonProps & { size?: "default" | "lg" }) {
  const { day, modifiers, ...buttonProps } = props;
  const isLg = size === "lg";

  return (
    <Button
      variant={modifiers.selected ? "default" : "ghost"}
      className={cn(
        isLg ? "h-12 w-12 text-base font-semibold" : "h-9 w-9 p-0 font-normal",
        "aria-selected:opacity-100",
        modifiers.today && "bg-accent text-accent-foreground font-bold",
      )}
      {...buttonProps}
    />
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  size = "default",
  ...props
}: {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  size?: "default" | "lg";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const defaultClassNames = getDefaultClassNames();
  const isLg = size === "lg";

  return (
    <>
      <style>{`
.rdp-root {
  --rdp-accent-color: #16386b;
  --rdp-accent-background-color: #eef3fa;
  font-family: inherit;
}
.rdp-months {
  display: flex;
  justify-content: center;
}
.rdp-month {
  background: white;
  border-radius: 12px;
  width: 100%;
}
.rdp-month_grid {
  width: 100%;
  border-collapse: collapse;
}
.rdp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
}
.rdp-nav button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e9f0;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.rdp-nav button:hover {
  background: #f0f3fa;
  border-color: #16386b;
}
.rdp-chevron {
  width: 16px;
  height: 16px;
  color: #16386b;
}
.rdp-month_caption {
  font-size: 14px;
  font-weight: 700;
  color: #16386b;
  text-align: center;
  padding: 0;
}
.rdp-weekday {
  font-size: 11px;
  font-weight: 700;
  color: #8a9bb5;
  text-transform: uppercase;
  padding: 4px 0;
  text-align: center;
}
.rdp-day {
  width: 36px;
  height: 36px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #1a2a4a;
  border-radius: 8px;
  transition: all 0.12s;
  cursor: pointer;
}
.rdp-day:hover:not(.rdp-disabled) {
  background: #eef3fa;
  color: #16386b;
}
.rdp-day_button {
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rdp-day_button:focus-visible {
  outline: 2px solid #16386b;
  outline-offset: 2px;
  border-radius: 8px;
}
.rdp-today .rdp-day_button {
  font-weight: 800;
  color: #16386b;
  background: #eef3fa;
  border-radius: 8px;
}
.rdp-selected .rdp-day_button {
  background: #16386b;
  color: white;
  font-weight: 700;
  border-radius: 8px;
}
.rdp-outside {
  opacity: 0.2;
  pointer-events: none;
}

/* Large size variant */
.rdp-lg .rdp-month_caption {
  font-size: 16px;
}
.rdp-lg .rdp-weekday {
  font-size: 13px;
  padding: 8px 0;
}
.rdp-lg .rdp-nav button {
  width: 38px;
  height: 38px;
}
.rdp-lg .rdp-chevron {
  width: 20px;
  height: 20px;
}
.rdp-lg .rdp-day {
  width: 48px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
.rdp-lg .rdp-selected .rdp-day_button {
  background: linear-gradient(135deg, #16386b, #395886);
  box-shadow: 0 4px 12px rgba(57, 88, 134, 0.3);
  font-size: 17px;
}
.rdp-lg .rdp-today .rdp-day_button {
  font-size: 17px;
}

/* Pickup calendar: past dates disabled with red X overlay */
.pickup-calendar .rdp-disabled {
  position: relative;
  pointer-events: none !important;
  cursor: not-allowed !important;
}
.pickup-calendar .rdp-disabled:hover {
  background: transparent !important;
}
.pickup-calendar .rdp-disabled .rdp-day_button {
  opacity: 0.45;
  cursor: not-allowed !important;
}
.pickup-calendar .rdp-disabled .rdp-day_button > * {
  position: relative;
  z-index: 1;
}
.pickup-calendar .rdp-disabled::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  background:
    linear-gradient(45deg,
      transparent 46%,
      #ef4444 46%,
      #ef4444 54%,
      transparent 54%),
    linear-gradient(-45deg,
      transparent 46%,
      #ef4444 46%,
      #ef4444 54%,
      transparent 54%);
  z-index: 2;
}
.pickup-calendar.rdp-lg .rdp-disabled::after {
  width: 24px;
  height: 24px;
}
`}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        fixedWeeks
        className={`p-1 ${isLg ? "rdp-lg" : ""} ${className ?? ""}`}
        classNames={{
          ...defaultClassNames,
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) => {
            if (orientation === "left") return <ChevronLeftIcon className="rdp-chevron" />;
            return <ChevronRightIcon className="rdp-chevron" />;
          },
          DayButton: (props) => <CalendarDayButton size={size} {...props} />,
        }}
        {...props}
      />
    </>
  );
}
