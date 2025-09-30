
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="https://media.licdn.com/dms/image/v2/D4E22AQEXMHD3ACkTnA/feedshare-shrink_800/B4EZSpdDmmHgAg-/0/1738009754679?e=2147483647&v=beta&t=HdGBA5TkvQO4bsgiAOyXZ3Lv-f5hRr_bHD3t8nzBfY0"
      alt="SOPTIMA Logo"
      className={cn("h-6 w-auto", className)}
    />
  );
}
