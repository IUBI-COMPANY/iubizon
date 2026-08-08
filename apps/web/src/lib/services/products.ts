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
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
      location: true,
      is_verified: true,
    },
  },
  creator: {
    select: {
      id: true,
      name: true,
      avatar_url: true,
      location: true,
      rating: true,
      is_pro: true,
      total_sales: true,
      positive_reviews: true,
    },
  },
  images: { orderBy: { position: "asc" as const } },
};

function getSearchVariants(rawQuery: string): string[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const variants = new Set<string>();
  variants.add(trimmed);

  const noSpace = trimmed.replace(/\s+/g, "");
  if (noSpace) variants.add(noSpace);

  const words = trimmed.split(/\s+/).filter(Boolean);
  for (const word of words) {
    variants.add(word);

    if (word.length > 4 && word.endsWith("es")) {
      variants.add(word.slice(0, -2));
    } else if (word.length > 3 && word.endsWith("s")) {
      variants.add(word.slice(0, -1));
    } else if (word.length > 3 && !/[aeiouáéíóú]$/i.test(word)) {
      variants.add(word + "es");
    } else if (word.length > 2) {
      variants.add(word + "s");
    }
  }

  return Array.from(variants).filter((v) => v.length >= 2);
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { limit = 20, offset = 0, filters } = options;

  const where: Prisma.ProductWhereInput = { status: "active" };

  if (!filters?.includeOutOfStock) {
    where.stock = { gt: 0 };
  }

  if (filters?.query) {
    const rawQuery = filters.query.trim();
    const variants = getSearchVariants(rawQuery);

    const matchingCategories = await prisma.category.findMany({
      where: {
        OR: variants.flatMap((v) => [
          { name: { contains: v, mode: "insensitive" as const } },
          { slug: { contains: v, mode: "insensitive" as const } },
        ]),
      },
      select: { id: true },
    });

    const categoryIds = matchingCategories.map((c) => c.id);

    const searchConditions: Prisma.ProductWhereInput[] = variants.flatMap(
      (v) => [
        { title: { contains: v, mode: "insensitive" as const } },
        { description: { contains: v, mode: "insensitive" as const } },
        { brand: { contains: v, mode: "insensitive" as const } },
      ],
    );

    if (categoryIds.length > 0) {
      searchConditions.push({ category_id: { in: categoryIds } });
    }

    where.OR = searchConditions;
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

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    is_bundle: false,
    favorites: p.favorites_count ?? 0,
    created_at: p.created_at?.toISOString() || new Date().toISOString(),
    updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    creator: p.creator
      ? {
          ...p.creator,
          rating: Number(p.creator.rating || 0),
          is_pro: p.creator.is_pro ?? false,
          total_sales: p.creator.total_sales ?? 0,
          positive_reviews: p.creator.positive_reviews ?? 0,
        }
      : undefined,
  }));

  return {
    products: serializedProducts,
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
    latitude: null,
    longitude: null,
    created_at:
      typeof p.created_at === "string"
        ? p.created_at
        : (p.created_at as any)?.toISOString?.() || new Date().toISOString(),
    updated_at:
      typeof p.updated_at === "string"
        ? p.updated_at
        : (p.updated_at as any)?.toISOString?.() || new Date().toISOString(),
    category: p.category
      ? {
          ...p.category,
          icon: p.category.icon ?? "",
          sort_order: p.category.sort_order ?? 0,
        }
      : undefined,
    creator: p.creator
      ? {
          ...p.creator,
          rating: Number(p.creator.rating || 0),
          is_pro: p.creator.is_pro ?? false,
          total_sales: p.creator.total_sales ?? 0,
          positive_reviews: p.creator.positive_reviews ?? 0,
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
      stock: { gt: 0 },
    },
    include: productInclude,
    orderBy: { favorites_count: "desc" },
    take: limit,
  });
}

export async function getUserProducts(userId: string) {
  const memberships = await prisma.companyMember.findMany({
    where: { user_id: userId },
    select: { company_id: true },
  });
  const companyIds = memberships.map((m) => m.company_id);

  if (companyIds.length === 0) return [];

  return prisma.product.findMany({
    where: { company_id: { in: companyIds } },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { created_at: "desc" },
  });
}
