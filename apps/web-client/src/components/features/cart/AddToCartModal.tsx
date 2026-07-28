"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShoppingCart,
  X,
  Sparkles,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Laptop,
  Armchair,
  Presentation,
  Volume2,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

interface AddedProductInfo {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
  stock?: number;
  quantity: number;
}

const CATEGORY_CAROUSEL_ITEMS = [
  {
    id: "proyectores",
    name: "Proyectores y Multimedia",
    slug: "proyectores",
    icon: Monitor,
  },
  {
    id: "laptops",
    name: "Cómputo y Laptops",
    slug: "laptops",
    icon: Laptop,
  },
  {
    id: "mobiliario",
    name: "Mobiliario Educativo / Oficina",
    slug: "electronica",
    icon: Armchair,
  },
  {
    id: "pizarras",
    name: "Pizarras e Interactividad",
    slug: "electronica",
    icon: Presentation,
  },
  {
    id: "audio",
    name: "Audio y Conferencias",
    slug: "tv-audio",
    icon: Volume2,
  },
];

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  addedProduct: AddedProductInfo | null;
}

export function AddToCartModal({ isOpen, onClose, addedProduct }: AddToCartModalProps) {
  const router = useRouter();
  const { items, total, itemCount } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkScroll();
    }
  }, [isOpen]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 180;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!isOpen || !addedProduct || !mounted) return null;

  const handleGoToCart = () => {
    onClose();
    router.push("/cart");
  };

  const handleCategoryClick = (categorySlug: string) => {
    onClose();
    router.push(`/search?category=${categorySlug}`);
  };

  const handleSearchMore = () => {
    onClose();
    router.push("/search");
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado Minimalista */}
        <div className="p-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112237]">
                ¡Producto agregado a tu paquete!
              </h2>
              <p className="text-[11px] font-medium text-[#f25c05] flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                Arma tu set ideal para modernizar tu aula u oficina en un solo pago
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Resumen Compacto del Paquete */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#112237]" />
                <h3 className="text-[11px] font-bold text-[#112237] uppercase tracking-wider">
                  Tu paquete armado ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})
                </h3>
              </div>
            </div>

            {/* Lista minimalista de ítems (máximo 4 visibles) */}
            <div className="max-h-[216px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden divide-y divide-slate-100/80 pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#112237] truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Cantidad: <strong className="text-[#112237]">{item.quantity}</strong> un.
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#f25c05]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total acumulado minimalista */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Total acumulado:</span>
              <span className="text-sm font-bold text-[#112237]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Carousel de Categorías Complementarias Estilo Home Page */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#112237] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#f25c05]" />
                Categorías complementarias para tu set
              </h4>
              <button
                onClick={handleSearchMore}
                className="text-[11px] font-bold text-[#f25c05] hover:underline flex items-center gap-0.5"
              >
                Buscar más productos
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Contenedor Carrusel Horizontal */}
            <div className="relative group">
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-200 rounded-full p-1.5 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#112237]" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-200 rounded-full p-1.5 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#112237]" />
                </button>
              )}

              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1.5 px-0.5"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {CATEGORY_CAROUSEL_ITEMS.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      style={{ scrollSnapAlign: "start" }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full whitespace-nowrap bg-white border border-slate-200 text-[#112237] hover:border-[#f25c05] hover:text-[#f25c05] hover:shadow-xs transition-all text-xs font-medium cursor-pointer shrink-0"
                    >
                      <IconComponent className="w-3.5 h-3.5 shrink-0 text-[#64748b]" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Pie de Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleSearchMore}
            size="sm"
            className="rounded-xl font-semibold text-slate-600 border-slate-300 hover:bg-white text-xs"
          >
            Seguir armando mi paquete
          </Button>

          <Button
            onClick={handleGoToCart}
            size="sm"
            className="rounded-xl font-bold bg-[#f25c05] hover:bg-[#d94d04] text-white px-5 shadow-sm text-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Ir al carrito ({itemCount})
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
