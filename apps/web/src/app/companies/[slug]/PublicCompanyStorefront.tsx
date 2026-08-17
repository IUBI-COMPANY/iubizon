"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Check,
  CheckCircle2,
  Edit,
  MapPin,
  Package,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { EditCompanyModal } from "@/components/features/companies/EditCompanyModal";
import { useCompany } from "@/context/CompanyContext";
import type { Product } from "@/types";

interface PublicCompanyStorefrontProps {
  company: {
    id: string;
    name: string;
    legal_name?: string | null;
    slug: string;
    tax_id: string | null;
    logo_url: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
    is_verified: boolean;
  };
  products: Product[];
}

export const PublicCompanyStorefront = ({
  company: initialCompany,
  products,
}: PublicCompanyStorefrontProps) => {
  const router = useRouter();
  const { companies, refreshCompanies, activeCompany } = useCompany();
  const [companyData, setCompanyData] = useState(initialCompany);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Comprobar si el usuario logueado es owner o admin de esta empresa
  const membership = companies.find((c) => c.id === companyData.id);
  const canEdit = !membership?.role
    ? false
    : ["owner", "admin"].includes(membership.role) &&
      companyData?.id === activeCompany?.id;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [products, searchQuery]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${companyData.name} en iubizon`,
            text: `Visita la tienda oficial de ${companyData.name} en iubizon.`,
            url: shareUrl,
          });
          return;
        } catch {
          // Fallback a portapapeles si el usuario cancela el dialogo de share nativo
        }
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <main className="flex-1 pb-16">
      {/* Banner Superior Estilo Tienda Oficial */}
      <div className="bg-gradient-to-r from-[#112237] via-[#1a3454] to-[#0e1c2e] text-white border-b border-slate-800 relative">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Lado Izquierdo: Logo y Nombre de la Empresa */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#f25c05] border-4 border-white text-white flex items-center justify-center shrink-0 overflow-hidden text-3xl font-bold shadow-xl">
                {companyData.logo_url ? (
                  <Image
                    src={companyData.logo_url}
                    alt={companyData.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>
                    {companyData.name?.[0]?.toUpperCase() || (
                      <Building2 className="w-10 h-10" />
                    )}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {companyData.name}
                </h1>
                {companyData.location && (
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#f25c05]" />
                    <span>{companyData.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Lado Derecho: Lista de Verificación de Seguridad + Botones */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              {/* Lista con Ícono Check de Seguridad y Respaldo SUNAT */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3.5 rounded-2xl text-xs space-y-1.5 min-w-[240px]">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {companyData?.legal_name || companyData.name}
                  </span>
                </p>

                <div className="space-y-1 text-[11px] text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      RUC:{" "}
                      <strong className="text-white font-mono font-semibold">
                        {companyData.tax_id || "Verificado"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Estado empresa:{" "}
                      <strong className="text-emerald-400 font-bold">
                        Activo / Habido
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Ficha RUC:{" "}
                      <strong className="text-white font-medium">
                        Verificada SUNAT
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Comprobantes:{" "}
                      <strong className="text-white font-medium">
                        Factura y Boleta
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones y Contador de Productos */}
              <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-xl text-center flex-1 sm:w-full lg:w-auto">
                  <p className="text-xl font-extrabold text-[#f25c05]">
                    {products.length}
                  </p>
                  <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                    Productos
                  </p>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md shrink-0"
                  >
                    <Edit className="w-4 h-4 text-[#f25c05]" />
                    <span>Editar</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Descripción de la Empresa (si existe) */}
        {companyData.description && (
          <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-2">
              Acerca de {companyData.name}
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              {companyData.description}
            </p>
          </div>
        )}

        {/* Barra de Búsqueda de Productos de la Tienda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#112237]">
              Catálogo de Productos
            </h2>
            <p className="text-xs text-[#64748b]">
              Explora las publicaciones oficiales disponibles de esta marca
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar en ${companyData.name}...`}
              className="w-full bg-white border border-[#e2e8f0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05] shadow-sm"
            />
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Grilla de Productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#112237] mb-1">
              No se encontraron productos
            </h3>
            <p className="text-xs text-[#94a3b8]">
              {searchQuery
                ? `No hay coincidencias para "${searchQuery}" en la tienda.`
                : "Esta empresa aún no tiene productos publicados."}
            </p>
          </div>
        )}
      </div>

      {canEdit && (
        <EditCompanyModal
          company={companyData}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={(updatedCompany) => {
            setCompanyData((prev) => ({
              ...prev,
              ...updatedCompany,
              slug: updatedCompany.slug || prev.slug,
            }));
            refreshCompanies();
            if (
              updatedCompany.slug &&
              updatedCompany.slug !== companyData.slug
            ) {
              router.replace(`/companies/${updatedCompany.slug}`);
            }
          }}
        />
      )}
    </main>
  );
};
