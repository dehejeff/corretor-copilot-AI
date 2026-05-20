"use client";

import { Copy, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallScriptCard({
  title,
  text,
  onUse,
}: {
  title: string;
  text: string;
  onUse?: () => void;
}) {
  const copyText = async () => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-[1.4rem] border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-accent p-2 text-primary">
            <MessageSquareQuote className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <Button type="button" variant="ghost" className="px-2 py-2" onClick={copyText}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
      {onUse ? (
        <Button type="button" variant="secondary" className="mt-4" onClick={onUse}>
          Usar este texto
        </Button>
      ) : null}
    </div>
  );
}
