/**
 * Convierte stock numérico a etiqueta legible estilo Falabella/Mercado Libre.
 * Los vendedores siguen viendo el número exacto en su dashboard.
 */
export function stockLabel(stock: number | null | undefined): {
  label: string;
  color: string;
  urgent: boolean;
} {
  const s = typeof stock === "number" ? stock : 0;

  if (s <= 0) {
    return { label: "Agotado", color: "#ef4444", urgent: true };
  }
  if (s === 1) {
    return { label: "¡Última unidad!", color: "#f59e0b", urgent: true };
  }
  if (s <= 5) {
    return { label: "Pocas unidades", color: "#f59e0b", urgent: false };
  }
  return { label: "Disponible", color: "#10b981", urgent: false };
}
