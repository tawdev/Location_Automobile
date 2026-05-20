"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames, type Locale } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { DayButtonProps } from "react-day-picker";



export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  locale?: Partial<Locale>;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks
      className={cn("p-2", className)}
      classNames={{
        root: cn(defaultClassNames.root),
        months: cn(defaultClassNames.months),
        month: cn(defaultClassNames.month),
        nav: cn(defaultClassNames.nav),
        button_previous: cn(defaultClassNames.button_previous),
        button_next: cn(defaultClassNames.button_next),
        day: cn(defaultClassNames.day),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeftIcon className="h-4 w-4" />;
          return <ChevronRightIcon className="h-4 w-4" />;
        },

        DayButton: (props) => {
          const isReserved = props.modifiers.reserved;
          return (
            <div className="relative w-full h-full">
              <CalendarDayButton locale={locale} {...props} />
              {isReserved && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-red-600 font-bold text-xl leading-none">X</span>
                </div>
              )}
            </div>
          );
        },

        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  day,
  className,
  modifiers,
  locale,
  ...props
}: DayButtonProps & { locale?: Partial<Locale> }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-selected={modifiers.selected}
      className={cn("w-full h-full", className)}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  );
}