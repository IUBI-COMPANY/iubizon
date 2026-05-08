import { ProductCondition } from "@/data-list/products";

export interface DetailProductCondition {
  name: string;
  description: string;
}

export const productsCondition: Record<
  ProductCondition,
  DetailProductCondition
> = {
  "gama-alta": {
    name: "Empresas / Instituciones",
    description:
      "Equipos exclusivos para empresas e instituciones que buscan la mejor calidad y rendimiento. Estos productos cuentan con características avanzadas, soporte técnico especializado y opciones de personalización para satisfacer las necesidades específicas del entorno corporativo.",
  },
  new: {
    name: "Premium",
    description:
      "Equipos con la mejor calidad y garantía completa. Ofrecen el máximo rendimiento, tecnología de última generación y durabilidad garantizada. Ideales para quienes buscan la mejor calidad y tranquilidad de una inversión a largo plazo.",
  },
  reconditioned: {
    name: "Otros productos",
    description:
      "Equipos probados y verificados en excelente estado de funcionamiento. Pueden presentar ligeros detalles estéticos, pero ofrecen un rendimiento excepcional a un precio mucho más accesible. Listos para usar con funcionamiento garantizado.",
  },
};
