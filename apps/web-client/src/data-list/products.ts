import { orderBy } from "lodash";

export type Classification =
  | "premium"
  | "standard"
  | "budget"
  | "clearance"
  | "wholesale";

export type ProductCondition = "gama-alta" | "new" | "reconditioned";

export interface Product extends Price {
  id: string;
  model: string;
  name?: string;
  SN?: string;
  oldStock?: number;
  stock: number;
  description?: string;
  sub?: string;
  badge?: string;
  mainImage?: string;
  media: MediaItem[];
  condition: ProductCondition;
  displayTechnology?: string;
  lumensANSI?: number;
  brand?: string;
  type?: string;
  contrastRatio?: string;
  connectivity?: string;
  features?: string;
  nativeResolution?: string;
  aspectRatio?: string;
  throwRatio?: string;
  category?: string[];
  note?: string;
  campaign?: string;
  classification?: Classification;
  technicalSheetUrl?: string;
  gama?: "baja" | "media" | "alta" | "muy alta";
}

interface Price {
  oldPrice?: number;
  price: number;
  discount?: number;
  subTotal?: number;
  IGV?: number;
  totalPayment?: number;
}

export interface MediaItem {
  type: string;
  src: string;
}

const productsData: Product[] = [
  {
    id: "bundle-interactivo",
    model: "Bundle Complete 2025",
    name: "Bundle Interactivo - Completo",
    stock: 10,
    condition: "new",
    description:
      "Transforma cualquier proyector en una experiencia interactiva profesional",
    price: 5201.15,
    badge: "Bundle",
    mainImage: "/productos/bundle/upside109W.png",
    media: [
      { type: "image", src: "/productos/bundle/upside109W.png" },
      { type: "image", src: "/productos/bundle/touch.png" },
      { type: "image", src: "/productos/bundle/miracast.png" },
    ],
    displayTechnology: "3LCD",
    lumensANSI: 4000,
    brand: "Epson",
    type: "Bundle",
    connectivity: "HDMI, VGA, USB, WiFi",
    features:
      "Touch interactivo 10 puntos, Proyección hasta 120 pulgadas, Conectividad inalámbrica, Android integrado",
    nativeResolution: "WXGA (1280x800)",
    aspectRatio: "16:10",
    category: ["Tecnología", "Proyección", "Interactividad"],
    gama: "alta",
    note: `El Bundle Interactivo Completo incluye todo lo necesario para convertir tu espacio en un ambiente de trabajo moderno y colaborativo:

• Proyector Epson PowerLite 109W (4000 lúmenes)
• Touch Interactivo
• Adaptador Inalámbrico
• Instalación y configuración incluida
• Garantía extendida de 1 año
• Soporte técnico especializado

Ideal para:
- Salas de reuniones corporativas
- Aulas educativas interactivas
- Espacios de capacitación
- Presentaciones profesionales

Más que un kit interactivo, es una solución completa de productividad que moderniza tus espacios de trabajo y garantiza sesiones fluidas y profesionales.`,
  },
  {
    id: "accesorios-duo",
    model: "Touch y Adaptador Inalámbrico",
    name: "Duo interactivo",
    stock: 15,
    condition: "new",
    description: "Touch Interactivo + Adaptador Inalámbrico en un solo paquete",
    price: 4021.15,
    badge: "Dúo",
    mainImage: "/productos/bundle/touch.png",
    media: [
      { type: "image", src: "/productos/bundle/touch.png" },
      { type: "image", src: "/productos/bundle/miracast.png" },
    ],
    brand: "iubizon",
    type: "Accesorios",
    connectivity: "USB, WiFi, HDMI",
    features:
      "10 puntos táctiles, WiFi integrado, Android OS, Multi-usuario, Streaming inalámbrico",
    category: ["Tecnología", "Interactividad", "Conectividad", "Accesorios"],
    gama: "media",
    note: `El Dúo de Accesorios Interactivos es la combinación perfecta para transformar tu proyector existente en una solución moderna e inalámbrica.

📦 **Incluye:**

**1. Touch Interactivo**
• 10 puntos táctiles simultáneos
• Tecnología infrarroja de alta precisión
• Multi-usuario: Varias personas pueden interactuar al mismo tiempo
• Compatible con Windows, Mac, Android y Linux
• Instalación Plug & Play

**2. Adaptador Inalámbrico WiFi**
• Android integrado con Google Play Store
• Conectividad WiFi de alta velocidad
• Streaming inalámbrico desde cualquier dispositivo
• Elimina el uso de cables

💡 **Ventajas del Dúo:**
- Ahorra S/ 50 comprando el paquete completo
- Compatibilidad garantizada entre ambos dispositivos
- Configuración optimizada para trabajar juntos
- Ideal para modernizar proyectores existentes

🎯 **Perfecto para:**
- Oficinas que buscan eliminar cables y mejorar colaboración
- Instituciones educativas con proyectores instalados
- Salas de capacitación que necesitan interactividad
- Espacios de trabajo híbridos

Convierte tu proyector tradicional en una solución interactiva e inalámbrica completa.`,
  },
];

