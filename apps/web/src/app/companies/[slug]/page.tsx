import { cache } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Building2 } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { getPublicCompanyBySlugOrId as getPublicCompanyRaw } from "@/lib/services/companies";
import { getCategories } from "@/lib/services/categories";
import { PublicCompanyStorefront } from "./PublicCompanyStorefront";
import type { Product } from "@/types";

export const revalidate = 60;

const getPublicCompanyBySlugOrId = cache(async (slug: string) => {
  return getPublicCompanyRaw(slug);
});

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getPublicCompanyBySlugOrId(slug);

  if (!company) {
    return { title: "Empresa no encontrada | iubizon" };
  }

  return {
    title: `${company.name} | Tienda Oficial en iubizon`,
    description:
      company.description ||
      `Explora el catálogo oficial y productos de ${company.name} en iubizon.`,
    openGraph: {
      title: `${company.name} - Tienda Oficial`,
      description: company.description || `Catálogo de ${company.name}`,
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
  };
}

import { CompanyViewTracker } from "@/components/features/companies/CompanyViewTracker";

export default async function PublicCompanyPage({ params }: Props) {
  const { slug } = await params;

  const [company, categories] = await Promise.all([
    getPublicCompanyBySlugOrId(slug),
    getCategories(),
  ]);

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-md w-full">
            <Building2 className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#112237] mb-2">
              Empresa no encontrada
            </h1>
            <p className="text-sm text-[#64748b] mb-6">
              La marca o empresa que estás buscando no existe o ha cambiado de
              dirección.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#f25c05] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all shadow-md w-full text-center"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer categories={categories} />
      </div>
    );
  }

  // Transformar datos de Prisma a formato compatible con ProductCard
  const formattedProducts = company.products.map((p) => ({
    id: p.id,
    category_id: p.category_id,
    company_id: company.id,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url,
    },
    title: p.title,
    description: p.description,
    price: Number(p.price),
    condition: p.condition,
    status: p.status,
    stock: p.stock ?? 1,
    views: p.views ?? 0,
    favorites_count: p.favorites_count ?? 0,
    is_bundle: (p as any).is_bundle ?? false,
    location: p.location,
    availability_type: p.availability_type,
    delivery_preference: p.delivery_preference,
    created_at: p.created_at?.toISOString() || new Date().toISOString(),
    images: p.images.map((img) => ({
      id: img.id,
      product_id: p.id,
      url: img.url,
      position: img.position ?? 0,
    })),
  })) as unknown as Product[];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <CompanyViewTracker companyId={company.id} />
      <Navbar />

      <PublicCompanyStorefront
        company={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          tax_id: company.tax_id,
          logo_url: company.logo_url,
          description: company.description,
          phone: company.phone,
          email: company.email,
          location: company.location,
          is_verified: company.is_verified ?? false,
        }}
        products={formattedProducts}
      />

      <Footer categories={categories} />
    </div>
  );
}
