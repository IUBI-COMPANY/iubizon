"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Product } from "@/data-list/products";
import { DemoStepsGroup } from "@/app/sections/demo/DemoStepsGroup";

interface Props {
  product: Product;
}

export default function DemoProductClientPage({ product }: Props) {
  return (
    <main className="min-h-screen bg-[#060e1e] py-12 px-6 font-sfpro">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-white/5 mb-6">
              <Image
                src={product.mainImage || "/images/product-not-found.png"}
                alt={product.name || product.model || "Producto"}
                fill
                className="object-contain p-6"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {product.name || product.model}
            </h1>
            <p className="text-gray-400 mt-3">
              Solicita una demostración para conocer el producto en detalle y
              resolver tus dudas con nuestro equipo.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Agenda tu demo</h2>
              <p className="text-gray-400 mt-2">
                Completa el formulario y coordinaremos la demostración.
              </p>
            </div>
            <DemoStepsGroup product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
