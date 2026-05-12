import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Devoluciones y Cambios | iubizon",
  description:
    "Conoce nuestra política de devoluciones y cambios para productos tecnológicos. 15 días de garantía de satisfacción y reembolso completo en Perú.",
  keywords: [
    "política de devoluciones iubizon",
    "cambios productos tecnológicos",
    "garantía de satisfacción",
    "reembolso tecnología",
    "política de cambios perú",
    "devoluciones tecnología",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/politica-de-devoluciones-y-cambios",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function ReturnsAndExchangesPolicyPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          📜 Política de Devoluciones y Cambios
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Proyectores{" "}
          <span className="text-amber-600 font-semibold">IUBIZON</span>
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        {/* Section 1 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            1. Plazo general de devolución
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Aceptamos devoluciones dentro de los{" "}
            <strong>15 días calendario</strong> posteriores a la entrega del
            producto. Pasado este plazo, solo podrán gestionarse solicitudes por
            garantía técnica o soporte postventa.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            2. Condiciones generales para aceptar una devolución
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              El producto debe estar en su empaque original, con todos los
              accesorios incluidos.
            </li>
            <li>
              No debe presentar signos de uso excesivo, golpes o manipulación
              técnica.
            </li>
            <li>Debe incluir su comprobante de compra (boleta o factura).</li>
            <li>
              El tiempo de uso no debe superar el 10% de su vida útil estimada.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            3. Proyección de satisfacción
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Si dentro de los primeros 10 días tu proyector no se adapta al
            espacio, podrás cambiarlo por otro modelo más adecuado pagando o
            recibiendo la diferencia correspondiente.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            4. Reembolso
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Una vez recibido el producto y verificado su estado, el reembolso se
            realizará en un plazo de 7 a 10 días hábiles mediante el mismo
            método de pago utilizado.
          </p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            5. Costos de envío y logística
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              Si la devolución se debe a un error o defecto del producto,
              IUBIZON cubrirá el 100% del envío.
            </li>
            <li>
              Si es por cambio de modelo o decisión del cliente, el cliente
              asumirá el costo de transporte con tarifa reducida.
            </li>
            <li>
              Si el producto fue entregado sellado y nunca abierto, el costo de
              reenvío se reduce al 50%.
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            6. Casos especiales
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Proyectores personalizados o con configuración especial no son
            reembolsables, salvo falla técnica. Si el problema ocurre durante
            los primeros 7 días, se considerará “defecto inicial” y el cambio
            será inmediato.
          </p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            7. Garantía extendida y soporte postventa
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Todos nuestros proyectores cuentan con una garantía mínima de 12
            meses y una garantía extendida de satisfacción técnica de 30 días.
          </p>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            8. Responsabilidad compartida
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Antes de procesar una devolución, revisaremos contigo las posibles
            soluciones: ajustes, limpieza o configuración, para evitar
            devoluciones innecesarias.
          </p>
        </div>

        {/* Section 9 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            9. Proceso de solicitud
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Contáctanos por formulario o WhatsApp indicando el motivo.</li>
            <li>
              Tu solicitud será validada en un máximo de 48 horas hábiles.
            </li>
            <li>Recibirás una guía de envío o la programación de recojo.</li>
          </ol>
        </div>

        {/* Section 10 */}
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            10. Compromiso IUBIZON
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Queremos que cada cliente se sienta respaldado antes, durante y
            después de su compra. Basamos nuestra política en tres principios:{" "}
            <strong>
              Transparencia total, Respaldo técnico real y Respeto mutuo.
            </strong>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-gray-500">
        Última actualización: <span className="font-medium">Octubre 2025</span>
      </div>
    </section>
  );
}
