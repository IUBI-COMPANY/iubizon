import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Garantía | iubizon",
  description:
    "Conoce nuestra política de garantía comercial de 12 meses para productos nuevos. Derechos del consumidor en Perú.",
  keywords: [
    "política de garantía iubizon",
    "garantía 12 meses",
    "garantía productos tecnológicos",
    "garantía perú",
    "derechos del consumidor",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/garantia",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function Page() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          📋 Política de Garantía Comercial
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Productos Premium comercializados por{" "}
          <span className="text-amber-600 font-semibold">IUBIZON COMPANY SAC</span>
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        {/* Introducción */}
        <div>
          <p className="text-gray-700 leading-relaxed">
            La presente Política de Garantía Comercial regula las condiciones
            aplicables a los productos Premium comercializados por IUBIZON
            COMPANY SAC dentro del territorio de la República del Perú. Esta
            política se interpreta de manera sistemática con la normativa de
            protección al consumidor vigente y con los términos de venta
            aceptados al momento de la compra.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            1. Objeto y Plazo de Cobertura
          </h2>
          <p className="text-gray-700 leading-relaxed">
            IUBIZON COMPANY SAC otorga una garantía comercial de doce (12)
            meses, computados desde la fecha de emisión del comprobante de
            pago, exclusivamente respecto de defectos de fabricación o fallas
            técnicas no atribuibles al uso inadecuado del producto.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            La cobertura aplica únicamente a productos Premium comercializados
            por IUBIZON COMPANY SAC y sujetos a identificación mediante número
            de serie u otro mecanismo de trazabilidad definido por la empresa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            2. Titularidad y Requisitos de Atención
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Para acceder a la garantía, el solicitante deberá acreditar de
            forma concurrente:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li>Identidad del titular o representante autorizado.</li>
            <li>
              Comprobante de pago legible emitido por IUBIZON COMPANY SAC.
            </li>
            <li>
              Coincidencia del producto con su número de serie o etiqueta
              original.
            </li>
            <li>
              Entrega del producto completo para diagnóstico técnico cuando
              corresponda.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            La falta de cualquiera de estos requisitos faculta a IUBIZON
            COMPANY SAC a suspender el procedimiento hasta su regularización.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            3. Alcance de la Garantía
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Verificada la procedencia de la garantía, IUBIZON COMPANY SAC,
            conforme a evaluación técnica y disponibilidad operativa, aplicará
            una de las siguientes medidas en orden de razonabilidad
            empresarial:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li>
              Diagnóstico y reparación del producto sin costo por mano de obra
              cubierta.
            </li>
            <li>
              Reemplazo por unidad equivalente, nueva o reacondicionada
              certificada.
            </li>
            <li>
              Emisión de nota de crédito o solución comercial equivalente.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            La decisión sobre la medida idónea corresponde a IUBIZON COMPANY
            SAC, sin perjuicio de los derechos mínimos reconocidos por la
            normativa aplicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            4. Exclusiones y Causales de Improcedencia
          </h2>
          <p className="text-gray-700 leading-relaxed">La garantía no cubre, entre otros supuestos:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li>
              Daños por uso indebido, negligencia, golpes, humedad, líquidos o
              sobrecarga eléctrica.
            </li>
            <li>
              Desgaste normal por uso, consumibles, accesorios y piezas de
              recambio periódico.
            </li>
            <li>
              Manipulación, reparación o intervención por terceros no
              autorizados.
            </li>
            <li>
              Alteración, remoción o ilegibilidad del número de serie o sellos
              de control.
            </li>
            <li>
              Eventos de caso fortuito, fuerza mayor o causas externas no
              imputables a iubizon.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            5. Procedimiento y Plazos de Atención
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Todo ingreso por garantía se sujeta a registro de recepción y
            evaluación técnica previa. Los plazos de atención serán informados
            caso por caso en función de la naturaleza de la falla,
            disponibilidad de repuestos y tiempos logísticos razonables.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Cuando se requiera información adicional o validación documental,
            el cómputo de plazos podrá suspenderse hasta que el consumidor
            subsane lo requerido.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            6. Derechos del Consumidor en el Perú
          </h2>
          <p className="text-gray-700 leading-relaxed">
            La presente política no desconoce los derechos irrenunciables del
            consumidor previstos por la legislación peruana vigente. Cualquier
            controversia podrá ser canalizada ante la autoridad competente,
            sin perjuicio de los mecanismos de solución directa ofrecidos por
            IUBIZON COMPANY SAC.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            7. Modificaciones de la Política
          </h2>
          <p className="text-gray-700 leading-relaxed">
            IUBIZON COMPANY SAC podrá modificar la presente Política de
            Garantía Comercial en cualquier momento. Toda modificación tendrá
            aplicación prospectiva desde su fecha de publicación y no afectará
            procedimientos de garantía ya iniciados con anterioridad.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-gray-600">
        <p className="font-medium text-gray-800">IUBIZON COMPANY SAC</p>
        <p className="mt-2">RUC: 20614600374</p>
        <p className="mt-2">
          Domicilio legal: CAL. LAS ACACIAS NRO. 181 URB. LA VILLA LIMA - LIMA
          - CHORRILLOS
        </p>
        <p className="mt-4 text-gray-500">Última actualización: 01/09/2025</p>
      </div>
    </section>
  );
}
