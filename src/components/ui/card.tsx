import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface-card rounded-[1.5rem] border border-border/90 bg-card p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}
