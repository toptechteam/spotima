
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="assets/soptimalogo.jpeg"
      alt="SOPTIMA Logo"
      className={cn("h-6 w-auto", className)}
    />
  );
}
