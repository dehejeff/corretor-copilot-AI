import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "hot" | "warm" | "cold" | "success" | "danger";
};

export function Badge({ className, tone = "neutral", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "hot" && "bg-rose-100 text-rose-700",
        tone === "warm" && "bg-amber-100 text-amber-700",
        tone === "cold" && "bg-sky-100 text-sky-700",
        tone === "success" && "bg-emerald-100 text-emerald-700",
        tone === "danger" && "bg-red-100 text-red-700",
        className,
      )}
      {...props}
    />
  );
}
