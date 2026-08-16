"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Package,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/ui/ProductCard";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import type { ProductCondition } from "@/types";

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "like_new", label: "Como nuevo" },
  { value: "good", label: "Buen estado" },
  { value: "fair", label: "Aceptable" },
];

const sortOptions = [
  { value: "most_relevance", label: "Más relevantes" },
  { value: "most_recent", label: "Más recientes" },
  { value: "price_low", label: "Menor precio" },
  { value: "price_high", label: "Mayor precio" },
];

const projectorResolutionOptions = [
  { value: "svga", label: "800x600 (SVGA)" },
  { value: "xga", label: "1024x768 (XGA)" },
  { value: "wxga", label: "1280x800 (WXGA)" },
  { value: "hd", label: "1280x720 (HD)" },
  { value: "full_hd", label: "1920x1080 (Full HD)" },
  { value: "wuxga", label: "1920x1200 (WUXGA)" },
  { value: "uhd", label: "3840x2160 (4K UHD)" },
];

const projectorLumensOptions = [
  { value: "under_1000", label: "Menos de 1000 lm" },
  { value: "1000_2000", label: "1000 - 2000 lm" },
  { value: "2000_3000", label: "2000 - 3000 lm" },
  { value: "3000_4000", label: "3000 - 4000 lm" },
  { value: "4000_5000", label: "4000 - 5000 lm" },
  { value: "over_5000", label: "Más de 5000 lm" },
];

const projectorTechnologyOptions = [
  { value: "lcd", label: "LCD" },
  { value: "dlp", label: "DLP" },
  { value: "led", label: "LED" },
  { value: "laser", label: "LÁSER" },
  { value: "lcos", label: "LCoS" },
];

