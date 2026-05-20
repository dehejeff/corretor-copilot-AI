"use client";

import { ChevronRight } from "lucide-react";

export function CallStepCard({
  index,
  title,
  objective,
  active,
  completed,
  onClick,
}: {
  index: number;
  title: string;
  objective: string;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.4rem] border p-4 text-left ${
        active
          ? "border-primary bg-accent/50"
          : completed
            ? "border-emerald-200 bg-emerald-50"
            : "border-border bg-white hover:bg-muted/25"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{`Step ${index}`}</p>
          <p className="mt-2 text-base font-semibold">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{objective}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}
