import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Nao informado";
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

export function buildWhatsappUrl(phone?: string | null, message?: string | null) {
  const normalized = normalizePhone(phone);
  const text = encodeURIComponent(message ?? "");

  if (!normalized) return "#";

  return `https://wa.me/55${normalized}?text=${text}`;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}
