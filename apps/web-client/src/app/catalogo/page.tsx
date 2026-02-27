"use client";

import React, { useMemo, useState } from "react";
import { oldProducts } from "@/data-list/oldProducts";
import Image from "next/image";

const uniqueTypes = Array.from(
  new Set(oldProducts.map((p) => p.type).filter(Boolean)),
);

export default function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [condition, setCondition] = useState<string>("");

  const filtered = useMemo(() => {
    return oldProducts.filter((p) => {
      const matchesName = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchesType = type ? p.type === type : true;
      const matchesCondition = condition ? p.condition === condition : true;
      return matchesName && matchesType && matchesCondition;
    });
  }, [search, type, condition]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Productos</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/2"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-1/4"
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
          className="border rounded px-3 py-2 w-full md:w-1/4"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="new">Nuevo</option>
          <option value="reconditioned">Reacondicionado</option>
        </select>
        <button
          type="button"
          className="border rounded px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold w-full md:w-auto"
          onClick={() => {
            setSearch("");
            setType("");
            setCondition("");
          }}
        >
          Limpiar filtros
        </button>
      </div>
      <ul className="space-y-8">
        {filtered.map((product) => (
          <li
            key={product.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6 border border-gray-100"
          >
            <div className="shrink-0 w-full md:w-48 h-48 relative">
              {product.mainImage && (
                <Image
                  src={product.mainImage}
                  alt={product.name || product.model}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xl font-bold text-primary">
                  {product.name}
                </span>
                {product.badge && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                    {product.badge}
                  </span>
                )}
                {product.campaign && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold">
                    {product.campaign === "Navidad"
                      ? "Oferta Especial"
                      : product.campaign}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${product.condition === "reconditioned" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                >
                  {product.condition === "reconditioned"
                    ? "Reacondicionado"
                    : "Nuevo"}
                </span>
              </div>
              <div className="text-gray-600 text-sm mb-2">
                {product.description}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span>
                  <b>Marca:</b> {product.brand}
                </span>
                <span>
                  <b>Modelo:</b> {product.model}
                </span>
                <span>
                  <b>Tipo:</b> {product.type}
                </span>
                <span>
                  <b>Condición:</b> {product.condition}
                </span>
                {product.gama && (
                  <span>
                    <b>Gama:</b> {product.gama}
                  </span>
                )}
                {product.lumensANSI && (
                  <span>
                    <b>Lúmenes:</b> {product.lumensANSI}
                  </span>
                )}
                {product.nativeResolution && (
                  <span>
                    <b>Resolución:</b> {product.nativeResolution}
                  </span>
                )}
                {product.aspectRatio && (
                  <span>
                    <b>Aspecto:</b> {product.aspectRatio}
                  </span>
                )}
                {product.contrastRatio && (
                  <span>
                    <b>Contraste:</b> {product.contrastRatio}
                  </span>
                )}
                {product.connectivity && (
                  <span>
                    <b>Conectividad:</b> {product.connectivity}
                  </span>
                )}
                {product.features && (
                  <span>
                    <b>Características:</b> {product.features}
                  </span>
                )}
                {product.category && product.category.length > 0 && (
                  <span>
                    <b>Categoría:</b> {product.category.join(", ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 items-center mt-2">
                <span className="text-2xl font-bold text-primary">
                  S/{" "}
                  {product.price.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    S/{" "}
                    {product.oldPrice.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                    -
                    {Math.round(
                      (product.discount / (product.oldPrice || 1)) * 100,
                    )}
                    % dscto
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>
              {/* Desglose de precios */}
              {product.subTotal !== undefined &&
                product.IGV !== undefined &&
                product.totalPayment !== undefined && (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 w-full max-w-xs">
                    {product.discount && product.oldPrice && (
                      <div className="flex justify-between mb-1 text-green-700 font-semibold">
                        <span>Descuento</span>
                        <span>
                          -S/{" "}
                          {product.discount.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-1">
                      <span>SubTotal</span>
                      <span>
                        S/{" "}
                        {product.subTotal.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>IGV (18%)</span>
                      <span>
                        S/{" "}
                        {product.IGV.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>Total a Pagar</span>
                      <span>
                        S/{" "}
                        {product.totalPayment.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              {product.technicalSheetUrl && (
                <a
                  href={product.technicalSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mt-1 inline-block"
                >
                  Descargar ficha técnica
                </a>
              )}
              {product.note && (
                <details className="mt-2 text-xs text-gray-700 whitespace-pre-line">
                  <summary className="cursor-pointer font-semibold">
                    Notas y compatibilidad
                  </summary>
                  <div className="mt-1">{product.note}</div>
                </details>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center text-gray-400 py-12">
            No se encontraron productos.
          </li>
        )}
      </ul>
    </div>
  );
}
