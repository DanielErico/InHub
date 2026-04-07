import React from "react";

export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <img 
      src="https://www.d-internconnect.com/assets/logo_blue-C1d-YjJ_.png" 
      alt="InHub Logo" 
      className={`${className} object-contain`}
    />
  );
}
