"use client";

import { useState, useRef, useEffect } from "react";

function scrollToIndex(container: HTMLDivElement, index: number, smooth = true) {
  const item = container.children[index] as HTMLElement | undefined;
  if (item) {
    container.scrollTo({
      top: item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2,
      behavior: smooth ? "smooth" : "instant",
    });
  }
}

function ScrollColumn({
  items,
  selected,
  onSelect,
  label,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idx = items.indexOf(selected);

  useEffect(() => {
    if (ref.current && idx >= 0) {
      setTimeout(() => scrollToIndex(ref.current!, idx, false), 0);
    }
  }, []);

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const center = el.scrollTop + el.clientHeight / 2;
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetTop + child.clientHeight / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    if (items[closest] && items[closest] !== selected) onSelect(items[closest]);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#64748b]">{label}</span>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="w-[72px] h-[180px] overflow-y-auto snap-y snap-mandatory scroll-smooth rounded-xl bg-gray-100 dark:bg-[#1e293b]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`[data-scroll-col]::-webkit-scrollbar{display:none}`}</style>
        <div data-scroll-col>
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full h-[40px] flex items-center justify-center text-[16px] font-bold rounded-lg snap-center transition-all duration-150 ${
                item === selected
                  ? "bg-[#16386b] dark:bg-[#2b4c7e] text-white scale-110 shadow-md"
                  : "text-gray-500 dark:text-[#94A3B8] hover:bg-gray-200 dark:hover:bg-[#334155]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ScrollTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [parsedH, parsedM] = value ? value.split(":") : ["10", "00"];
  const [selHour, setSelHour] = useState(parsedH);
  const [selMin, setSelMin] = useState(parsedM);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

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

  useEffect(() => {
    const [h, m] = value ? value.split(":") : ["10", "00"];
    setSelHour(h);
    setSelMin(m);
  }, [value]);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition(rect.top < window.innerHeight / 2 ? "bottom" : "top");
    }
    setOpen(!open);
  }

  function commit(h: string, m: string) {
    onChange(`${h}:${m}`);
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
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
          style={position === "top" ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }}
        >
          <div className="p-3 pb-2">
            <div className="text-center mb-2">
              <span className="text-[28px] font-extrabold text-[#16386b] dark:text-white tracking-tight">
                {selHour}:{selMin}
              </span>
            </div>
            <div className="flex gap-2 justify-center">
              <ScrollColumn
                items={hours}
                selected={selHour}
                onSelect={(h) => { setSelHour(h); commit(h, selMin); }}
                label="H"
              />
              <span className="text-[24px] font-extrabold text-[#16386b] dark:text-white self-center mt-5">:</span>
              <ScrollColumn
                items={minutes}
                selected={selMin}
                onSelect={(m) => { setSelMin(m); commit(selHour, m); }}
                label="M"
              />
            </div>
          </div>
          <div className="flex justify-end px-4 pb-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-1.5 rounded-full bg-[#16386b] text-white text-[13px] font-bold hover:bg-[#2b4c7e] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
