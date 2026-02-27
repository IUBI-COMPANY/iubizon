"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Classification,
  oldProducts,
  Product,
  ProductCondition,
} from "@/data-list/oldProducts";
import { getWhatsAppMessage } from "@/utils/whatsapp";

// ---------- helpers ----------
function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function formatMoneyPEN(value: number) {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
}

function getDiscountPercent(p: Product) {
  // Preferimos calcular % a partir de oldPrice y price (más confiable).
  if (
    typeof p.oldPrice === "number" &&
    p.oldPrice > 0 &&
    p.price < p.oldPrice
  ) {
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }
  // fallback: si alguien usó "discount" como monto descontado
  if (
    typeof p.discount === "number" &&
    typeof p.oldPrice === "number" &&
    p.oldPrice > 0
  ) {
    const pct = Math.round((p.discount / p.oldPrice) * 100);
    return pct > 0 ? pct : null;
  }
  return null;
}

function conditionLabel(c: ProductCondition) {
  if (c === "reconditioned") return "Reacondicionado";
  if (c === "gama-alta") return "Gama alta";
  return "Nuevo";
}

function classificationLabel(c?: Classification) {
  switch (c) {
    case "premium":
      return "Premium";
    case "standard":
      return "Standard";
    case "budget":
      return "Budget";
    case "clearance":
      return "Remate";
    case "wholesale":
      return "Mayorista";
    default:
      return null;
  }
}

function safeText(v?: string | number | null) {
  if (v === undefined || v === null) return "—";
  const s = String(v).trim();
  return s.length ? s : "—";
}

// ---------- derived lists ----------
const uniqueTypes = Array.from(
  new Set(oldProducts.map((p) => p.type).filter(Boolean)),
).sort();
const uniqueBrands = Array.from(
  new Set(oldProducts.map((p) => p.brand).filter(Boolean)),
).sort();

type SortKey =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc"
  | "name_asc";

