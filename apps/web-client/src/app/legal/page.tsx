import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentos Legales | iubizon",
  description:
    "Centro de documentos legales, políticas y procedimientos de integridad corporativa de iubizon.",
  keywords: [
    "documentos legales",
    "políticas",
    "procedimientos",
    "garantía",
    "ética",
    "integridad",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function LegalPage() {
  const documents = [
    {
      id: 1,
      title: "Política de Garantía",
      description: "Política de garantía comercial de 12 meses para productos Premium",
      icon: "📋",
      href: "/legal/garantia",
      category: "Productos"
    },
    {
      id: 2,
      title: "Política de Devoluciones y Cambios",
      description: "Condiciones generales para devoluciones y cambios de productos",
      icon: "🔄",
      href: "/legal/politica-de-devoluciones-y-cambios",
      category: "Productos"
    },
    {
      id: 3,
      title: "Código de Ética",
      description: "Principios de integridad, honestidad y transparencia en nuestras operaciones",
      icon: "📖",
      href: "/legal/codigo-de-etica",
      category: "Integridad"
    },
    {
      id: 4,
      title: "Política Antisoborno y Anticorrupción",
      description: "Marco de actuación para prevenir, detectar y sancionar soborno y corrupción",
      icon: "🛡️",
      href: "/legal/politica-antisoborno-anticorrupcion",
      category: "Integridad"
    },
    {
      id: 5,
      title: "Manual de Prevención de Soborno",
      description: "Procedimientos y controles operativos para prevenir riesgos de corrupción",
      icon: "📘",
      href: "/legal/manual-prevencion-soborno",
      category: "Integridad"
    },
    {
      id: 6,
      title: "Procedimiento de Denuncias",
      description: "Canales seguros y protección para reportar infracciones y conductas irregulares",
      icon: "📢",
      href: "/legal/procedimiento-denuncias",
      category: "Integridad"
    },
    {
      id: 7,
      title: "Acta de Designación del Oficial de Cumplimiento",
      description: "Documento oficial de designación del responsable de integridad corporativa",
      icon: "✅",
      href: "/legal/acta-designacion-oficial-cumplimiento",
      category: "Integridad"
    }
  ];

  const productDocs = documents.filter(doc => doc.category === "Productos");
  const integrityDocs = documents.filter(doc => doc.category === "Integridad");

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-600 mb-4">
            📚 Centro de Documentos Legales
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Accede a todas nuestras políticas, procedimientos y documentos de
            integridad corporativa. Conoce nuestro compromiso con la transparencia
            y el cumplimiento legal.
          </p>
        </div>

        {/* Documentos de Productos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🛍️</span> Políticas de Productos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productDocs.map(doc => (
              <Link
                key={doc.id}
                href={doc.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-amber-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {doc.description}
                    </p>
                    <span className="inline-block mt-3 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                      Ver documento →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Documentos de Integridad */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔐</span> Sistema de Integridad Corporativa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrityDocs.map(doc => (
              <Link
                key={doc.id}
                href={doc.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-amber-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {doc.description}
                    </p>
                    <span className="inline-block mt-3 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                      Ver documento →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-amber-50 border-l-4 border-amber-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            ✨ Nuestro Compromiso
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Todos los documentos de iubizon están diseñados bajo los principios de
            integridad, transparencia y cumplimiento de la ley peruana. Cualquier
            duda o consulta sobre estas políticas puede dirigirse a nuestra
            Gerencia General o a través del canal de denuncias.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Para reportar irregularidades:{" "}
            <span className="font-semibold text-amber-600">iubizon.company@gmail.com</span>
          </p>
          <p className="mt-2">
            WhatsApp:{" "}
            <span className="font-semibold text-amber-600">+51 972 300 301</span>
          </p>
        </div>
      </div>
    </section>
  );
}

