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

export function buildFallbackOrderCode(input: {
  id: string;
  createdAt: Date | null;
}): string {
  const seed = `${input.id}|${input.createdAt?.toISOString() || ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return String(100000 + (Math.abs(hash) % 900000));
}

export function getOrderSessionCode(input: {
  id: string;
  paymentId: string | null;
  createdAt: Date | null;
}): string {
  return (
    normalizeOrderCode(input.paymentId) ||
    buildFallbackOrderCode({ id: input.id, createdAt: input.createdAt })
  );
}
