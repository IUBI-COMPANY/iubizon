import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Código de Ética | iubizon",
  description:
    "Conoce el Código de Ética de iubizon. Principios de integridad, honestidad y transparencia en nuestras operaciones.",
  keywords: [
    "código de ética iubizon",
    "integridad corporativa",
    "valores empresariales",
    "transparencia",
    "conducta profesional",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/legal/codigo-de-etica",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.iubizon.com"),
};

export default function CodigoDeEticaPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-3">
          📋 Código de Ética de iubizon
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Sistema de Integridad Corporativa{" "}
          <span className="text-amber-600 font-semibold">IUBIZON COMPANY SAC</span>
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-3xl p-8 space-y-10 border border-gray-100">
        {/* Presentación */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Presentación</h2>
          <p className="text-gray-700 leading-relaxed">
            El Código de Ética de IUBIZON COMPANY SAC establece los principios,
            valores y normas de conducta que guían las acciones de todos nuestros
            colaboradores. Este código refleja nuestro compromiso con la
            integridad corporativa, la transparencia y el cumplimiento de la ley
            en todas nuestras operaciones comerciales y relaciones con clientes,
            proveedores y entidades públicas.
          </p>
        </section>

        {/* Misión */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Misión</h2>
          <p className="text-gray-700 leading-relaxed">
            Suministrar equipos tecnológicos de calidad y servicios técnicos
            especializados en proyección audiovisual, cumpliendo con los más
            altos estándares de integridad y profesionalismo, garantizando
            transparencia en cada interacción y generando confianza duradera
            con nuestros clientes, colaboradores y socios comerciales en el
            mercado peruano.
          </p>
        </section>

        {/* Visión */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Visión</h2>
          <p className="text-gray-700 leading-relaxed">
            Ser el proveedor de confianza de equipos y servicios tecnológicos
            en Perú, reconocido por nuestra ética empresarial, profesionalismo
            y compromiso con la satisfacción del cliente, contribuyendo al
            desarrollo tecnológico responsable del país.
          </p>
        </section>

        {/* Valores */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Valores Corporativos</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Los colaboradores de iubizon desarrollan sus actividades con:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Honestidad:</strong> Actuamos con verdad en todas nuestras comunicaciones.</li>
            <li><strong>Transparencia:</strong> Somos abiertos y claros en nuestras operaciones.</li>
            <li><strong>Respeto:</strong> Valorizamos la dignidad de cada persona.</li>
            <li><strong>Responsabilidad:</strong> Asumimos las consecuencias de nuestros actos.</li>
            <li><strong>Imparcialidad:</strong> Evitamos favoritismos y tratos discriminatorios.</li>
            <li><strong>Compromiso:</strong> Nos dedicamos a la satisfacción del cliente y la excelencia.</li>
          </ul>
        </section>

        {/* Principios */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Principios de Actuación</h2>

          <div className="space-y-8">
            {/* Integridad */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">1. Integridad</h3>
              <p className="text-gray-700 leading-relaxed">
                Todo colaborador debe actuar de manera íntegra, coherente con
                nuestros valores, independientemente de los beneficios personales
                que pudiera obtener. La integridad es la base de nuestra reputación.
              </p>
            </div>

            {/* Honestidad */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">2. Honestidad</h3>
              <p className="text-gray-700 leading-relaxed">
                Nos comprometemos a comunicar información veraz y precisa en
                todas nuestras operaciones, sin omisiones ni distorsiones que
                puedan inducir a error a clientes, proveedores o autoridades.
              </p>
            </div>

            {/* Transparencia */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">3. Transparencia</h3>
              <p className="text-gray-700 leading-relaxed">
                La empresa mantiene registros claros y accesibles de nuestras
                operaciones. Los procesos de contratación, facturación y servicio
                técnico se realizan con documentación completa y trazable.
              </p>
            </div>

            {/* Cumplimiento de la ley */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">4. Cumplimiento de la Ley</h3>
              <p className="text-gray-700 leading-relaxed">
                Todos nuestros colaboradores deben conocer y cumplir la legislación
                peruana vigente, incluyendo normativas de protección del consumidor,
                laboral, tributaria y ambiental. El cumplimiento legal es no negociable.
              </p>
            </div>

            {/* Protección de información */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">5. Protección de la Información</h3>
              <p className="text-gray-700 leading-relaxed">
                La información de clientes, proveedores y operaciones internas
                es confidencial. Ningún colaborador debe divulgar, usar
                indebidamente o compartir datos sensibles sin autorización expresa.
              </p>
            </div>

            {/* Competencia leal */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">6. Competencia Leal</h3>
              <p className="text-gray-700 leading-relaxed">
                Competimos en el mercado de manera ética, sin difamación,
                desinformación o prácticas desleales hacia competidores. Nuestro
                crecimiento se basa en calidad y reputación, no en prácticas ilícitas.
              </p>
            </div>

            {/* Respeto laboral */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">7. Respeto entre Colaboradores</h3>
              <p className="text-gray-700 leading-relaxed">
                Promovemos un ambiente laboral libre de discriminación, acoso
                o violencia. Respetamos la dignidad, diversidad y derechos de
                todos los miembros del equipo sin excepción.
              </p>
            </div>

            {/* Calidad del servicio */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">8. Calidad del Servicio Técnico</h3>
              <p className="text-gray-700 leading-relaxed">
                Nuestros técnicos deben actuar con profesionalismo, ofreciendo
                diagnósticos verdaderos y reparaciones de calidad. No se
                toleran cobros por trabajos no realizados ni recomendaciones
                innecesarias.
              </p>
            </div>

            {/* Conflictos de interés */}
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-2">9. Conflictos de Interés</h3>
              <p className="text-gray-700 leading-relaxed">
                Los colaboradores deben evitar situaciones que generen conflictos
                con los intereses de la empresa. Esto incluye:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                <li>No favorecer proveedores o clientes por amistad o parentesco.</li>
                <li>No recibir comisiones ocultas o beneficios extraoficiales.</li>
                <li>Declarar públicamente cualquier relación comercial personal con clientes o proveedores.</li>
                <li>Abstenerse de tomar decisiones en las que se tenga interés personal.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Regalos y Beneficios */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Regalos y Beneficios</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Ningún trabajador podrá solicitar o aceptar:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Regalos, dinero o valores de clientes o proveedores.</li>
            <li>Viajes, hospedajes o eventos pagados por terceros interesados.</li>
            <li>Descuentos personales o regalos que otros no reciben.</li>
            <li>Cualquier beneficio que pueda influir en una decisión comercial o contractual.</li>
            <li>Favores que comprometan la imparcialidad de nuestras decisiones.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Los obsequios de valor mínimo o promocionales estándar de proveedores
            pueden ser aceptados solo con conocimiento de la gerencia.
          </p>
        </section>

        {/* Uso de recursos */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Uso Responsable de Recursos Corporativos</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Todo recurso de la empresa debe usarse exclusivamente para propósitos
            comerciales autorizados. Los colaboradores son responsables de:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Vehículos corporativos</h3>
              <p className="text-gray-700 leading-relaxed">
                Usar solo para actividades autorizadas, mantener documentación
                completa de kilometraje y combustible, y reportar daños inmediatamente.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Herramientas y equipos técnicos</h3>
              <p className="text-gray-700 leading-relaxed">
                Mantenerlos en buen estado, no permitir uso personal sin autorización,
                y reportar pérdidas o daños a la gerencia.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Computadoras y dispositivos</h3>
              <p className="text-gray-700 leading-relaxed">
                No instalar software no autorizado, respetar políticas de
                seguridad, no acceder a información innecesaria y proteger
                contraseñas y accesos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Información de clientes</h3>
              <p className="text-gray-700 leading-relaxed">
                Proteger datos sensibles, no compartir con terceros sin
                autorización, y destruir registros obsoletos adecuadamente
                conforme a políticas internas.
              </p>
            </div>
          </div>
        </section>

        {/* Conducta con clientes */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Conducta con Clientes</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La relación con clientes debe caracterizarse por:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Información verdadera:</strong> Proporcionar especificaciones,
              precios y condiciones de garantía exactas sin omisiones engañosas.
            </li>
            <li>
              <strong>Cotizaciones transparentes:</strong> Detallar todos los costos,
              incluidos servicios, transporte y garantía, sin aumentos posteriores
              no informados.
            </li>
            <li>
              <strong>Garantías reales:</strong> Ofrecer únicamente garantías que
              podemos cumplir, documentadas y con cobertura clara.
            </li>
            <li>
              <strong>No ocultar desperfectos:</strong> Informar sobre daños previos,
              uso, o limitaciones técnicas de equipos usados o reacondicionados
              de manera clara.
            </li>
            <li>
              <strong>Respuesta a reclamos:</strong> Atender reclamaciones con
              agilidad, investigar con imparcialidad y ofrecer soluciones justas.
            </li>
          </ul>
        </section>

        {/* Conducta con entidades públicas */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Conducta con Entidades Públicas</h2>
          <p className="text-gray-700 leading-relaxed mb-4 font-semibold text-amber-700">
            ⚠️ REQUISITO FUNDAMENTAL
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Todo colaborador deberá actuar con absoluta transparencia durante
            procesos de contratación pública, licitaciones y relaciones con
            autoridades. Específicamente:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>
              <strong>Prohibición de ventajas indebidas:</strong> Nunca ofrecer,
              prometer o entregar dinero, regalos, favores, descuentos especiales
              u otra ventaja a funcionarios públicos para obtener contratos,
              licencias o ventajas comerciales.
            </li>
            <li>
              <strong>Documentación íntegra:</strong> Presentar información
              completa y veraz en todas las solicitudes, propuestas y reportes
              requeridos por entidades públicas.
            </li>
            <li>
              <strong>Cumplimiento de plazos:</strong> Respetar fechas de
              entrega, cumplimientos técnicos y obligaciones contractuales
              sin excepciones o reclamos infundados.
            </li>
            <li>
              <strong>Transparencia fiscal:</strong> Emitir comprobantes
              completos, cumplir obligaciones tributarias y mantener registros
              precisos de todas las operaciones.
            </li>
            <li>
              <strong>Responsabilidad personal:</strong> Cualquier violación
              de este principio puede ser reportada internamente sin represalias
              y será investigada por la gerencia.
            </li>
          </ul>
        </section>

        {/* Restricciones y Sanciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Sanciones y Restricciones</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El incumplimiento de este código puede resultar en:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Amonestación escrita.</li>
            <li>Descuento en remuneración.</li>
            <li>Suspensión temporal.</li>
            <li>Terminación de relación laboral.</li>
            <li>Denuncia ante autoridades competentes en caso de delitos.</li>
          </ul>
        </section>

        {/* Reporte de Infracciones */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Reporte de Infracciones</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Los colaboradores que observen violaciones a este código pueden
            reportar confidencialmente a:
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-gray-700 font-semibold">Gerencia de Dirección</p>
            <p className="text-gray-700">📧 iubizon.company@gmail.com</p>
            <p className="text-gray-700">📞 972 300 301</p>
            <p className="text-gray-700 mt-2 text-sm">
              Los reportes serán tratados con confidencialidad. No se permitirán
              represalias contra quienes reporten de buena fe.
            </p>
          </div>
        </section>

        {/* Vigencia */}
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Vigencia y Aplicabilidad</h2>
          <p className="text-gray-700 leading-relaxed">
            Este Código de Ética entra en vigencia desde su publicación y aplica
            a todos los colaboradores de IUBIZON COMPANY SAC, incluyendo
            personal administrativo, técnico y gerencial. La firma del código
            es requisito durante la inducción de nuevos colaboradores.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-gray-600">
        <p className="font-medium text-gray-800">IUBIZON COMPANY SAC</p>
        <p className="mt-2">Sistema de Integridad Corporativa</p>
        <p className="mt-2">RUC: 20614600374</p>
        <p className="mt-4 text-gray-500">Última actualización: Junio 2026</p>
      </div>
    </section>
  );
}

