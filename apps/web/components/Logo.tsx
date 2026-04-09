"use client";

import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4.5"
        y="15.5"
        width="39"
        height="17"
        rx="8.5"
        stroke="currentColor"
        strokeWidth="5"
      />
    </svg>
  );
}
