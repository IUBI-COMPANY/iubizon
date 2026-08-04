import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Product, SearchFilters } from "@/types";

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

const productInclude = {
  category: {
    select: { id: true, name: true, slug: true, icon: true, sort_order: true },
  },
  seller: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      location: true,
      rating: true,
      is_pro: true,
      total_sales: true,
      positive_reviews: true,
    },
  },
  company: {
    select: { id: true, name: true, slug: true, logo_url: true },
  },
  images: { orderBy: { position: "asc" as const } },
};

export async function getProducts(options: GetProductsOptions = {}) {
  const { limit = 20, offset = 0, filters } = options;

  const where: Prisma.ProductWhereInput = { status: "active" };

  if (filters?.query) {
    const q = filters.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters?.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters?.condition && filters.condition.length > 0) {
    where.condition = { in: filters.condition };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { created_at: "desc" };
  const sort = filters?.sortBy;
  if (sort === "price_asc" || sort === "price_low") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc" || sort === "price_high") {
    orderBy = { price: "desc" };
  } else if (sort === "popular") {
    orderBy = { favorites_count: "desc" };
  } else if (sort === "most_recent" || sort === "newest") {
    orderBy = { created_at: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    hasMore: total > offset + limit,
  };
}

export async function getActiveProducts(limit = 20): Promise<Product[]> {
  const { products } = await getProducts({ limit });
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    is_bundle: false,
    favorites: p.favorites_count ?? 0,
    location: p.seller?.location ?? null,
    latitude: null,
    longitude: null,
    created_at: p.created_at?.toISOString() || new Date().toISOString(),
    updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    category: p.category
      ? {
          ...p.category,
          icon: p.category.icon ?? "",
          sort_order: p.category.sort_order ?? 0,
        }
      : undefined,
    seller: p.seller
      ? {
          ...p.seller,
          rating: Number(p.seller.rating || 0),
          is_pro: p.seller.is_pro ?? false,
          total_sales: p.seller.total_sales ?? 0,
          positive_reviews: p.seller.positive_reviews ?? 0,
        }
      : undefined,
  })) as unknown as Product[];
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export async function getProductsByCategory(categorySlug: string, limit = 20) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return { products: [], total: 0 };

  const where: Prisma.ProductWhereInput = {
    category_id: category.id,
    status: "active",
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { created_at: "desc" },
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
) {
  return prisma.product.findMany({
    where: {
      category_id: categoryId,
      id: { not: productId },
      status: "active",
    },
    include: productInclude,
    orderBy: { favorites_count: "desc" },
    take: limit,
  });
}

export async function getUserProducts(userId: string) {
  return prisma.product.findMany({
    where: { seller_id: userId },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { created_at: "desc" },
  });
}
