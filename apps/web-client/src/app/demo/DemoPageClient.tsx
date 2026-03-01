"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Product } from "@/data-list/products";

interface Props {
  demoProducts: Array<Product | undefined>;
}

export default function DemoPageClient({ demoProducts }: Props) {
  return (
    <main className="min-h-screen bg-[#060e1e] py-16 px-6 font-sfpro">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold tracking-wide uppercase text-sm">
            Demostraciones
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-3">
            Solicita una demo del producto que te interesa
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Selecciona el producto y agenda una demostración gratuita con
            nuestro equipo.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {demoProducts.map((product) => (
            <div
              key={product?.id}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 shadow-lg"
            >
              <div className="mb-6 rounded-2xl bg-white/5 p-4">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden ">
                  <Image
                    src={product?.mainImage || "/images/product-not-found.png"}
                    alt={product?.name || product?.model || "Producto"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {product?.name || product?.model}
              </h2>
              <p className="text-gray-400 mb-6">
                {product?.id === "bundle-interactivo"
                  ? "Vive en vivo y directo lo que el Bundle interactivo puede hacer en tu espacio de enseñanza o presentación"
                  : "Presencia como tu proyector o tv se transforma en una herramienta interactiva con el Dúo Interactivo"}
              </p>
              {product?.id && (
                <Link href={`/demo/${product.id}`}>
                  <Button variant="primary" styleVariant="filled" block>
                    Solicitar demo
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
