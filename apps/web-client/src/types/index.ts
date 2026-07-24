export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ProductStatus = 'active' | 'pending' | 'sold' | 'reported';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type ShippingStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_pro: boolean;
  rating: number;
  total_sales: number;
  positive_reviews: number;
  response_time: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  is_bundle: boolean;
  stock: number;
  views: number;
  favorites: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  seller?: User;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer?: User;
}


export interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  buyer?: User;
  seller?: User;
  shipping?: Shipping;
}

export interface Shipping {
  id: string;
  order_id: string;
  courier: string | null;
  tracking_number: string | null;
  status: ShippingStatus;
  origin_address: string;
  destination_address: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  location?: string;
  isBundle?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}