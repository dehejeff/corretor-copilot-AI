import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/80 bg-card p-5 shadow-[var(--shadow)]",
        className,
      )}
      {...props}
    />
  );
}
