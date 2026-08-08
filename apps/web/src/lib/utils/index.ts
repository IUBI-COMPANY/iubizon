import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// ═══════════════════════════════════════════════════════════════════════
// ZONA HORARIA Y LOCALE — Configurable por variable de entorno
// Para operar en otro país, cambiar NEXT_PUBLIC_TZ en .env
// ═══════════════════════════════════════════════════════════════════════

const APP_TZ = process.env.NEXT_PUBLIC_TZ || "America/Lima";
const APP_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "es-PE";

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return isNaN(d.getTime()) ? null : d;
};

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES GENERALES
// ═══════════════════════════════════════════════════════════════════════

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: "PEN",
  }).format(price);
};

/** Formatea fecha a texto legible: "6 de agosto de 2026" */
export const formatDate = (date: string | Date | null | undefined): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "d 'de' MMMM 'de' yyyy", { locale: es });
};

/** Formatea fecha corta: "06/08/2026" */
export const formatShortDate = (
  date: string | Date | null | undefined,
): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "dd/MM/yyyy");
};

/** Formatea fecha y hora completa: "6 de agosto de 2026, 14:30" */
export const formatDateTime = (
  date: string | Date | null | undefined,
): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "d 'de' MMMM 'de' yyyy, HH:mm", {
    locale: es,
  });
};

/** Formatea hora: "14:30" */
export const formatTime = (date: string | Date | null | undefined): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "HH:mm");
};

/** Formatea fecha corta con mes abreviado: "06 ago 2026" */
export const formatShortMonthDate = (
  date: string | Date | null | undefined,
): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "dd MMM yyyy", { locale: es });
};

/** Formatea fecha y hora con mes abreviado: "06 ago 2026, 2:30 PM" */
export const formatShortMonthDateTime = (
  date: string | Date | null | undefined,
): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatInTimeZone(d, APP_TZ, "dd MMM yyyy, h:mm a", { locale: es });
};

/** Tiempo relativo: "hace 5 minutos", "hace 2 horas", "hace 3 días" */
export const formatRelativeTime = (
  date: string | Date | null | undefined,
): string => {
  const d = toDate(date);
  if (!d) return "-";
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
