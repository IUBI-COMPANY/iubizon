const sixDigitsRegex = /(\d{6})/;

export function normalizeOrderCode(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^\d{6}$/.test(value)) return value;
  const match = value.match(sixDigitsRegex);
  return match ? match[1] : null;
}

export function generateOrderCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
