// TYPES AND INTERFACES GENERICS
type AimedAt = "education" | "business" | "personal";
type Condition = "new" | "refurbished" | "used";
type Range = "low" | "medium" | "high"; // Gama del equipo
type MediaType = "image" | "video";

interface MediaItem {
  id: string; // Identificador único
  type: MediaType;
  url: string; // URL del recurso
  order: number; // Orden definido por el usuario
  altText?: string; // Texto alternativo (para accesibilidad)
  thumbnailUrl?: string; // Miniatura (útil para videos)
}

interface LabelAndValue {
  order?: number;
  label: string;
  value: string; // texto plano
  valueRTE?: string; // solo cuando sea necesario
}

interface GeneralInfo {
  importantFeatures: {
    iconImg: string;
    title: string;
    description: string;
    titleUrl?: string;
  }[];
  additionalInformationRTE: string;
}

interface CategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

interface Category {
  id: string; // UUID o slug
  name: string; // "Electronics"
  slug: string; // "electronics"
  description?: string;
  parentId?: string | null; // null = root category
  level: number; // 0 = root, 1 = subcategory, etc
  order?: number; // para orden visual
  imageUrl?: string; // imagen representativa
  icon?: string; // opcional (ej. icon name)
  isActive: boolean;
  seo?: CategorySEO;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  img?: string;
  title: string;
  url: string;
}

interface ProjectorSpecifications {
  specs?: LabelAndValue[];
  general?: LabelAndValue[];
  power?: LabelAndValue[];
  projectionLens?: LabelAndValue[];
  projectorConnectivity?: LabelAndValue[];
  remoteControl?: LabelAndValue[];
  projectorDimensions?: LabelAndValue[];
  projectorDetails?: LabelAndValue[];
}

interface NumericFilter {
  value: number;
  unit?: string;
}

interface RangeFilter {
  min: number;
  max: number;
  unit?: string;
}

interface BooleanFilter {
  value: boolean;
}

interface StringFilter {
  value: string;
}

type FilterAttribute =
  | NumericFilter
  | RangeFilter
  | BooleanFilter
  | StringFilter;

interface ProductFilters {
  lumens?: NumericFilter; // 4000
  contrastRatio?: NumericFilter; // 15000
  resolution?: StringFilter; // WXGA
  aspectRatio?: StringFilter; // 16:10
  lampLifeHours?: RangeFilter; // 6000 - 12000
  weightKg?: NumericFilter; // 2.8
  hasWireless?: BooleanFilter; // true
  aimedAt?: AimedAt; // education | business
}

interface ProjectorKeyFeatures {
  lumens: number;
  resolution: string; // Ej: "1920x1080"
  contrastRatio?: string; // Ej: "10000:1"
  connectivity: string[]; // Ej: ["HDMI", "USB-C"]
  lampLifeHours?: number;
  weightKg?: number;
  dimensionsCm?: { width: number; height: number; depth: number };
  portability?: "portable" | "semi-portable" | "fixed";
  [key: string]: any; // Permite agregar más características fácilmente
}

interface ProductPrice {
  current: number; // Precio actual
  previous?: number; // Precio anterior
  currency: string; // Ej: "PEN", "USD"
  discountPercentage?: number; // Descuento calculado automáticamente
  validFrom?: Date; // Fecha de inicio del precio
  validUntil?: Date; // Fecha de fin del precio
  label?: string; // Ej: "Oferta limitada"
}

// UNIT INTERFACES
interface Product {
  id: string;
  nameId: string;
  categoryIds: string[];
  name: string;
  brand: string; // Marca del proyector
  model?: string; // Modelo exacto
  condition: Condition; // Estado del equipo
  range: Range; // Gama: baja, media, alta
  descriptionRTE: string; // Descripción media/baja en RTE
  resourceURLs?: LabelAndValue[]; // URLs de recursos adicionales
  generalDescription: GeneralInfo;
  whatsInTheBox?: string[];
  notesRTE?: string;
  documents?: Document[];
  accessoriesIds?: string[];
  price: ProductPrice;
  stockQuantity: number;
  isActive: boolean;
  media?: MediaItem[]; // Imágenes y videos con orden personalizado

  /**  Lo más importante para el usuario */
  keyFeatures?: ProjectorKeyFeatures;
  // Solo si el producto es un proyector
  projectorSpecifications?: ProjectorSpecifications;
  /** Solo para filtros */
  filters?: ProductFilters;
}
