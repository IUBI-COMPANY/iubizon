import type {
  Profile as PrismaProfile,
  Category as PrismaCategory,
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
  Order as PrismaOrder,
  Shipping as PrismaShipping,
  Review as PrismaReview,
  Favorite as PrismaFavorite,
  Company as PrismaCompany,
  CompanyMember as PrismaCompanyMember,
} from "@prisma/client";

// ==========================================
// 1. DTOs de Enums y Filtros
// ==========================================
export type ProductCondition = "new" | "like_new" | "good" | "fair" | string;
export type ProductStatus = "active" | "pending" | "sold" | "reported" | string;
export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | string;
export type ShippingStatus =
  "pending" | "picked_up" | "in_transit" | "delivered" | string;

// ==========================================
// 2. Helper de Serialización JSON para Frontend
// ==========================================
type JsonEntity<T, Overrides = object> = Omit<
  T,
  "created_at" | "updated_at" | keyof Overrides
> &
  Overrides & {
    created_at?: string | null;
    updated_at?: string | null;
  };

// ==========================================
// 3. DTOs de Filtros
// ==========================================
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  location?: string;
  isBundle?: boolean;
  includeOutOfStock?: boolean;
  sortBy?:
    | "most_relevance"
    | "most_recent"
    | "price_low"
    | "price_high"
    | "newest"
    | "price_asc"
    | "price_desc"
    | "popular"
    | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// 4. Entidades de Dominio (100% Herencia de Prisma ORM)
// ==========================================

export type ProductImage = PrismaProductImage;
export type Shipping = PrismaShipping;

/** Perfil de Usuario / Empresa */
export type User = JsonEntity<PrismaProfile, { rating?: number }>;
export type UserProfile = User;

/** Categoría jerárquica */
export type Category = PrismaCategory & {
  children?: Category[];
};

/** Producto (Hereda 100% de Prisma) */
export type Product = JsonEntity<
  PrismaProduct,
  {
    price: number;
    seller?: User;
    company?: PrismaCompany | null;
    category?: Category;
    images?: ProductImage[];
    favorites?: number | null;
  }
>;

/** Reseñas */
export type Review = JsonEntity<PrismaReview, { buyer?: User }>;

/** Orden de compra */
export type Order = JsonEntity<
  PrismaOrder,
  {
    amount: number;
    commission?: number;
    product?: Product;
    buyer?: User;
    seller?: User;
    shipping?: Shipping;
  }
>;

/** Favoritos */
export type Favorite = JsonEntity<PrismaFavorite, { product?: Product }>;

/** Empresa / Proveedor B2B */
export type Company = JsonEntity<
  PrismaCompany,
  {
    role?: string;
    members?: CompanyMember[];
    companyMembers?: CompanyMember[];
    products?: Product[];
  }
>;

/** Miembro de Equipo de Empresa */
export type CompanyMember = JsonEntity<
  PrismaCompanyMember,
  { company?: Company; user?: User }
>;
