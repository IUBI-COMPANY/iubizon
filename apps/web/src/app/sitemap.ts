import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.iubizon.com";
  const currentDate = new Date();

  // 1. Páginas estáticas esenciales de la plataforma
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    // 2. Obtener categorías activas para mapearlas como landing pages de búsqueda
    const categories = await prisma.category.findMany({
      select: { id: true },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/search?category_id=${category.id}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // 3. Obtener marcas / empresas verificadas de iubizon
    const companies = await prisma.company.findMany({
      where: { is_verified: true },
      select: { slug: true, updated_at: true },
    });

    const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
      url: `${baseUrl}/companies/${company.slug}`,
      lastModified: company.updated_at || currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // 4. Obtener productos activos pertenecientes a empresas verificadas
    // Limitamos preventivamente a los 25,000 más recientes para garantizar velocidad y cumplir con límites XML de Google (max 50,000 URLs)
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        company: { is_verified: true },
      },
      select: { id: true, updated_at: true },
      orderBy: { created_at: "desc" },
      take: 25000,
    });

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updated_at || currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...companyPages, ...productPages];
  } catch (error) {
    console.error(
      "[Sitemap] Error fetching dinamic routes from Prisma:",
      error,
    );
    return staticPages;
  }
}
