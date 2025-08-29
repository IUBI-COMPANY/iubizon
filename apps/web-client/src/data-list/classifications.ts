import { Classification } from "@/data-list/products";

interface DetailClassification {
  name: string;
  description: string;
}

export const classifications: Record<Classification, DetailClassification> = {
  premium: {
    name: "Proyectores Premium",
    description:
      "Proyectores en excelente estado físico y 100% funcionales. Alto brillo, colores nítidos y estética casi impecable. Ideales para clientes exigentes o uso profesional.",
  },
  standard: {
    name: "Proyectores Estándar",
    description:
      "Proyectores en buen estado funcional y físico aceptable. Pueden tener ligeros detalles estéticos, pero ofrecen un rendimiento confiable para uso frecuente.",
  },
  budget: {
    name: "Proyectores Económicos",
    description:
      "Proyectores económicos, con funcionamiento correcto pero con más detalle físico o limitaciones de brillo. Opción accesible para quienes buscan bajo costo.",
  },
  clearance: {
    name: "Proyectores en Remate",
    description:
      "Proyectores en liquidación. Funcionales pero con detalles de manchas o detalles menores estéticos, vendidos a precios reducidos sin garantía extendida.",
  },
  wholesale: {
    name: "Venta por lotes",
    description:
      "Lotes de proyectores destinados a distribuidores o compradores al por mayor. Precios especiales por volumen, ideal para reventa.",
  },
};
