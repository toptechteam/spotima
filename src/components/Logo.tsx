
import React from "react";
import { cn } from "@/lib/utils";
import homelogo from '@/assets/homelogo.jpeg';
interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
    src={homelogo}
      alt="SOPTIMA Logo"
      className={cn("h-6 w-auto", className)}
    />
  );
}
