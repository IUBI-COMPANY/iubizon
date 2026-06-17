import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acta de Designación del Oficial de Cumplimiento | iubizon",
  description:
    "Acta de designación del Oficial de Cumplimiento Antisoborno de iubizon. Documento formal de designación de responsabilidades de integridad corporativa.",
  keywords: [
    "oficial de cumplimiento",
    "acta de designación",
    "compliance officer",
    "cumplimiento antisoborno",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/acta-designacion-oficial-cumplimiento",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function ActaDesignacionOfficialPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <div className="bg-white shadow-md rounded-3xl p-12 border border-gray-100">
        {/* Header */}
        <div className="text-center border-b-2 border-amber-600 pb-6 mb-8">
          <h1 className="text-2xl font-bold text-amber-600 mb-2">
            ACTA DE DESIGNACIÓN DEL OFICIAL DE CUMPLIMIENTO
          </h1>
          <p className="text-sm font-semibold text-gray-700">
            IUBIZON COMPANY SAC
          </p>
          <p className="text-xs text-gray-600">RUC: 20614600374</p>
        </div>

        {/* Acta Number and Date */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-800">
            ACTA N° 001-2026
          </p>
          <p className="text-sm text-gray-700">
            Lima, 16 de junio de 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-justify">
          <p className="text-gray-700 leading-relaxed">
            La Gerencia General de IUBIZON COMPANY SAC, en el marco de su
            compromiso con la integridad corporativa y el cumplimiento de la
            Ley Peruana contra la Corrupción, <strong>DESIGNA</strong> como
            <strong> Oficial de Cumplimiento Antisoborno</strong> al Gerente
            General de la empresa, quien ejercerá estas funciones de forma
            permanente hasta ser revocada esta designación por escrito.
          </p>

          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4">
              El Oficial de Cumplimiento Antisoborno tendrá las siguientes
              responsabilidades:
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-2">
              <li>
                <strong>Supervisar el cumplimiento</strong> del Código de Ética
                y Políticas de Integridad en todos los niveles de la
                organización.
              </li>
              <li>
                <strong>Promover la cultura de integridad</strong> mediante
                capacitación, comunicación y ejemplo personal a todos los
                colaboradores.
              </li>
              <li>
                <strong>Atender denuncias</strong> relacionadas con soborno,
                corrupción, fraude y otras infracciones, garantizando
                confidencialidad e imparcialidad en la investigación.
              </li>
              <li>
                <strong>Gestionar conflictos de interés</strong> identificando
                y resolviendo situaciones que generen riesgos de corrupción.
              </li>
              <li>
                <strong>Revisar periódicamente</strong> la Política Antisoborno
                y Manual de Prevención, proponiéndole mejoras a Gerencia cuando
                sea necesario.
              </li>
              <li>
                <strong>Mantener registros</strong> de todas las denuncias,
                investigaciones y acciones correctivas implementadas.
              </li>
              <li>
                <strong>Reportar a Gerencia General</strong> de manera semestral
                sobre el estado de cumplimiento y cualquier riesgo detectado.
              </li>
              <li>
                <strong>Coordinar con proveedores</strong> para asegurar que
                cumplan con las cláusulas antisoborno en los contratos.
              </li>
            </ol>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm italic">
            El Oficial de Cumplimiento actúa de forma independiente en sus
            investigaciones, sin presión de jerarcas o intereses comerciales,
            y con autoridad para acceder a documentación, registros contables
            y comunicaciones cuando sea necesario para la investigación.
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded">
            <p className="text-xs text-gray-700">
              <strong>Vigencia:</strong> Esta designación entra en vigencia desde
              la redacción de esta acta y permanece vigente hasta ser revocada
              formalmente por la Gerencia General.
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="grid grid-cols-1 gap-8 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-12">
                _________________________________
              </p>
              <p className="text-sm font-bold text-gray-800">
                Gerente General
              </p>
              <p className="text-xs text-gray-600">
                IUBIZON COMPANY SAC
              </p>
              <p className="text-xs text-gray-600 mt-1">
                DNI/RUC: ___________________
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>Documento oficial de IUBIZON COMPANY SAC</p>
          <p className="mt-1">RUC: 20614600374</p>
          <p className="mt-2">Calle Las Acacias 181, Chorrillos, Lima - Perú</p>
        </div>
      </div>
    </section>
  );
}

