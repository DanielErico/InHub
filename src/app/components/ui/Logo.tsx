import React from "react";

export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <img 
      src="/assets/logo.png" 
      alt="InHub Logo" 
      className={`${className} object-contain`}
    />
  );
}
