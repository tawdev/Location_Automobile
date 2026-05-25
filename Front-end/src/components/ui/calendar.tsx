"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames, type Locale } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  locale?: Partial<Locale>;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <>
      <style>{`[data-disabled="true"]{position:relative!important}[data-disabled="true"] button{opacity:.35;pointer-events:none}[data-disabled="true"]::after{content:"✕";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#dc2626;pointer-events:none;z-index:20;line-height:1}`}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        fixedWeeks
        className={`p-2 ${className ?? ""}`}
        classNames={{
          ...defaultClassNames,
          day_button: "text-[15px] font-semibold",
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) => {
            if (orientation === "left") return <ChevronLeftIcon className="h-4 w-4" />;
            return <ChevronRightIcon className="h-4 w-4" />;
          },
        }}
        {...props}
      />
    </>
  );
}
