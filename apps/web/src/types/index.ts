import type {
  Profile as PrismaProfile,
  Category as PrismaCategory,
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
  Order as PrismaOrder,
  OrderShipping as PrismaOrderShipping,
  OrderInvoice as PrismaOrderInvoice,
  OrderPackage as PrismaOrderPackage,
  OrderItem as PrismaOrderItem,
  Review as PrismaReview,
  Favorite as PrismaFavorite,
  Company as PrismaCompany,
  CompanyMember as PrismaCompanyMember,
} from "@prisma/client";

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

type JsonEntity<T, Overrides = object> = Omit<
  T,
  "created_at" | "updated_at" | keyof Overrides
> &
  Overrides & {
    created_at?: string | null;
    updated_at?: string | null;
  };

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

export type ProductImage = PrismaProductImage;

export type OrderShipping = PrismaOrderShipping;
export type OrderInvoice = PrismaOrderInvoice;

export type User = JsonEntity<PrismaProfile, { rating?: number }>;
export type UserProfile = User;

export type Category = PrismaCategory & {
  children?: Category[];
};

export type Product = JsonEntity<
  PrismaProduct,
  {
    price: number;
    creator?: User | null;
    company?: Company | null;
    category?: Category;
    images?: ProductImage[];
    favorites?: number | null;
  }
>;

export type Review = JsonEntity<PrismaReview, { buyer?: User }>;

export type OrderItem = JsonEntity<
  PrismaOrderItem,
  {
    unit_price: number;
    subtotal: number;
    commission: number;
    product?: Product;
  }
>;

export type OrderPackage = JsonEntity<
  PrismaOrderPackage,
  {
    subtotal: number;
    commission_total: number;
    net_earnings: number;
    company?: Company | null;
    items?: OrderItem[];
  }
>;

export type Order = JsonEntity<
  PrismaOrder,
  {
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    total_amount: number;
    buyer?: User;
    shipping?: OrderShipping | null;
    invoice?: OrderInvoice | null;
    packages?: OrderPackage[];
  }
>;

export type Favorite = JsonEntity<PrismaFavorite, { product?: Product }>;

export type Company = JsonEntity<
  PrismaCompany,
  {
    role?: string;
    members?: CompanyMember[];
    companyMembers?: CompanyMember[];
    products?: Product[];
    orderPackages?: OrderPackage[];
  }
>;

export type CompanyMember = JsonEntity<
  PrismaCompanyMember,
  { company?: Company; user?: User }
>;
