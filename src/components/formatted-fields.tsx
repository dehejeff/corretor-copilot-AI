"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  formatCurrencyInput,
  formatPhone,
  normalizePhone,
  parseCurrencyInput,
} from "@/lib/utils";

export function PhoneInput({
  name,
  defaultValue,
  placeholder = "(21) 99999-9999",
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const [displayValue, setDisplayValue] = useState(() => formatPhone(defaultValue || ""));

  return (
    <>
      <input type="hidden" name={name} value={normalizePhone(displayValue)} />
      <Input
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => setDisplayValue(formatPhone(event.target.value))}
      />
    </>
  );
}

export function CurrencyInput({
  name,
  defaultValue,
  placeholder = "R$ 0,00",
  mode = "number",
}: {
  name: string;
  defaultValue?: number | string | null;
  placeholder?: string;
  mode?: "number" | "text";
}) {
  const initialDisplayValue = useMemo(() => formatCurrencyInput(defaultValue), [defaultValue]);
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);

  const hiddenValue =
    mode === "number"
      ? parseCurrencyInput(displayValue)?.toString() ?? ""
      : displayValue;

  return (
    <>
      <input type="hidden" name={name} value={hiddenValue} />
      <Input
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => setDisplayValue(formatCurrencyInput(event.target.value))}
      />
    </>
  );
}
