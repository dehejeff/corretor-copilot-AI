"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ObjectionResponseCard({
  title,
  response,
  selected,
  onSelect,
}: {
  title: string;
  response: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[1.4rem] border p-4 text-left ${
        selected ? "border-primary bg-accent/50" : "border-border bg-white hover:bg-muted/25"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{title}</p>
        <Badge tone={selected ? "success" : "neutral"}>
          {selected ? "Selecionada" : "Objeção"}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{response}</p>
      <div className="mt-4">
        <Button type="button" variant={selected ? "primary" : "secondary"}>
          {selected ? "Objeção ativa" : "Usar resposta"}
        </Button>
      </div>
    </button>
  );
}