// ============================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================

export const IGV_RATE = 0.18;

export const DISCOUNT_RATES = {
  new: 0.17, // 17% para productos nuevos
  reconditioned: 0.42, // 42% para reacondicionados
  "gama-alta": 0, // Sin descuento para gama alta
} as const;

const PRODUCTS_WITHOUT_AUTO_DISCOUNT = ["Bundle", "Accesorios"] as const;

// ============================================
// FUNCIONES DE CÁLCULO DE PRECIOS
// ============================================

const calcProductPrices = (
  product: Product,
  percentageDiscount: number = 0,
): Price => {
  const originalPrice = product.price;

  // Sin descuento: cálculo directo
  if (percentageDiscount === 0) {
    const totalPayment = originalPrice;
    const subTotal = +(totalPayment / (1 + IGV_RATE)).toFixed(2);
    const IGV = +(subTotal * IGV_RATE).toFixed(2);

    return {
      oldPrice: undefined,
      price: originalPrice,
      discount: undefined,
      subTotal,
      IGV,
      totalPayment,
    };
  }

  // Con descuento: cálculo completo
  const discountAmount = +(originalPrice * percentageDiscount).toFixed(2);
  const priceAfterDiscount = +(originalPrice - discountAmount).toFixed(2);
  const totalPayment = priceAfterDiscount;
  const subTotal = +(totalPayment / (1 + IGV_RATE)).toFixed(2);
  const IGV = +(subTotal * IGV_RATE).toFixed(2);

  return {
    oldPrice: originalPrice,
    price: priceAfterDiscount,
    discount: discountAmount,
    subTotal,
    IGV,
    totalPayment,
  };
};

const getAutoDiscountRate = (product: Product): number => {
  // Productos excluidos de descuento automático
  if (
    product.type &&
    PRODUCTS_WITHOUT_AUTO_DISCOUNT.includes(
      product.type as (typeof PRODUCTS_WITHOUT_AUTO_DISCOUNT)[number],
    )
  ) {
    return 0;
  }

  // Descuento según condición del producto
  return DISCOUNT_RATES[product.condition] ?? 0;
};

const calcProductPricesDetails = (product: Product): Price => {
  const discountRate = getAutoDiscountRate(product);
  return calcProductPrices(product, discountRate);
};

export const products: Product[] = orderBy(
  productsData.map(
    (product) =>
      ({
        ...product,
        ...(product.lumensANSI && {
          throwRatio:
            product.lumensANSI >= 3000
              ? "Proyección media/alta"
              : "Proyección media/estándar",
        }),
        ...calcProductPricesDetails(product),
        campaign: "Navidad",
      }) as Product,
  ),
  ["type", "stock"],
  ["desc", "desc"],
);
