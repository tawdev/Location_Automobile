import React from "react";

export function Logo() {
  return (
    <div className="flex items-center select-none">
      <img
        src="/logo.png"
        alt="CARFORFAR logo"
        className="h-36 w-auto object-contain dark:hidden"
      />
      <img
        src="/logo-dark.png"
        alt="CARFORFAR logo"
        className="h-36 w-auto object-contain hidden dark:block"
      />
    </div>
  );
}
