"use client";

export function NextActionSelector({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
              isActive
                ? "border-primary bg-accent text-foreground"
                : "border-border bg-white text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
