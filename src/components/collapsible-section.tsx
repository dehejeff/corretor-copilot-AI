"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
  summary,
  className = "",
  contentClassName = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  summary?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          {summary ? <div className="mt-3">{summary}</div> : null}
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-low text-muted-foreground">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {isOpen ? <div className={contentClassName || "mt-4"}>{children}</div> : null}
    </section>
  );
}
