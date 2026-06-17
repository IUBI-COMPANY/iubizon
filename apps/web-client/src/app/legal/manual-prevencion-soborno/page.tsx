import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manual de Prevención de Soborno | iubizon",
  description:
    "Manual de prevención de soborno de iubizon. Identificación de riesgos y controles internos para garantizar integridad operativa.",
  keywords: [
    "manual de prevención",
    "soborno",
    "controles internos",
    "riesgos operativos",
    "integridad",
    "compras",
    "ventas",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/manual-prevencion-soborno",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function ManualPrevencionSobornoPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          📘 Manual de Prevención de Soborno
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Procedimientos y Controles Operativos{" "}
          <span className="text-amber-600 font-semibold">IUBIZON COMPANY SAC</span>
        </p>
      </div>

      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Introducción</h2>
          <p className="text-gray-700 leading-relaxed">
            Este manual describe los procedimientos, procesos y controles internos
            implementados por IUBIZON COMPANY SAC para prevenir, detectar y mitigar
            riesgos de soborno y corrupción en nuestras operaciones comerciales.
            El documento identifica áreas de riesgo específicas en nuestra actividad
            y establece controles prácticos y documentados para cada área.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Riesgos Identificados</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            IUBIZON COMPANY SAC ha identificado los siguientes riesgos de soborno
            en sus operaciones:
          </p>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              1. Venta al Estado (Contratación Pública)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Presión para ofrecer ventajas indebidas a funcionarios para ganar licitaciones.</li>
              <li>Contacto directo con funcionarios públicos que pueden solicitar comisiones.</li>
              <li>Procesos de licitación complejos donde pueden existir oportunidades de colusión.</li>
              <li>Presión comercial para acelerar procedimientos administrativos.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Todo proceso de contratación pública se documenta íntegramente. No se permitirán contactos personales con funcionarios fuera de procesos formales.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              2. Servicio Técnico y Reparaciones
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Técnicos pueden inflar diagnósticos o recomendar reparaciones innecesarias.</li>
              <li>Falta de documentación de trabajos realizados puede facilitar fraude.</li>
              <li>Comisiones a técnicos por reparaciones pueden incentivar corrupción.</li>
              <li>Clientes corporativos pueden presionar para favores sin costo.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Todo trabajo técnico requiere orden de servicio documentada. Se realizan auditorías aleatorias de trabajos.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              3. Compras y Adquisiciones
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Encargados de compra pueden aceptar regalos o comisiones de proveedores.</li>
              <li>Favoritismo hacia proveedores por relaciones personales.</li>
              <li>Sobreprecio en adquisiciones por compensaciones paralelas.</li>
              <li>Conflictos de interés si comprador tiene relación con proveedor.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Todas las compras requieren cotización de múltiples proveedores (mínimo 3 para compras mayores a S/ 5,000).
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              4. Contratación de Proveedores y Servicios
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Selección de proveedores basada en favoritismo o beneficios personales.</li>
              <li>Empresas proveedoras fantasma o testaferros que ocultan relaciones ilícitas.</li>
              <li>Precios inflados en contratos que benefician a proveedores relacionados.</li>
              <li>Falta de evaluación de antecedentes de proveedores.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Evaluación documentada de proveedores con criterios: RUC, antecedentes legales, calidad, precio, referencias.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              5. Gestión de Garantías y Reclamos
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Funcionarios de garantía pueden aprobar reclamos indebidos por presión comercial.</li>
              <li>Manipulación de criterios de cobertura a favor de clientes específicos.</li>
              <li>Aceptación de reclamos fuera de plazo para favorecer clientes corporativos.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Criterios de garantía publicados y claros. Decisiones documentadas con justificación técnica. Auditoría trimestral de reclamaciones.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3">
              6. Facturación e Ingresos
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Descripción del riesgo:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Facturación por servicios no prestados o productos no entregados.</li>
              <li>Descuentos no documentados que generan pérdida de ingresos.</li>
              <li>Facturas falsas o con datos incompletos para evitar fiscales.</li>
              <li>Colusión con clientes para realizar operaciones irregulares.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Mitigación:</strong> Todas las operaciones se facturan. No se aceptan ventas en efectivo sin documento. Auditoría mensual de ingresos.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Controles Implementados</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            IUBIZON COMPANY SAC ha implementado controles específicos en cada área de operación:
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Cotizaciones Documentadas</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Toda compra requiere cotización escrita de al menos 3 proveedores.</li>
              <li>Las cotizaciones incluyen: descripción, cantidad, precio unitario, total, plazo, garantía.</li>
              <li>Se mantiene archivo organizado de todas las cotizaciones recibidas.</li>
              <li>Se genera comparativo escrito con análisis de criterios de selección.</li>
              <li>La selección del proveedor se justifica documentadamente.</li>
            </ul>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia de Operaciones</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Aprobación de Compras</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Compras menores a S/ 1,000: Aprobación del responsable del área.</li>
              <li>Compras de S/ 1,000 a S/ 5,000: Aprobación de Gerencia de Operaciones.</li>
              <li>Compras mayores a S/ 5,000: Aprobación de Gerencia General.</li>
              <li>Toda aprobación se realiza por escrito con respaldo documental.</li>
              <li>Se mantiene evidencia de autorizaciones en archivo.</li>
            </ul>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia General</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Registro de Pagos</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Todo pago debe estar respaldado por orden de compra, factura y constancia de entrega.</li>
              <li>Pagos mediante transferencia bancaria o cheque (nunca efectivo para montos mayores a S/ 500).</li>
              <li>Registro en sistema contable con fecha, beneficiario, concepto y referencias.</li>
              <li>Conciliación bancaria mensual para verificar que pagos coincidan con facturas.</li>
              <li>Auditoría trimestral de pagos para detectar irregularidades.</li>
            </ul>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia Financiera</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Evaluación de Proveedores</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li><strong>Legal:</strong> Verificación de RUC, estado tributario, domicilio registrado.</li>
              <li><strong>Antecedentes:</strong> Consulta en SUNAT y bases de datos públicas.</li>
              <li><strong>Experiencia:</strong> Referencias de otros clientes, años en operación.</li>
              <li><strong>Técnica:</strong> Certificaciones, equipamiento, personal calificado.</li>
              <li><strong>Normativa:</strong> Declaración de conformidad con leyes laborales y ambientales.</li>
              <li>Reevaluación anual de proveedores activos.</li>
            </ul>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia de Operaciones</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Archivo de Contratos</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Todos los contratos con proveedores se formalizan por escrito.</li>
              <li>Incluyen: objeto, precio, plazo, condiciones, garantía, cláusulas antisoborno.</li>
              <li>Archivo organizado por proveedor y período, con acceso controlado.</li>
              <li>Registro de vigencia de contratos con alerta de renovación próxima.</li>
              <li>Copia firmada en poder de ambas partes.</li>
              <li>Auditoría semestral para verificar cumplimiento de términos.</li>
            </ul>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia General</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✓ Separación de Funciones</h3>
            <p className="text-gray-700 leading-relaxed mb-3"><strong>Procedimiento:</strong></p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li><strong>Solicitud:</strong> Realizada por responsable del área que requiere.</li>
              <li><strong>Aprobación:</strong> Realizada por gerencia operativa o general.</li>
              <li><strong>Selección:</strong> Basada en cotizaciones y evaluación documentada.</li>
              <li><strong>Recepción:</strong> Verificada por responsable del área o custodio.</li>
              <li><strong>Pago:</strong> Realizado por gerencia financiera con documentación completa.</li>
              <li><strong>Verificación:</strong> Auditoría independiente de transacciones.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3 text-sm">
              Nota: En empresas pequeñas se implementan controles compensatorios como aprobación por personas diferentes y auditoría regular.
            </p>
            <p className="font-semibold text-amber-700 mt-3 text-sm">Responsable: Gerencia General</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Procedimientos por Área de Operación</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Venta al Estado</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Las licitaciones se participan por procesos formales (SEACE, OSCE).</li>
              <li>Propuestas son verificadas antes de presentación; no contienen información falsa.</li>
              <li>No se realizan contactos informales con funcionarios públicos.</li>
              <li>Los contactos comerciales se documentan y formalizan por escrito.</li>
              <li>Si un funcionario solicita beneficio indebido, se rechaza e inmediatamente reporta.</li>
              <li>El contrato se ejecuta conforme a especificaciones sin reclamos infundados.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Servicio Técnico</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Toda solicitud genera orden de servicio escrita con fecha y descripción.</li>
              <li>El técnico realiza diagnóstico documentado: qué encontró, estado, trabajo realizado.</li>
              <li>Se proporciona presupuesto al cliente antes de trabajos mayores.</li>
              <li>El trabajo realizado se documenta con comprobante de horas y repuestos.</li>
              <li>Auditoría mensual de trabajos para verificar consistencia de diagnósticos.</li>
              <li>Los técnicos reciben capacitación ética; sin incentivos para servicios innecesarios.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Compras</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Área de operaciones identifica necesidad de compra.</li>
              <li>Se solicitan cotizaciones a múltiples proveedores (mínimo 3 si supera S/ 5,000).</li>
              <li>Se comparan precios, plazos, calidad, referencias en análisis comparativo.</li>
              <li>Se selecciona proveedor con mejor relación precio-calidad.</li>
              <li>Aprobación conforme a límites de autorización.</li>
              <li>Orden de compra escrita emitida al proveedor seleccionado.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contratación de Proveedores</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Identificación de necesidad de servicio de tercero.</li>
              <li>Búsqueda de opciones: referencias, búsqueda de mercado, solicitud de propuestas.</li>
              <li>Evaluación documentada: RUC vigente, experiencia, referencias, presupuesto.</li>
              <li>Selección y negociación de términos comerciales.</li>
              <li>Contrato escrito incluye: objeto, precio, plazo, responsabilidades, garantía.</li>
              <li>Firma de declaración antisoborno como cláusula del contrato.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Gestión de Garantías</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Cliente contacta con reclamo de garantía (defecto, falla técnica).</li>
              <li>Se registra con fecha, descripción del problema, datos de compra.</li>
              <li>Se verifica si el producto está en plazo de garantía y cobertura incluida.</li>
              <li>Si no cumple criterios, se comunica motivo con referencia a términos publicados.</li>
              <li>Si cumple, se autoriza reparación o reemplazo conforme a política.</li>
              <li>Decisiones de garantía se documentan y archivan.</li>
              <li>No se aprueban reclamos fuera de plazo solo por presión comercial.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Facturación e Ingresos</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Toda venta se genera desde cotización aprobada o pedido del cliente.</li>
              <li>Se verifica: cliente, producto/servicio, cantidad, precio.</li>
              <li>Se emite factura con todos los datos requeridos por SUNAT.</li>
              <li>No se aceptan operaciones sin factura.</li>
              <li>Descuentos requieren autorización escrita de gerencia documentados.</li>
              <li>Conciliación diaria de ingresos en caja y banco.</li>
              <li>Auditoría mensual de ingresos versus facturas emitidas.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Monitoreo y Auditoría</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IUBIZON COMPANY SAC realiza monitoreo continuo y auditorías periódicas para asegurar cumplimiento de controles:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li><strong>Mensual:</strong> Auditoría de ingresos, conciliación bancaria, revisión de pagos mayores.</li>
            <li><strong>Trimestral:</strong> Revisión de reclamaciones de garantía, auditoría de trabajos técnicos, evaluación de proveedores.</li>
            <li><strong>Semestral:</strong> Revisión de cumplimiento de contratos, reevaluación de proveedores clave.</li>
            <li><strong>Anual:</strong> Auditoría integral de cumplimiento de política antisoborno, evaluación de controles, capacitación de personal.</li>
            <li><strong>Ocasional:</strong> Auditoría sorpresiva de áreas de alto riesgo cuando sea necesario.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Los resultados de auditorías se documentan y comunican a gerencia. Las deficiencias se corrigen inmediatamente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Conclusión</h2>
          <p className="text-gray-700 leading-relaxed">
            Este manual describe los controles operativos implementados por IUBIZON COMPANY SAC para prevenir soborno y corrupción. Los controles están diseñados para ser prácticos en una empresa pequeña y se adaptan a recursos disponibles. La efectividad de estos controles depende del cumplimiento consistente por parte de todos los colaboradores y del monitoreo regular por gerencia.
          </p>
        </section>
      </div>

      <div className="text-center mt-12 text-sm text-gray-600">
        <p className="font-medium text-gray-800">IUBIZON COMPANY SAC</p>
        <p className="mt-2">Manual de Prevención de Soborno</p>
        <p className="mt-2">RUC: 20614600374</p>
        <p className="mt-4 text-gray-500">Última actualización: Junio 2026</p>
      </div>
    </section>
  );
}