export default function CatalogoPage() {
  // filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [condition, setCondition] = useState<ProductCondition | "">("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  // UI state
  const [selected, setSelected] = useState<Product | null>(null);

  // close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = (oldProducts as Product[]).filter((p) => {
      const matchesQ = !q
        ? true
        : [
            p.name,
            p.model,
            p.brand,
            p.type,
            p.badge,
            p.campaign,
            p.SN,
            ...(p.category ?? []),
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q));

      const matchesType = type ? p.type === type : true;
      const matchesBrand = brand ? p.brand === brand : true;
      const matchesCondition = condition ? p.condition === condition : true;
      const matchesStock = onlyInStock ? p.stock > 0 : true;

      return (
        matchesQ &&
        matchesType &&
        matchesBrand &&
        matchesCondition &&
        matchesStock
      );
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "stock_asc") return a.stock - b.stock;
      if (sort === "stock_desc") return b.stock - a.stock;
      if (sort === "name_asc")
        return (a.name ?? a.model).localeCompare(b.name ?? b.model, "es");
      return 0; // relevance (mantiene orden original)
    });

    return sorted;
  }, [search, type, brand, condition, onlyInStock, sort]);

  const hasFilters = Boolean(
    search || type || brand || condition || onlyInStock || sort !== "relevance",
  );

  const stats = useMemo(() => {
    const total = (oldProducts as Product[]).length;
    const shown = filtered.length;
    const outOfStock = filtered.filter((p) => p.stock <= 0).length;
    return { total, shown, outOfStock };
  }, [filtered]);

  function clearFilters() {
    setSearch("");
    setType("");
    setBrand("");
    setCondition("");
    setOnlyInStock(false);
    setSort("relevance");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Catálogo de otros productos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Mostrando <span className="font-semibold">{stats.shown}</span> de{" "}
            <span className="font-semibold">{stats.total}</span>
            {stats.outOfStock > 0 ? (
              <span className="text-gray-500"> · Solicítalo a pedido.</span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters (sticky) */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-6 bg-white/90 backdrop-blur border-y border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="sr-only" htmlFor="q">
              Buscar
            </label>
            <input
              id="q"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Buscar por nombre, modelo, marca, tipo, SN, categoría…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:flex gap-3">
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t!}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b!}>
                  {b}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={condition}
              onChange={(e) =>
                setCondition(e.target.value as ProductCondition | "")
              }
            >
              <option value="">Toda condición</option>
              <option value="new">Nuevo</option>
              <option value="reconditioned">Reacondicionado</option>
              <option value="gama-alta">Gama alta</option>
            </select>

            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              title="Ordenar"
            >
              <option value="relevance">Orden: Relevancia</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="stock_asc">Stock: menor a mayor</option>
              <option value="stock_desc">Stock: mayor a menor</option>
              <option value="name_asc">Nombre: A → Z</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            Solo con stock
          </label>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {search && (
              <Chip onClear={() => setSearch("")}>“{search.trim()}”</Chip>
            )}
            {type && <Chip onClear={() => setType("")}>Tipo: {type}</Chip>}
            {brand && <Chip onClear={() => setBrand("")}>Marca: {brand}</Chip>}
            {condition && (
              <Chip onClear={() => setCondition("")}>
                Condición: {conditionLabel(condition)}
              </Chip>
            )}
            {onlyInStock && (
              <Chip onClear={() => setOnlyInStock(false)}>Solo con stock</Chip>
            )}
            {sort !== "relevance" && (
              <Chip onClear={() => setSort("relevance")}>
                Orden:{" "}
                {sort === "price_asc"
                  ? "Precio ↑"
                  : sort === "price_desc"
                    ? "Precio ↓"
                    : sort === "stock_asc"
                      ? "Stock ↑"
                      : sort === "stock_desc"
                        ? "Stock ↓"
                        : "Nombre A→Z"}
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* List (compact admin-friendly rows) */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const pct = getDiscountPercent(p);
          const classLbl = classificationLabel(p.classification);
          const condition = conditionLabel(p.condition);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="w-full text-left group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 md:p-5 flex gap-4">
                {/* Image */}
                <div className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                  {p.mainImage ? (
                    <Image
                      src={p.mainImage}
                      alt={p.name ?? p.model}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Main */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate font-semibold text-gray-900">
                          {p.name ?? p.model}
                        </div>

                        {/* chips */}
                        <Pill
                          tone={
                            p.condition === "reconditioned"
                              ? "blue"
                              : p.condition === "gama-alta"
                                ? "purple"
                                : "green"
                          }
                        >
                          {condition}
                        </Pill>

                        {p.badge && <Pill tone="primary">{p.badge}</Pill>}
                        {p.campaign && (
                          <Pill tone="amber">
                            {p.campaign === "Navidad"
                              ? "Oferta Especial"
                              : p.campaign}
                          </Pill>
                        )}
                        {classLbl && <Pill tone="slate">{classLbl}</Pill>}
                        {pct !== null && pct > 0 && (
                          <Pill tone="emerald">-{pct}%</Pill>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          <span className="text-gray-500">Modelo:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {safeText(p.model)}
                          </span>
                        </span>
                        <span>
                          <span className="text-gray-500">Marca:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {safeText(p.brand)}
                          </span>
                        </span>
                        <span>
                          <span className="text-gray-500">Tipo:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {safeText(p.type)}
                          </span>
                        </span>
                        {p.lumensANSI ? (
                          <span>
                            <span className="text-gray-500">Lúmenes:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {p.lumensANSI}
                            </span>
                          </span>
                        ) : null}
                        {p.nativeResolution ? (
                          <span className="truncate">
                            <span className="text-gray-500">Resolución:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {p.nativeResolution}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="shrink-0 flex md:flex-col items-start md:items-end gap-2 md:gap-1">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatMoneyPEN(p.price)}
                        </div>
                        {typeof p.oldPrice === "number" &&
                          p.oldPrice > p.price && (
                            <div className="text-xs text-gray-400 line-through">
                              {formatMoneyPEN(p.oldPrice)}
                            </div>
                          )}
                      </div>

                      <div
                        className={cx(
                          "text-xs font-semibold rounded-full px-2 py-1",
                          p.stock > 0
                            ? p.stock <= 2
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100",
                        )}
                      >
                        {p.stock > 0
                          ? p.stock <= 2
                            ? `Bajo stock (${p.stock})`
                            : `Stock: ${p.stock}`
                          : "Solicítalo a pedido"}
                      </div>

                      <div className="text-xs text-gray-500 md:text-right">
                        Click para ver detalle
                      </div>
                      {/* Button */}
                      <a
                        href={`https://wa.me/51972300301?text=${getWhatsAppMessage(p)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition"
                      >
                        Solicitar por WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* subtle description */}
                  {p.sub ? (
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {p.sub}
                    </div>
                  ) : p.description ? (
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {p.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16 border border-dashed rounded-2xl">
            No se encontraron productos con esos filtros.
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && <ProductDetail product={selected} />}
      </Drawer>
    </div>
  );
}

// ---------- UI components ----------
function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
      {children}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full w-5 h-5 inline-flex items-center justify-center hover:bg-gray-100"
        aria-label="Quitar filtro"
      >
        ✕
      </button>
    </span>
  );
}

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?:
    | "primary"
    | "green"
    | "blue"
    | "amber"
    | "emerald"
    | "purple"
    | "slate";
}) {
  const map: Record<string, string> = {
    primary: "bg-primary/10 text-primary border border-primary/15",
    green: "bg-green-50 text-green-700 border border-green-100",
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    amber: "bg-amber-50 text-amber-800 border border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
    slate: "bg-slate-50 text-slate-700 border border-slate-100",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
      />
      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full md:w-[720px] bg-white shadow-2xl">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Detalle del producto</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cerrar (Esc)
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product: p }: { product: Product }) {
  const pct = getDiscountPercent(p);
  const classLbl = classificationLabel(p.classification);

  return (
    <div className="space-y-6">
      {/* Top */}
      <div className="flex gap-4">
        <div className="relative shrink-0 w-28 h-28 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
          {p.mainImage ? (
            <Image
              src={p.mainImage}
              alt={p.name ?? p.model}
              fill
              className="object-contain"
              sizes="112px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xl font-bold text-gray-900">
            {p.name ?? p.model}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Modelo:</span>{" "}
            {safeText(p.model)} <span className="text-gray-300">•</span>{" "}
            <span className="font-semibold text-gray-800">Marca:</span>{" "}
            {safeText(p.brand)}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <Pill
              tone={
                p.condition === "reconditioned"
                  ? "blue"
                  : p.condition === "gama-alta"
                    ? "purple"
                    : "green"
              }
            >
              {conditionLabel(p.condition)}
            </Pill>
            {p.gama && <Pill tone="slate">Gama: {p.gama}</Pill>}
            {p.badge && <Pill tone="primary">{p.badge}</Pill>}
            {p.campaign && (
              <Pill tone="amber">
                {p.campaign === "Navidad" ? "Oferta Especial" : p.campaign}
              </Pill>
            )}
            {classLbl && <Pill tone="slate">{classLbl}</Pill>}
            {pct !== null && pct > 0 && (
              <Pill tone="emerald">Descuento: -{pct}%</Pill>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="text-2xl font-bold text-primary">
              {formatMoneyPEN(p.price)}
            </div>
            {typeof p.oldPrice === "number" && p.oldPrice > p.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatMoneyPEN(p.oldPrice)}
              </div>
            )}
            <div className="text-sm text-gray-600">
              Stock:{" "}
              <span
                className={cx(
                  "font-semibold",
                  p.stock <= 0
                    ? "text-rose-700"
                    : p.stock <= 2
                      ? "text-amber-700"
                      : "text-emerald-700",
                )}
              >
                {p.stock}
              </span>
              {typeof p.oldStock === "number" ? (
                <span className="text-gray-400"> · antes: {p.oldStock}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(p.sub || p.description) && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="text-sm font-semibold text-gray-900">Descripción</div>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
            {p.sub ? p.sub : p.description}
          </p>
        </section>
      )}

      {/* Specs */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-900">
            Especificaciones
          </div>
          {p.technicalSheetUrl ? (
            <a
              href={p.technicalSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Descargar ficha técnica
            </a>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Spec label="Tipo" value={p.type} />
          <Spec label="Clasificación" value={classLbl ?? undefined} />
          <Spec label="Tecnología" value={p.displayTechnology} />
          <Spec label="Lúmenes ANSI" value={p.lumensANSI} />
          <Spec label="Resolución nativa" value={p.nativeResolution} />
          <Spec label="Aspecto" value={p.aspectRatio} />
          <Spec label="Contraste" value={p.contrastRatio} />
          <Spec label="Throw ratio" value={p.throwRatio} />
          <Spec label="Conectividad" value={p.connectivity} />
          <Spec label="Características" value={p.features} />
          <Spec
            label="Categoría"
            value={p.category?.length ? p.category.join(", ") : undefined}
          />
          <Spec label="Serial (SN)" value={p.SN} />
        </div>

        {p.note ? (
          <details className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">
              Notas y compatibilidad
            </summary>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              {p.note}
            </div>
          </details>
        ) : null}
      </section>

      {/* Price breakdown */}
      {p.subTotal !== undefined &&
        p.IGV !== undefined &&
        p.totalPayment !== undefined && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">
              Desglose de pago
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {typeof p.oldPrice === "number" &&
              typeof p.discount === "number" &&
              p.oldPrice > p.price ? (
                <Row
                  label="Ahorro estimado"
                  value={formatMoneyPEN(p.oldPrice - p.price)}
                  tone="good"
                />
              ) : null}
              <Row label="SubTotal" value={formatMoneyPEN(p.subTotal)} />
              <Row label="IGV (18%)" value={formatMoneyPEN(p.IGV)} />
              <Row
                label="Total a pagar"
                value={formatMoneyPEN(p.totalPayment)}
                strong
              />
            </div>
            {/* Button */}
            <a
              href={`https://wa.me/51972300301?text=${getWhatsAppMessage(p)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center inline-flex justify-center items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow transition"
            >
              Solicitar por WhatsApp
            </a>
          </section>
        )}

      {/* Media */}
      {p.media?.length ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="text-sm font-semibold text-gray-900">Media</div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {p.media.slice().map((m, idx) => (
              <a
                key={`${m.src}-${idx}`}
                href={m.src}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-gray-100 bg-gray-50 overflow-hidden hover:bg-gray-100"
                title={m.type}
              >
                <div className="relative w-full aspect-square">
                  {m.type === "image" ? (
                    <Image
                      src={m.src}
                      alt={p.name || p.model}
                      fill
                      className="object-contain"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      {m.type.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="px-2 py-2 text-[11px] text-gray-600 flex items-center justify-between">
                  <span className="font-semibold">{m.type}</span>
                  <span className="text-gray-400">Abrir</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Spec({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="text-[11px] font-semibold text-gray-600">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-900 break-words">
        {safeText(value)}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "good";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cx("text-gray-700", strong && "font-semibold")}>
        {label}
      </span>
      <span
        className={cx(
          "text-gray-900",
          strong && "font-bold text-primary",
          tone === "good" && "text-emerald-700 font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