const projectorBrandOptions = [
  { value: "epson", label: "Epson" },
  { value: "benq", label: "BenQ" },
  { value: "viewsonic", label: "ViewSonic" },
  { value: "sony", label: "Sony" },
  { value: "lg", label: "LG" },
  { value: "optoma", label: "Optoma" },
  { value: "acer", label: "Acer" },
  { value: "panasonic", label: "Panasonic" },
  { value: "nec", label: "NEC" },
  { value: "other", label: "Otra" },
];

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PriceFilterInputs = ({
  initialMin,
  initialMax,
  urlMinPrice,
  urlMaxPrice,
  onApply,
  onClear,
}: {
  initialMin: string;
  initialMax: string;
  urlMinPrice: string;
  urlMaxPrice: string;
  onApply: (min: string, max: string) => void;
  onClear: () => void;
}) => {
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const handleApply = () => {
    const min = minRef.current?.value.replace(/\D/g, "") || "";
    const max = maxRef.current?.value.replace(/\D/g, "") || "";
    onApply(min, max);
  };

  return (
    <div className="pt-4 border-t border-[#f1f5f9]">
      <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>Rango de Precio</span>
        {(urlMinPrice || urlMaxPrice) && (
          <button
            onClick={onClear}
            className="text-[11px] text-[#f25c05] font-bold hover:underline capitalize"
          >
            Limpiar
          </button>
        )}
      </h4>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs font-bold">
              S/
            </span>
            <input
              ref={minRef}
              type="text"
              inputMode="numeric"
              defaultValue={initialMin}
              placeholder="Mínimo"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="w-full pl-7 pr-2 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05] transition-all font-semibold"
            />
          </div>
          <span className="text-[#94a3b8] text-xs font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs font-bold">
              S/
            </span>
            <input
              ref={maxRef}
              type="text"
              inputMode="numeric"
              defaultValue={initialMax}
              placeholder="Máximo"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="w-full pl-7 pr-2 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05] transition-all font-semibold"
            />
          </div>
        </div>
        <Button
          onClick={handleApply}
          size="sm"
          className="w-full bg-[#112237] hover:bg-[#1e3a5f] text-white text-xs font-bold py-1.5 rounded-xl shadow-sm transition-all"
        >
          Aplicar Precio
        </Button>
      </div>
    </div>
  );
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Parameters
  const keywords = searchParams.get("keywords") || "";
  const categoryId = searchParams.get("category_id") || "";
  const orderBy = searchParams.get("order_by") || "most_relevance";
  const urlMinPrice = searchParams.get("min_price") || "";
  const urlMaxPrice = searchParams.get("max_price") || "";
  const conditions = useMemo(
    () => searchParams.get("condition")?.split(",").filter(Boolean) || [],
    [searchParams],
  );

  const resolutionSpecs = useMemo(
    () => searchParams.get("resolution")?.split(",").filter(Boolean) || [],
    [searchParams],
  );
  const lumensSpecs = useMemo(
    () => searchParams.get("lumens")?.split(",").filter(Boolean) || [],
    [searchParams],
  );
  const technologySpecs = useMemo(
    () => searchParams.get("technology")?.split(",").filter(Boolean) || [],
    [searchParams],
  );
  const brandSpecs = useMemo(
    () => searchParams.get("brand")?.split(",").filter(Boolean) || [],
    [searchParams],
  );

  // Key para forzar remount de inputs uncontrolled al limpiar filtros
  const [priceFilterKey, setPriceFilterKey] = useState(0);

  // UI state
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const page = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const limit = 20;

  // Cargar categorías desde BD
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.categories) && json.categories.length > 0) {
            setCategories(json.categories);
            return;
          }
        }
      } catch (e) {
        console.error("Error al cargar /api/categories:", e);
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  // Mapeos dinámicos de categorías
  const categorySlugToId = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.slug] = cat.id;
    });
    return map;
  }, [categories]);

  const categoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const effectiveCategoryId =
    keywords && categorySlugToId[keywords.toLowerCase()]
      ? categorySlugToId[keywords.toLowerCase()]
      : categoryId;

  const isProjectorCategory =
    effectiveCategoryId &&
    categories.find((c) => c.id === effectiveCategoryId)?.slug ===
      "proyectores";

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (keywords) params.set("keywords", keywords);
        if (categoryId) params.set("category_id", categoryId);
        if (urlMinPrice) params.set("min_price", urlMinPrice);
        if (urlMaxPrice) params.set("max_price", urlMaxPrice);
        if (conditions.length > 0)
          params.set("condition", conditions.join(","));
        if (orderBy) params.set("order_by", orderBy);
        params.set("page", page.toString());
        params.set("limit", limit.toString());

        const res = await fetch(`/api/products/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Respuesta no válida del servidor");
        }
        const json = await res.json();
        const data = Array.isArray(json.products) ? json.products : [];
        const totalCount = typeof json.total === "number" ? json.total : 0;

        if (mounted) {
          setProducts(data);
          setTotal(totalCount);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error al buscar productos:", err);
        if (mounted) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [
    keywords,
    categoryId,
    urlMinPrice,
    urlMaxPrice,
    conditions,
    orderBy,
    page,
  ]);

  const totalPages = Math.ceil(total / limit);

  // Manejador centralizado de cambio de URL
  const updateUrlParams = (
    updater: (params: URLSearchParams) => void,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams);
    updater(params);
    if (resetPage) {
      params.delete("page");
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams((params) => {
      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }
    }, false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategorySelect = (id: string) => {
    updateUrlParams((params) => {
      if (id) params.set("category_id", id);
      else params.delete("category_id");
    });
  };

  const handleSortChange = (sortValue: string) => {
    updateUrlParams((params) => {
      if (sortValue && sortValue !== "most_relevance") {
        params.set("order_by", sortValue);
      } else {
        params.delete("order_by");
      }
    });
  };

  const handleApplyPriceFilter = (min: string, max: string) => {
    updateUrlParams((params) => {
      if (min) params.set("min_price", min);
      else params.delete("min_price");
      if (max) params.set("max_price", max);
      else params.delete("max_price");
    });
  };

  const handleClearPriceFilter = () => {
    setPriceFilterKey((k) => k + 1);
    updateUrlParams((params) => {
      params.delete("min_price");
      params.delete("max_price");
    });
  };

  const handleConditionToggle = (cond: string) => {
    updateUrlParams((params) => {
      const current = params.get("condition")?.split(",").filter(Boolean) || [];
      const updated = current.includes(cond)
        ? current.filter((c) => c !== cond)
        : [...current, cond];

      if (updated.length > 0) params.set("condition", updated.join(","));
      else params.delete("condition");
    });
  };

  const handleSpecToggle = (
    specType: "resolution" | "lumens" | "technology" | "brand",
    value: string,
  ) => {
    updateUrlParams((params) => {
      const current = params.get(specType)?.split(",").filter(Boolean) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      if (updated.length > 0) params.set(specType, updated.join(","));
      else params.delete(specType);
    });
  };

  const clearAllFilters = () => {
    setPriceFilterKey((k) => k + 1);
    router.push("/search", { scroll: false });
  };

  // Conteo de filtros activos
  const activeFiltersCount = [
    Boolean(keywords),
    Boolean(categoryId),
    Boolean(urlMinPrice || urlMaxPrice),
    conditions.length > 0,
    resolutionSpecs.length > 0,
    lumensSpecs.length > 0,
    technologySpecs.length > 0,
  ].filter(Boolean).length;

  // Componente Reutilizable de Filtros (Sidebar Desktop & Mobile Drawer)
  const FilterSidebarControls = () => (
    <div className="space-y-6 text-[#112237]">
      {/* 1. Categorías */}
      <div>
        <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
          Categoría
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCategorySelect("")}
            className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl transition-all font-semibold ${
              !categoryId
                ? "bg-orange-50 text-[#f25c05] font-bold"
                : "text-[#475569] hover:bg-[#f8fafc]"
            }`}
          >
            <span>Todas las categorías</span>
            {!categoryId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f25c05]" />
            )}
          </button>
          {categories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl transition-all ${
                  isSelected
                    ? "bg-orange-50 text-[#f25c05] font-extrabold"
                    : "text-[#475569] hover:bg-[#f8fafc] font-medium"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f25c05]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <PriceFilterInputs
        key={priceFilterKey}
        initialMin={urlMinPrice}
        initialMax={urlMaxPrice}
        urlMinPrice={urlMinPrice}
        urlMaxPrice={urlMaxPrice}
        onApply={handleApplyPriceFilter}
        onClear={handleClearPriceFilter}
      />

      {/* 3. Condición del Producto */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
          Condición
        </h4>
        <div className="space-y-1.5">
          {conditionOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-[#f8fafc] transition-colors"
            >
              <Checkbox
                checked={conditions.includes(opt.value)}
                onCheckedChange={() => handleConditionToggle(opt.value)}
                className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
              />
              <span className="text-xs font-medium text-[#334155]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Filtros Específicos para Proyectores */}
      {isProjectorCategory && (
        <>
          <div className="pt-4 border-t border-[#f1f5f9]">
            <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
              Resolución
            </h4>
            <div className="space-y-1.5">
              {projectorResolutionOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-[#f8fafc]"
                >
                  <Checkbox
                    checked={resolutionSpecs.includes(opt.value)}
                    onCheckedChange={() =>
                      handleSpecToggle("resolution", opt.value)
                    }
                    className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                  />
                  <span className="text-xs font-medium text-[#334155]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9]">
            <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
              Luminosidad
            </h4>
            <div className="space-y-1.5">
              {projectorLumensOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-[#f8fafc]"
                >
                  <Checkbox
                    checked={lumensSpecs.includes(opt.value)}
                    onCheckedChange={() =>
                      handleSpecToggle("lumens", opt.value)
                    }
                    className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                  />
                  <span className="text-xs font-medium text-[#334155]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9]">
            <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
              Tecnología
            </h4>
            <div className="space-y-1.5">
              {projectorTechnologyOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-[#f8fafc]"
                >
                  <Checkbox
                    checked={technologySpecs.includes(opt.value)}
                    onCheckedChange={() =>
                      handleSpecToggle("technology", opt.value)
                    }
                    className="data-[state=checked]:bg-[#f25c05] data-[state=checked]:border-[#f25c05]"
                  />
                  <span className="text-xs font-medium text-[#334155]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Barra Superior: Título & Selector de Ordenamiento */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#112237] tracking-tight">
                {keywords ? (
                  <span>
                    Búsqueda:{" "}
                    <span className="text-[#f25c05]">
                      &quot;{keywords}&quot;
                    </span>
                  </span>
                ) : categoryId && categoryIdToName[categoryId] ? (
                  <span>Categoría: {categoryIdToName[categoryId]}</span>
                ) : (
                  "Catálogo Completo de Productos"
                )}
              </h1>
            </div>
            <p className="text-xs font-semibold text-[#64748b] mt-1">
              {isLoading ? (
                <span>Cargando catálogo...</span>
              ) : (
                <span>
                  Mostrando <strong>{products.length}</strong> de{" "}
                  <strong>{total}</strong> productos disponibles
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Botón de Filtros para Móviles */}
            <Button
              onClick={() => setIsMobileDrawerOpen(true)}
              variant="outline"
              className="md:hidden flex items-center gap-2 text-xs font-bold border-[#e2e8f0] text-[#112237]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#f25c05]" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#f25c05] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Selector Ordenar por */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#94a3b8] hidden sm:block" />
              <div className="relative">
                <select
                  value={orderBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] text-xs font-bold text-[#112237] py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 cursor-pointer shadow-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS ACTIVOS (CHIPS / PILLS CON BORRADO RÁPIDO) */}
        {activeFiltersCount > 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-3 mb-6 shadow-sm flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#64748b] mr-1">
              Filtros activos:
            </span>

            {keywords && (
              <Badge className="bg-orange-50 text-[#f25c05] border border-orange-200 text-xs font-bold py-1 px-2.5 rounded-xl flex items-center gap-1.5">
                <span>Búsqueda: &quot;{keywords}&quot;</span>
                <button
                  onClick={() => updateUrlParams((p) => p.delete("keywords"))}
                  className="hover:bg-orange-200/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {categoryId && categoryIdToName[categoryId] && (
              <Badge className="bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold py-1 px-2.5 rounded-xl flex items-center gap-1.5">
                <span>Categoría: {categoryIdToName[categoryId]}</span>
                <button
                  onClick={() => handleCategorySelect("")}
                  className="hover:bg-slate-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {(urlMinPrice || urlMaxPrice) && (
              <Badge className="bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold py-1 px-2.5 rounded-xl flex items-center gap-1.5">
                <span>
                  Precio: S/ {urlMinPrice || "0"} - S/ {urlMaxPrice || "∞"}
                </span>
                <button
                  onClick={handleClearPriceFilter}
                  className="hover:bg-slate-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {conditions.map((cond) => (
              <Badge
                key={cond}
                className="bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold py-1 px-2.5 rounded-xl flex items-center gap-1.5"
              >
                <span>
                  {conditionOptions.find((c) => c.value === cond)?.label ||
                    cond}
                </span>
                <button
                  onClick={() => handleConditionToggle(cond)}
                  className="hover:bg-slate-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {resolutionSpecs.map((res) => (
              <Badge
                key={res}
                className="bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold py-1 px-2.5 rounded-xl flex items-center gap-1.5"
              >
                <span>
                  Res:{" "}
                  {projectorResolutionOptions.find((r) => r.value === res)
                    ?.label || res}
                </span>
                <button
                  onClick={() => handleSpecToggle("resolution", res)}
                  className="hover:bg-slate-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            <button
              onClick={clearAllFilters}
              className="text-xs font-extrabold text-[#f25c05] hover:underline flex items-center gap-1 ml-auto px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar todo</span>
            </button>
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL: SIDEBAR DE FILTROS + GRID DE RESULTADOS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR DESKTOP */}
          <aside className="hidden md:block md:col-span-3 sticky top-24">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-5 border-b border-[#f1f5f9] pb-3">
                <h3 className="font-extrabold text-[#112237] text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#f25c05]" />
                  <span>Filtrar Productos</span>
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-[#f25c05] hover:underline"
                  >
                    Limpiar ({activeFiltersCount})
                  </button>
                )}
              </div>

              <FilterSidebarControls />
            </div>
          </aside>

          {/* GRID DE RESULTADOS */}
          <main className="md:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#e2e8f0] p-4 h-72 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-full h-36 bg-slate-100 rounded-xl" />
                    <div className="space-y-2 mt-3">
                      <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-slate-100 rounded w-1/3 mt-4" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      size="sm"
                      className="rounded-xl font-bold text-xs border-[#e2e8f0] text-[#112237]"
                    >
                      Anterior
                    </Button>
                    <span className="text-xs font-bold text-[#64748b] bg-white border border-[#e2e8f0] px-3.5 py-1.5 rounded-xl shadow-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      size="sm"
                      className="rounded-xl font-bold text-xs border-[#e2e8f0] text-[#112237]"
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* ESTADO VACÍO CUANDO NO HAY PRODUCTOS */
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center shadow-sm max-w-md mx-auto my-8">
                <div className="w-16 h-16 bg-orange-50 text-[#f25c05] rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-[#112237] text-base mb-1">
                  No se encontraron coincidencias
                </h3>
                <p className="text-xs text-[#64748b] mb-6 leading-relaxed">
                  Intenta ajustando tus términos de búsqueda o prueba removiendo
                  algunos filtros aplicados.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </main>
        </div>
      </main>

      {/* MODAL DRAWER DE FILTROS PARA MÓVILES */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between">
            <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
              <h3 className="font-extrabold text-[#112237] text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#f25c05]" />
                <span>Filtrar Productos</span>
              </h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-[#94a3b8] hover:text-[#112237] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
              <FilterSidebarControls />
            </div>

            <div className="p-4 border-t border-[#f1f5f9] bg-slate-50 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1 text-xs font-bold rounded-xl border-slate-300"
              >
                Limpiar
              </Button>
              <Button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold rounded-xl shadow-md"
              >
                Ver resultados
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
