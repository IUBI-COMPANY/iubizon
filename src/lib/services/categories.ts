import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sort_order: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getTechCategories() {
  const techSlugs = [
    "electronica",
    "laptops",
    "proyectores",
    "moviles",
    "consolas",
    "tv-audio",
  ];
  return prisma.category.findMany({
    where: { slug: { in: techSlugs } },
    orderBy: { sort_order: "asc" },
  });
}

export async function getPopularCategories(limit = 6) {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { status: "active" } } },
      },
    },
    orderBy: { sort_order: "asc" },
    take: limit,
  });

  return categories.map((cat) => ({
    ...cat,
    sort_order: cat.sort_order ?? 0,
    icon: cat.icon ?? "",
    product_count: cat._count.products,
    sales_count: 0,
  }));
}
