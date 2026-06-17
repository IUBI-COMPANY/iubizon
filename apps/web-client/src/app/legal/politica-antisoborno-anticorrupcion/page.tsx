import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política Antisoborno y Anticorrupción | iubizon",
  description:
    "Política de antisoborno y anticorrupción de iubizon. Compromiso con la integridad en todas nuestras operaciones comerciales.",
  keywords: [
    "política antisoborno",
    "anticorrupción",
    "integridad comercial",
    "cumplimiento legal",
    "transparencia empresarial",
    "UNCAC",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/politica-antisoborno-anticorrupcion",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function PoliticaAntisobornoPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          🛡️ Política Antisoborno y Anticorrupción
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Sistema de Integridad Corporativa{" "}
          <span className="text-amber-600 font-semibold">IUBIZON COMPANY SAC</span>
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        {/* Objetivo */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Objetivo</h2>
          <p className="text-gray-700 leading-relaxed">
            Establecer un Marco de actuación que prevenga, detecte y sancione
            cualquier forma de soborno, corrupción y prácticas ilícitas en las
            operaciones de IUBIZON COMPANY SAC. Esta política busca garantizar
            que todos nuestros colaboradores, proveedores y socios comerciales
            actúen bajo principios de integridad y transparencia, cumpliendo
            con la legislación peruana y los estándares internacionales de
            combate a la corrupción.
          </p>
        </section>

        {/* Alcance */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Alcance</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Esta política es de aplicación obligatoria para:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Todos los colaboradores de IUBIZON COMPANY SAC.</li>
            <li>Directivos y gerentes en cualquier nivel.</li>
            <li>Contratistas y servicios tercurizados.</li>
            <li>Proveedores y distribuidores autorizados.</li>
            <li>Socios comerciales y alianzas estratégicas.</li>
            <li>Cualquier persona que actúe en representación de la empresa.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            La cobertura geográfica incluye todas las operaciones realizadas en
            territorio peruano y en el extranjero cuando involucren a IUBIZON
            COMPANY SAC.
          </p>
        </section>

        {/* Compromiso de la Gerencia */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Compromiso de la Gerencia</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La dirección de IUBIZON COMPANY SAC se compromete a:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>
              <strong>Liderazgo:</strong> Promover por ejemplo la integridad y
              el cumplimiento de esta política en todos los niveles organizacionales.
            </li>
            <li>
              <strong>Capacitación:</strong> Asegurar que todos los colaboradores
              reciban entrenamiento en anticorrupción durante su período de inducción
              y anualmente.
            </li>
            <li>
              <strong>Recursos:</strong> Asignar recursos suficientes para
              implementar, monitorear y mantener esta política.
            </li>
            <li>
              <strong>Investigación:</strong> Investigar de manera independiente
              e imparcial todos los reportes de incumplimiento.
            </li>
            <li>
              <strong>Sanciones:</strong> Aplicar sanciones consistentes y
              proporcionales incluyendo despido en casos graves.
            </li>
            <li>
              <strong>Transparencia:</strong> Mantener comunicación clara sobre
              este compromiso con empleados, clientes y autoridades.
            </li>
          </ul>
        </section>

        {/* Definiciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Definiciones Clave</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Soborno</h3>
              <p className="text-gray-700 leading-relaxed">
                Ofrecer, prometer, dar o recibir dinero, regalos, beneficios u
                otra ventaja indebida para influir de manera impropia en la
                decisión de una persona en su capacidad oficial o comercial.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Corrupción</h3>
              <p className="text-gray-700 leading-relaxed">
                Abuso del poder confiado para obtener beneficio privado,
                incluyendo fraude, cohecho, malversación y conflictos de interés.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Funcionario público</h3>
              <p className="text-gray-700 leading-relaxed">
                Cualquier persona que ejerce función pública, incluyendo
                funcionarios de gobiernos locales, regionales, nacionales,
                empresas estatales y organismos internacionales.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Ventaja indebida</h3>
              <p className="text-gray-700 leading-relaxed">
                Cualquier beneficio, económico o no, que no es debido ni
                legitimamente ofrecido o recibido.
              </p>
            </div>
          </div>
        </section>

        {/* Prohibiciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Prohibiciones Expresas</h2>
          <p className="text-gray-700 leading-relaxed mb-4 font-semibold text-amber-700">
            ⛔ Las siguientes acciones están estrictamente prohibidas:
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">1. Ofrecer o Recibir Dinero</h3>
              <p className="text-gray-700 leading-relaxed">
                Está prohibido ofrecer, prometer o entregar dinero en efectivo,
                transferencias bancarias, depósitos u otros valores monetarios
                a personas, funcionarios o sus familias para influir en una
                decisión comercial o administrativa.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">2. Ofrecer o Recibir Regalos</h3>
              <p className="text-gray-700 leading-relaxed">
                Ningún regalo, obsequio, mercancía o valor material de precio
                relevante puede ser ofrecido a clientes, proveedores o
                funcionarios públicos con propósito de influencia. Los regalos
                promocionales de mínimo valor y uso estándar requieren
                autorización previa de gerencia.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">3. Ofrecer Favores o Servicios Indebidos</h3>
              <p className="text-gray-700 leading-relaxed">
                Está prohibido ofrecer trabajos, empleo, puestos, servicios
                profesionales, tutoría, internados u otros favores a personas,
                funcionarios o sus familiares para obtener beneficio comercial
                o contractual.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">4. Descuentos Indebidos</h3>
              <p className="text-gray-700 leading-relaxed">
                No se permitirán descuentos, bonificaciones o condiciones
                comerciales especiales que no sean documentados y justificados
                en base a criterios comerciales objetivos y aplicables a todos
                los clientes por igual.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">5. Comisiones Ilegales</h3>
              <p className="text-gray-700 leading-relaxed">
                Está expresamente prohibido pagar comisiones, bonificaciones o
                pagos adicionales no documentados a intermediarios, proveedores
                o funcionarios para facilitar contrataciones o decisiones
                comerciales.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">6. Pagos de Facilitación</h3>
              <p className="text-gray-700 leading-relaxed">
                No se realizarán pagos facilitadores o "mordidas" a funcionarios
                públicos para acelerar trámites, obtener licencias, permisos o
                evitar sanciones legales. Todos los trámites se realizarán
                conforme a procedimientos legales normales.
              </p>
            </div>
          </div>
        </section>

        {/* Relación con Proveedores */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Relación con Proveedores</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            En nuestras relaciones con proveedores y distribuidores:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              La selección de proveedores se basa en criterios objetivos:
              calidad, precio, garantía, capacidad técnica y cumplimiento legal.
            </li>
            <li>
              No se favorecerá a proveedores por relaciones personales, amistad
              o familiaridad sin justificación comercial.
            </li>
            <li>
              Todos los acuerdos con proveedores deben ser documentados en
              contratos escritos con términos claros y transparentes.
            </li>
            <li>
              No se aceptarán regalos de proveedores que intenten influir en
              nuestras decisiones de compra.
            </li>
            <li>
              Los proveedores deben cumplir con normativas laborales y
              ambientales; su incumplimiento es causal de terminación de contrato.
            </li>
            <li>
              Se exigirá a proveedores la firma de cláusulas antisoborno y
              anticorrupción en sus contratos.
            </li>
          </ul>
        </section>

        {/* Relación con Clientes */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Relación con Clientes</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            En nuestras relaciones comerciales con clientes:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              Toda información comercial, precios y condiciones será verdadera,
              completa y no contiene enumeraciones engañosas.
            </li>
            <li>
              Las cotizaciones se presentarán con transparencia, detallando
              todos los costos sin sorpresas posteriores.
            </li>
            <li>
              No se ofrecerán beneficios adicionales no documentados o "sobornos"
              para cerrar negocios.
            </li>
            <li>
              Los descuentos se justificarán en base a volúmenes, temporada o
              criterios comerciales legítimos y se documentarán.
            </li>
            <li>
              Las garantías ofrecidas serán ciertas y podrán ser cumplidas sin
              condiciones ocultas.
            </li>
            <li>
              No se ofrecerán regalos inapropiados para influir en decisiones
              de compra.
            </li>
          </ul>
        </section>

        {/* Relación con Funcionarios Públicos */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Relación con Funcionarios Públicos</h2>
          <p className="text-gray-700 leading-relaxed mb-4 font-semibold text-amber-700">
            ⚠️ ÁREA CRÍTICA - CUMPLIMIENTO OBLIGATORIO
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            En relaciones con funcionarios públicos se aplican estándares de
            integridad superiores:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>
              <strong>Prohibición total de soborno:</strong> Nunca ofrecer dinero,
              regalos, viajes, hospitalidades o beneficios a funcionarios
              públicos o sus familiares.
            </li>
            <li>
              <strong>Transparencia en licitaciones:</strong> Participar en
              procesos de contratación pública con información veraz, sin
              colusión con otros proveedores y respetando tiempos establecidos.
            </li>
            <li>
              <strong>Documentación completa:</strong> Presentar en procesos
              públicos documentación íntegra, sin falsificaciones ni omisiones.
            </li>
            <li>
              <strong>Cumplimiento de obligaciones:</strong> Ejecutar contratos
              con el gobierno conforme a especificaciones sin reclamos infundados.
            </li>
            <li>
              <strong>Reporte de solicitudes ilegales:</strong> Si un funcionario
              solicitara beneficios indebidos, reportarlo inmediatamente a
              gerencia sin represalias.
            </li>
            <li>
              <strong>Registro de interacciones:</strong> Documentar reuniones
              oficiales, propuestas y comunicaciones con entidades públicas.
            </li>
          </ul>
        </section>

        {/* Donaciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Donaciones y Contribuciones</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IUBIZON COMPANY SAC puede realizar donaciones a organizaciones
            benéficas, educativas o comunitarias, siempre que:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              La donación sea respaldada por documentación legal clara (RUC,
              resolución de constitución, fines benéficos).
            </li>
            <li>
              No exista expectativa de beneficio comercial directo o ventaja
              contractual a cambio de la donación.
            </li>
            <li>
              La donación no beneficie a funcionarios públicos, sus familias o
              asociaciones personales.
            </li>
            <li>
              Es aprobada por gerencia y documentada en registros contables.
            </li>
            <li>
              Cumple con normativas tributarias y de transparencia vigentes.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3 text-sm text-amber-700">
            Las donaciones a partidos políticos están prohibidas.
          </p>
        </section>

        {/* Patrocinios */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Patrocinios y Alianzas</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IUBIZON COMPANY SAC puede patrocinar eventos deportivos, culturales
            o académicos con las siguientes condiciones:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              El patrocinio tiene propósito legítimo de visibilidad corporativa
              o responsabilidad social.
            </li>
            <li>
              La entidad receptora tiene estatus legal y tributario claro,
              verificado mediante documentación.
            </li>
            <li>
              No se espera ventaja comercial indebida a cambio del patrocinio.
            </li>
            <li>
              El patrocinio no beneficia a funcionarios públicos de manera
              personal.
            </li>
            <li>
              Es documentado y autorizado por gerencia.
            </li>
            <li>
              Se registra adecuadamente en contabilidad y reportes fiscales.
            </li>
          </ul>
        </section>

        {/* Hospitalidades */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Hospitalidades y Entretenimiento</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Se permiten hospitalidades comerciales moderadas, tales como almuerzos,
            cenas o eventos, sujeto a:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Moderación:</strong> Los costos deben ser razonables y
              proporcionales a prácticas comerciales estándar. No se permitirán
              eventos de lujo o viajes costosos.
            </li>
            <li>
              <strong>Con funcionarios públicos:</strong> Solo se permitirán
              almuerzos o cenas de trabajo, documentados, sin alcohol excesivo
              y con propósito comercial legítimo. No se permitirán entretenimientos
              como viajes, eventos de ocio o conciertos.
            </li>
            <li>
              <strong>Con clientes y proveedores:</strong> Se permiten almuerzos
              o cenas de relaciones comerciales, incluyendo entretenimiento
              moderado, siempre que sea documentado y justificado comercialmente.
            </li>
            <li>
              <strong>Sin influencia impropia:</strong> La hospitalidad nunca
              debe ser condicionada a decisiones comerciales ni tener propósito
              de influencia indebida.
            </li>
            <li>
              <strong>Documentación:</strong> Todos los gastos de hospitalidad
              deben ser registrados con descripción clara, participantes y
              justificación comercial.
            </li>
          </ul>
        </section>

        {/* Violaciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Consecuencias de Violaciones</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cualquier violación a esta política resultará en:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Investigación formal</strong> independiente por gerencia.
            </li>
            <li>
              <strong>Acciones disciplinarias</strong> incluyendo amonestación,
              descuento salarial, suspensión o terminación de contrato.
            </li>
            <li>
              <strong>Recuperación de activos:</strong> Devolución de dinero o
              bienes obtenidos ilícitamente.
            </li>
            <li>
              <strong>Denuncia a autoridades:</strong> Reporte a SUNAT, Fiscalía
              o autoridades competentes cuando corresponda.
            </li>
            <li>
              <strong>Exclusión comercial:</strong> Prohibición de trabajar con
              la empresa e inclusión en base de datos de proveedores rechazados.
            </li>
          </ul>
        </section>

        {/* Reporte y Protección */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Reporte de Violaciones y Protección</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Todo colaborador que observe violaciones a esta política puede
            reportar confidencialmente a:
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="text-gray-700 font-semibold">Gerencia de Dirección</p>
            <p className="text-gray-700">📧 gerencia@iubizon.com</p>
            <p className="text-gray-700">📞 972 300 301</p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-3">
            <strong>Protecciones:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              Los reportes serán tratados con confidencialidad máxima.
            </li>
            <li>
              Los denunciantes de buena fe estarán protegidos contra
              represalias, discriminación o efectos adversos.
            </li>
            <li>
              La identidad será protegida a menos que sea legalmente imposible.
            </li>
          </ul>
        </section>

        {/* Vigencia */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Vigencia y Revisión</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Esta política entra en vigencia desde su publicación y será revisada
            anualmente o cuando cambios legales lo requieran. La firma de esta
            política es requisito durante la inducción de todos los colaboradores.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Cualquier duda o solicitud de aclaración debe dirigirse a gerencia.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-gray-600">
        <p className="font-medium text-gray-800">IUBIZON COMPANY SAC</p>
        <p className="mt-2">Política Antisoborno y Anticorrupción</p>
        <p className="mt-2">RUC: 20614600374</p>
        <p className="mt-4 text-gray-500">Última actualización: Junio 2026</p>
      </div>
    </section>
  );
}

