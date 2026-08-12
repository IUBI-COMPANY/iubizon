import { Lock } from "lucide-react";

export function PrivacySection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#f25c05]" />
          Política de Privacidad de Datos
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Protección de datos personales conforme a la Ley N° 29733 y su
          Reglamento, aprobado por Decreto Supremo N° 003-2013-JUS, del Perú.
          Última actualización: 2026.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            1. Identidad del Responsable del Tratamiento
          </h3>
          <p>
            El responsable del tratamiento de los datos personales
            recopilados a través de la plataforma IUBIZON es{" "}
            <strong>IUBIZON COMPANY S.A.C.</strong>, persona jurídica de
            derecho privado constituida conforme a las leyes de la República
            del Perú, con RUC N° 20614600374, domicilio fiscal en la ciudad
            de Lima, Perú. Para cualquier consulta, solicitud o reclamo
            relacionado con el tratamiento de datos personales, el usuario
            podrá contactar a IUBIZON a través del correo electrónico:{" "}
            <strong>iubizon.company@gmail.com</strong>.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            2. Recopilación y Tratamiento de la Información
          </h3>
          <p>
            <strong>IUBIZON COMPANY S.A.C.</strong> recopila datos personales
            necesarios para la adecuada prestación de sus servicios, tales
            como: nombres y apellidos completos, documento de identidad (DNI
            o RUC), correo electrónico, número de teléfono de contacto,
            dirección de despacho, dirección fiscal y datos de facturación.
            Estos datos son recopilados directamente del usuario al momento
            del registro en la plataforma, durante la realización de una
            compra, al solicitar la conversión a perfil de vendedor, o
            cuando el usuario contacta a IUBIZON a través de los canales
            de atención habilitados.
          </p>
          <p className="mt-2">
            Asimismo, IUBIZON podrá recopilar información de forma automática
            durante la navegación del usuario en la plataforma, tales como:
            dirección IP, tipo y versión del navegador, sistema operativo,
            páginas visitadas, tiempo de permanencia, fuentes de tráfico y
            patrones de navegación, la cual será tratada de conformidad con
            los fines descritos en esta política.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            3. Finalidad del Tratamiento de Datos
          </h3>
          <p>
            La información recopilada se utiliza para las siguientes
            finalidades: (a) procesar compras, pagos y emisiones de
            cotizaciones en formato PDF; (b) coordinar despachos de pedidos
            con proveedores o empresas de transporte; (c) gestionar el módulo
            de reembolsos y devoluciones durante el periodo de protección de
            siete días; (d) realizar abonos y transferencias bancarias a
            cuentas de vendedores; (e) enviar comunicaciones transaccionales
            relacionadas con el estado de los pedidos, actualizaciones de la
            plataforma y notificaciones relevantes para la operación del
            usuario; (f) verificar la identidad del usuario y prevenir
            actividades fraudulentas; (g) cumplir con obligaciones legales
            y regulatorias aplicables; y (h) fines legítimos de interés
            comercial vinculados al mejoramiento continuo de los servicios
            de la plataforma.
          </p>
          <p className="mt-2">
            IUBIZON no utilizará los datos personales para fines distintos a
            los aquí descritos sin Obtener previamente el consentimiento
            expreso del usuario, salvo que medie una obligación legal que
            así lo requiera.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            4. Consentimiento
          </h3>
          <p>
            Al acceder y utilizar la plataforma IUBIZON, el usuario otorga
            su consentimiento libre, previo, informado y expreso para el
            tratamiento de sus datos personales conforme a los términos
            establecidos en esta política. El consentimiento podrá ser
            revocado en cualquier momento por el usuario mediante la
            presentación de una solicitud formal a través del correo
            electrónico oficial de IUBIZON. La revocación del consentimiento
            podrá afectar la prestación de determinados servicios de la
            plataforma, siendo informado el usuario sobre las consecuencias
            antes de la processing de su solicitud.
          </p>
          <p className="mt-2">
            En el caso de usuarios registrados como vendedores, el
            consentimiento para el tratamiento de datos bancarios y fiscales
            se otorga de forma específica al momento de completar el
            formulario de registro de perfil de vendedor, siendo
            indispensable para la correcta prestación del servicio de
            intermediación comercial.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            5. Seguridad Financiera y Pasarela Niubiz
          </h3>
          <p>
            IUBIZON no almacena, registra ni tiene acceso a los números de
            tarjeta de crédito o débito, fechas de vencimiento, códigos de
            seguridad ni datos biométricos de autenticación de los medios de
            pago utilizados por los clientes. Toda la transacción de pago se
            realiza directamente en los servidores seguros y certificados de
            Niubiz, bajo estándares internacionales de seguridad PCI DSS
            Level 1, con encriptación SSL de 256 bits y tokenización de datos
            financieros. IUBIZON únicamente recibe la confirmación del
            resultado de la transacción (aprobada o rechazada) sin tener
            acceso a los datos sensibles del medio de pago utilizado.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            6. Medidas de Seguridad de los Datos
          </h3>
          <p>
            IUBIZON implementa medidas de seguridad de naturaleza administrativa,
            técnica y física razonablemente adecuadas para proteger los datos
            personales contra acceso no autorizado, pérdida accidental,
            alteración indebida, divulgación no autorizada o cualquier otra
            forma de tratamiento ilícito. Estas medidas incluyen, entre otras:
            controles de acceso basados en roles y autenticación multifactor;
            cifrado de datos personales tanto en tránsito como en reposo;
            auditorías periódicas de seguridad de la información; políticas
            internas de manejo de datos y capacitación continua del personal
            en materia de protección de datos personales; y planes de
            continuidad de negocio y recuperación ante desastres.
          </p>
          <p className="mt-2">
            Sin perjuicio de lo anterior, ningún sistema de seguridad es
            absolutamente seguro. IUBIZON no puede garantizar la seguridad
            absoluta de los datos personales, pero se compromete a adoptar
            las medidas técnicas y organizativas necesarias para reducir
            riesgos y a notificar al usuario de manera oportuna en caso de
            producirse una brecha de seguridad que pueda afectar sus datos
            personales.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            7. Compartición de Datos con Terceros
          </h3>
          <p>
            IUBIZON comparte los datos personales del usuario de forma
            estrictamente limitada y necesaria con las siguientes categorías
            de terceros: (a) proveedores o vendedores registrados en la
            plataforma, exclusivamente los datos de contacto y entrega
            necesarios para completar el despacho del producto adquirido;
            (b) empresas de transporte y courier contratadas para la gestión
            de envíos, únicamente la información indispensable para la
            coordinación del despacho; (c) la pasarela de pago Niubiz, para
            el procesamiento seguro de las transacciones financieras; y (d)
            autoridades públicas competentes, cuando exista una obligación
            legal que así lo requiera o cuando medie orden judicial, mandato
            de autoridad administrativa o requerimiento de una entidad fiscal
            o reguladora.
          </p>
          <p className="mt-2">
            IUBIZON no comercializa, cede ni comparte bases de datos
            personales con terceros con fines publicitarios, de marketing o
            de perfilado comercial no autorizados por el titular de los datos.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            8. Retención de Datos Personales
          </h3>
          <p>
            Los datos personales del usuario serán conservados durante el
            tiempo que el usuario mantenga una cuenta activa en la plataforma
            o durante el tiempo que resulte necesario para el cumplimiento
            de las finalidades para las que fueron recopilados, lo que sea
            mayor. Una vez culminada la relación contractual o comercial
            con el usuario, o transcurrido el plazo máximo de conservación
            aplicable, los datos personales serán eliminados de forma
            segura o anonimizados de manera irreversible dentro de un plazo
            máximo de treinta (30) días calendario, salvo que exista una
            obligación legal que exija su conservación por un periodo mayor,
            en cuyo caso los datos serán mantenidos únicamente para el fin
            legal que justifique su conservación.
          </p>
          <p className="mt-2">
            Los datos de transacciones financieras serán conservados por un
            periodo mínimo de siete (7) años, de conformidad con la
            normativa tributaria y mercantil peruana aplicable, aun cuando
            el usuario haya solicitado la eliminación de su cuenta.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            9. Transferencia Internacional de Datos
          </h3>
          <p>
            IUBIZON no realiza transferencias internacionales de datos
            personales fuera del territorio de la República del Perú. Todos
            los datos personales recopilados a través de la plataforma son
            almacenados en servidores ubicados dentro del territorio
            nacional. En caso de que en el futuro se requiera realizar una
            transferencia internacional de datos personales, IUBIZON
            solicitará el consentimiento previo, informado y expreso del
            titular de los datos, y garantizará que el país o la
            destinataria de la transferencia cuente con un nivel de
            protección adecuado conforme a lo establecido en la Ley N° 29733
            y su Reglamento.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            10. Menores de Edad
          </h3>
          <p>
            Los servicios de la plataforma IUBIZON están dirigidos
            exclusivamente a personas naturales mayores de dieciocho (18)
            años de edad y a personas jurídicas debidamente constituidas
            conforme a la legislación peruana. IUBIZON no recopila
            intencionalmente datos personales de menores de edad. Si se
            detectase que un menor de edad ha registrado una cuenta o
            proporcionado datos personales a través de la plataforma, sus
            datos serán eliminados de forma inmediata y sin necesidad de
            autorización previa, tan pronto como IUBIZON tome conocimiento
            de dicha circunstancia.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            11. Cookies y Tecnologías de Rastreo
          </h3>
          <p>
            La plataforma IUBIZON utiliza cookies propias y de terceros,
            así como tecnologías de rastreo similares, con las siguientes
            finalidades: (a) cookies estrictamente necesarias para el
            funcionamiento de la plataforma, tales como las de sesión,
            autenticación y preferencias de idioma; (b) cookies de
            rendimiento y analíticas, que permiten recopilar información
            estadística anónima sobre el uso de la plataforma con el fin
            de mejorar la experiencia del usuario; y (c) cookies de
            funcionalidad, que permiten recordar preferencias del usuario
            y personalizar la interfaz de la plataforma.
          </p>
          <p className="mt-2">
            El usuario puede gestionar, inhabilitar o eliminar las cookies
            desde la configuración de su navegador web. El bloqueo o
            eliminación de cookies estrictamente necesarias podría afectar
            la funcionalidad básica de la plataforma, incluyendo la
            posibilidad de iniciar sesión, agregar productos al carrito
            o completar una compra. Las cookies de rendimiento y
            funcionalidad no son indispensables para el uso básico de la
            plataforma, pero su desactivación podría limitar ciertas
            características o mejorar la experiencia de navegación.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            12. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </h3>
          <p>
            Conforme a la Ley N° 29733 de Protección de Datos Personales de
            la República del Perú y su Reglamento, el titular de los datos
            personales tiene derecho a: (a) <strong>Acceso</strong>: solicitar
            información sobre los datos personales que IUBIZON tiene
            almacenados sobre su persona; (b) <strong>Rectificación</strong>:
            solicitar la corrección de datos personales inexactos, incompletos
            o no actualizados; (c) <strong>Cancelación</strong>: solicitar la
            eliminación de sus datos personales cuando considere que no son
            necesarios para la finalidad para la que fueron recopilados o
            cuando haya concluido la relación contractual; y (d)
            <strong>Oposición</strong>: oponerse al tratamiento de sus datos
            personales para una finalidad específica.
          </p>
          <p className="mt-2">
            Para ejercer cualquiera de estos derechos, el titular deberá
            enviar una solicitud formal a través del correo electrónico
            oficial de IUBIZON: <strong>iubizon.company@gmail.com</strong>,
            indicando de forma clara y precisa el derecho que desea ejercer,
            adjuntando una copia legible de su documento de identidad y
            cualquier otra información que permita la identificación del
            titular. IUBIZON responderá a la solicitud en un plazo máximo
            de diez (10) días hábiles contados a partir de la recepción de
            la solicitud.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            13. Procedimiento de Reclamo ante la Autoridad Nacional
          </h3>
          <p>
            En caso de que el titular de los datos considere que sus derechos
            han sido vulnerados o que IUBIZON no ha respondido adecuadamente
            a su solicitud de ejercicio de derechos ARCO, podrá presentar
            una queja o reclamo ante la Autoridad Nacional de Protección de
            Datos Personales (ANPDP), dependiente del Ministerio de Justicia
            del Perú, conforme al procedimiento establecido en la Ley N° 29733
            y su Reglamento. La ANPDP tiene la facultad de investigar las
            quejas, imponer sanciones administrativas y ordenar la adopción
            de medidas correctivas cuando corresponda.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            14. Modificaciones de esta Política
          </h3>
          <p>
            IUBIZON se reserva el derecho de modificar, actualizar o
            complementar la presente Política de Privacidad en cualquier
            momento, a fin de reflejar cambios en sus prácticas de
            tratamiento de datos personales, modificaciones en la normativa
            aplicable o requerimientos de las autoridades competentes. Las
            modificaciones serán publicadas en esta misma página y serán
            efectivas desde su fecha de publicación. IUBIZON notificará a
            los usuarios registrados sobre las modificaciones relevantes a
            través del correo electrónico registrado en la plataforma con
            una antelación razonable antes de la entrada en vigor de los
            cambios, cuando dichos cambios afecten sustancialmente los
            derechos de los titulares de los datos.
          </p>
          <p className="mt-2">
            Se recomienda a los usuarios revisar periódicamente esta política
            para mantenerse informados sobre el tratamiento de sus datos
            personales. El uso continuado de la plataforma después de la
            publicación de modificaciones a esta política constituirá la
            aceptación de los cambios realizados.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            15. Jurisdicción Aplicable y Ley Vigente
          </h3>
          <p>
            La presente Política de Privacidad se rige por las leyes de la
            República del Perú, en particular por la Ley N° 29733 de
            Protección de Datos Personales, su Reglamento aprobado por
            Decreto Supremo N° 003-2013-JUS y las demás normas
            complementarias y reglamentarias aplicables. Para cualquier
            controversia derivada de la interpretación, aplicación o
            cumplimiento de esta política, las partes se someten a la
            jurisdicción exclusiva de los tribunales competentes de la
            ciudad de Lima, Perú, con renuncia expresa a cualquier otro
            fuero que pudiera corresponderles por razón de domicilio
            presente o futuro.
          </p>
        </div>
      </div>
    </div>
  );
}
