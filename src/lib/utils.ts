import { clsx, type ClassValue } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatRelativeDate(value?: string | null) {
  if (!value) return "Nunca";

  return formatDistanceToNowStrict(new Date(value), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function formatPhone(phone?: string | null) {
  if (phone === null || phone === undefined || phone === "") {
    return "";
  }

  const digits = normalizePhone(phone);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

export function parseCurrencyInput(value?: string | null) {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  return Number(digits) / 100;
}

export function formatCurrencyInput(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue =
    typeof value === "number" ? value : parseCurrencyInput(String(value));

  if (numberValue === null || Number.isNaN(numberValue)) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

export function formatDate(value?: string | null) {
  if (!value) return "Não informado";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "dd/MM/yyyy");
}

export function buildWhatsappUrl(phone?: string | null, message?: string | null) {
  const normalized = normalizePhone(phone);
  const text = encodeURIComponent(message ?? "");

  if (!normalized) return "#";

  const withCountryCode = normalized.startsWith("55") ? normalized : `55${normalized}`;

  return `https://wa.me/${withCountryCode}?text=${text}`;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}
