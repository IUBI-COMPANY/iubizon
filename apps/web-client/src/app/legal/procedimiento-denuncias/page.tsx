import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Procedimiento de Denuncias | iubizon",
  description:
    "Procedimiento de denuncias de iubizon. Canales seguros para reportar soborno, fraude, corrupción y otras infracciones.",
  keywords: [
    "denuncias",
    "procedimiento de denuncias",
    "canal de denuncias",
    "soborno",
    "fraude",
    "corrupción",
    "protección al denunciante",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/procedimiento-denuncias",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function ProcedimientoDenunciasPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          📢 Procedimiento de Denuncias
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Canal seguro de Integridad Corporativa{" "}
          <span className="text-amber-600 font-semibold">IUBIZON COMPANY SAC</span>
        </p>
      </div>

      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Introducción</h2>
          <p className="text-gray-700 leading-relaxed">
            IUBIZON COMPANY SAC se compromete a investigar de manera confidencial,
            objetiva e imparcial cualquier denuncia relacionada con conductas que
            violen nuestras políticas de integridad, cumplimiento legal o ética
            empresarial. Este procedimiento establece los canales, procesos y
            protecciones para los denunciantes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">¿Qué se puede denunciar?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cualquier trabajador puede denunciar las siguientes conductas:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Soborno</h3>
                <p className="text-gray-700 text-sm">
                  Ofrecimiento o aceptación de dinero, regalos, favores u otros
                  beneficios para influir indebidamente en decisiones comerciales
                  o administrativas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Fraude</h3>
                <p className="text-gray-700 text-sm">
                  Falsificación de documentos, facturación de servicios no prestados,
                  manipulación de registros contables o engaño deliberado para
                  obtener beneficio personal o de la empresa.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Robo</h3>
                <p className="text-gray-700 text-sm">
                  Apropiación indebida de bienes, herramientas, equipos, dinero o
                  cualquier propiedad de la empresa o de clientes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Corrupción</h3>
                <p className="text-gray-700 text-sm">
                  Abuso de poder o posición para obtener beneficio personal,
                  extorsión, chantaje o presión sobre colaboradores o clientes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Conflictos de Interés</h3>
                <p className="text-gray-700 text-sm">
                  Relaciones no reveladas con proveedores, clientes o competidores
                  que generen prejuicio para la empresa o ventaja personal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-800">Alteración de Documentos</h3>
                <p className="text-gray-700 text-sm">
                  Falsificación, modificación o destrucción de comprobantes,
                  facturas, contratos o registros contables para ocultar
                  irregularidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Canales de Denuncia</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            IUBIZON COMPANY SAC pone a disposición múltiples canales seguros para
            presentar denuncias con confidencialidad garantizada:
          </p>

          <div className="space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">📧 Correo Electrónico</h3>
              <p className="text-gray-700 text-sm mb-2">
                Envíe su denuncia a:
              </p>
              <p className="font-bold text-amber-700 text-sm">
                denuncias@iubizon.com
              </p>
              <p className="text-gray-700 text-sm mt-2">
                Incluya descripción detallada de los hechos, fecha, personas
                involucradas y cualquier evidencia disponible.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">💬 WhatsApp</h3>
              <p className="text-gray-700 text-sm mb-2">
                Comunicación segura a través de:
              </p>
              <p className="font-bold text-amber-700 text-sm">
                +51 972 300 301
              </p>
              <p className="text-gray-700 text-sm mt-2">
                Canal disponible 24/7. Use texto o multimedia para compartir
                evidencia o detalles de su denuncia.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">👤 Gerencia Directa</h3>
              <p className="text-gray-700 text-sm mb-2">
                Contacto directo:
              </p>
              <p className="font-bold text-amber-700 text-sm">
                Gerencia General / Gerencia de Operaciones
              </p>
              <p className="text-gray-700 text-sm mt-2">
                Solicite una reunión confidencial para presentar su denuncia
                de manera presencial.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">📬 Buzón Interno</h3>
              <p className="text-gray-700 text-sm mb-2">
                Disponible en:
              </p>
              <p className="font-bold text-amber-700 text-sm">
                Oficinas de iubizon - Calle Las Acacias 181, Chorrillos, Lima
              </p>
              <p className="text-gray-700 text-sm mt-2">
                Depósito anónimo de denuncias escritas. El buzón es revisado
                regularmente por gerencia de manera confidencial.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Proceso de Denuncia</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            El procedimiento de investigación de denuncias sigue estos pasos:
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="text-lg font-semibold text-gray-800">Recepción de Denuncia</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6">
                <li>
                  La denuncia es recibida a través de cualquiera de los canales
                  establecidos.
                </li>
                <li>
                  Se registra en un formulario confidencial con fecha, hora y
                  persona que recibe.
                </li>
                <li>
                  Al denunciante se le asigna un número de referencia anónimo
                  para rastrear el caso.
                </li>
                <li>
                  Confirmación de recepción al denunciante dentro de 24 horas.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="text-lg font-semibold text-gray-800">Investigación</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6">
                <li>
                  Gerencia designa un investigador independiente para evaluar
                  la denuncia dentro de 5 días hábiles.
                </li>
                <li>
                  Se revisa la evidencia presentada y se solicita información
                  adicional si es necesario.
                </li>
                <li>
                  Se entrevista a las personas involucradas de manera discreta,
                  sin revelar la identidad del denunciante.
                </li>
                <li>
                  Se examina documentación, registros contables o evidencia física.
                </li>
                <li>
                  Se evalúa la credibilidad y consistencia de la denuncia.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</span>
                <h3 className="text-lg font-semibold text-gray-800">Resultado de Investigación</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6">
                <li>
                  La investigación concluye en un reporte escrito e imparcial
                  dentro de 15 días hábiles.
                </li>
                <li>
                  Se determina si la denuncia tiene fundamento o no tiene
                  sustento en evidencia.
                </li>
                <li>
                  Se identifica el grado de gravedad si la denuncia es confirmada.
                </li>
                <li>
                  Se comunica el resultado al denunciante en el mismo canal
                  por el cual presentó la denuncia.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</span>
                <h3 className="text-lg font-semibold text-gray-800">Acciones Correctivas</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6">
                <li>
                  Si la denuncia es confirmada, se aplican las acciones
                  disciplinarias correspondientes según la gravedad.
                </li>
                <li>
                  <strong>Infracciones leves:</strong> Amonestación escrita,
                  capacitación, supervisión incrementada.
                </li>
                <li>
                  <strong>Infracciones graves:</strong> Descuento salarial,
                  suspensión temporal, reubicación laboral.
                </li>
                <li>
                  <strong>Infracciones muy graves:</strong> Terminación inmediata
                  del contrato de trabajo, denuncia ante autoridades penales.
                </li>
                <li>
                  Se adoptan medidas para prevenir que la conducta se repita.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Protección al Denunciante</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            IUBIZON COMPANY SAC garantiza protección integral al denunciante:
          </p>

          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ Confidencialidad</h3>
              <p className="text-gray-700 text-sm">
                La identidad del denunciante se mantiene en absoluta confidencialidad
                durante toda la investigación. Solo gerencia conoce su identidad.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ Anonimato</h3>
              <p className="text-gray-700 text-sm">
                Si lo prefiere, puede presentar su denuncia de forma anónima
                a través del buzón interno o correo electrónico no identificado.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ No Represalias</h3>
              <p className="text-gray-700 text-sm">
                Está prohibido tomar represalias contra un denunciante de buena fe,
                incluyendo: despido, cambio de posición, reducción de sueldo,
                acoso o cualquier trato discriminatorio. Las represalias constituyen
                infracción grave sujeta a terminación inmediata.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ Acción Rápida</h3>
              <p className="text-gray-700 text-sm">
                Las denuncias se investigan de manera expedita. El denunciante
                recibirá actualizaciones sobre el progreso de su caso dentro
                de plazos razonables.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ Documentación Segura</h3>
              <p className="text-gray-700 text-sm">
                Todos los archivos y comunicaciones relacionados con denuncias
                se mantienen bajo acceso restringido y protegidos contra
                divulgación no autorizada.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 pl-4 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">✓ Apoyo Psicosocial</h3>
              <p className="text-gray-700 text-sm">
                Si el denunciante sufre estrés o impacto emocional derivado
                de la denuncia, la empresa puede facilitar acceso a asesoría
                o servicios de apoyo confidenciales.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Requisitos para una Denuncia Válida</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para que una denuncia sea considerada válida, debe contener:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Descripción clara de los hechos:</strong> Qué ocurrió, cuándo
              y dónde.
            </li>
            <li>
              <strong>Identificación de personas involucradas:</strong> Nombres
              o roles de quienes cometieron la conducta.
            </li>
            <li>
              <strong>Evidencia o documentos:</strong> Cualquier prueba que respalde
              la denuncia (correos, registros, testimonios).
            </li>
            <li>
              <strong>Impacto o violación:</strong> Qué política, ley o valor
              corporativo fue incumplido.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4 text-sm text-amber-700">
            <strong>Nota:</strong> Las denuncias anónimas o sin bases suficientes
            aún serán consideradas si proporcionan detalles específicos que permitan
            investigación.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Denuncias Falsas o Malintencionadas</h2>
          <p className="text-gray-700 leading-relaxed">
            Si se determina que una denuncia fue presentada de forma malintencionada,
            con la intención de perjudicar a una persona o de causar daño sin base
            en hechos reales, la persona que presentó la denuncia falsa puede ser
            objeto de acciones disciplinarias, incluyendo terminación de contrato.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Vigencia</h2>
          <p className="text-gray-700 leading-relaxed">
            Este procedimiento entra en vigencia desde su publicación y es de
            cumplimiento obligatorio para todos los colaboradores de IUBIZON
            COMPANY SAC. Cualquier duda sobre este procedimiento puede dirigirse
            a gerencia.
          </p>
        </section>
      </div>

      <div className="text-center mt-12 text-sm text-gray-600">
        <p className="font-medium text-gray-800">IUBIZON COMPANY SAC</p>
        <p className="mt-2">Procedimiento de Denuncias</p>
        <p className="mt-2">RUC: 20614600374</p>
        <p className="mt-4 text-gray-500">Última actualización: Junio 2026</p>
      </div>
    </section>
  );
}

