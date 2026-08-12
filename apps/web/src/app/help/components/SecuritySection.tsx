import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#f25c05]" />
          Protección IUBIZON & Garantías
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Marco de protección al comprador, retención de pagos y medidas de
          seguridad implementadas por la plataforma IUBIZON.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569]">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Protección de 7 Días al Cliente & Garantía del Proveedor
          </h3>
          <p>
            La plataforma IUBIZON pone a disposición de cada comprador un
            periodo de protección de siete (7) días calendario, contados a
            partir de la fecha confirmada de entrega del producto, incluyendo
            fines de semana y feriados. Durante dicho plazo, el cliente tiene
            derecho a verificar el correcto funcionamiento del producto y, en
            caso de presentar fallas, defectos de fábrica o inconvenientes
            distintos a los descritos en la ficha del producto, podrá solicitar
            la devolución o reemplazo a través del módulo de reembolsos
            habilitado en la plataforma. La solicitud deberá contener una
            descripción detallada del problema, fotografías o evidencias
            cuando corresponda, y los datos del pedido asociado. Una vez
            recibida la solicitud, el equipo de IUBIZON iniciará el proceso
            de seguimiento de la disputa y contactará al proveedor para la
            coordinación correspondiente. Cada producto publicado en la
            plataforma cuenta con la garantía oficial declarada por el
            proveedor al momento de su publicación, cuyos términos específicos
            se encuentran detallados en la ficha técnica de cada artículo.
          </p>
          <p className="text-emerald-800 mt-2">
            Este mecanismo de protección es complementario y no sustituye la
            garantía legal que otorga el proveedor conforme a la normativa
            peruana vigente. El comprador podrá hacer uso de ambas vías de
            reclamo de forma independiente.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Pagos Retenidos y Protección de Fondos
          </h3>
          <p>
            IUBIZON actúa como depositario de los fondos abonados por el
            comprador durante todo el periodo de protección de siete (7) días
            calendario. Los pagos permanecen retenidos en una cuenta
            segregada e independiente del patrimonio de la empresa, lo cual
            garantiza que los fondos se encuentren disponibles para su
            devolución íntegra en caso de que el comprador presente un reclamo
            válido dentro del plazo establecido. El proveedor no podrá solicitar
            la liberación de los fondos hasta que haya transcurrido
            íntegramente el periodo de protección sin que se haya registrado
            ningún reporte o disputa por parte del comprador en la plataforma.
          </p>
          <p className="mt-2">
            Una vez vencido el periodo de protección sin reclamos pendientes,
            IUBIZON procederá a transferir los fondos correspondientes a la
            cuenta bancaria registrada por el proveedor en el panel de
            finanzas, dentro de un plazo máximo de tres (3) días hábiles
            siguientes a la fecha de liberación. En caso de existir un reclamo
            activo, los fondos permanecerán retenidos hasta la resolución
            definitiva de la disputa conforme al procedimiento establecido
            en la plataforma.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Prevención contra Transacciones Fraudulentas & Niubiz
          </h3>
          <p>
            IUBIZON implementa un sistema de verificación y auditoría sobre las
            solicitudes de registro de vendedores y empresas asociadas, con el
            objetivo de garantizar la legitimidad de las transacciones
            realizadas en la plataforma. Este proceso incluye la validación
            de datos registrales, la revisión de antecedentes comerciales y
            la verificación de la información proporcionada durante el registro
            del perfil de vendedor.
          </p>
          <p className="mt-2">
            Todos los pagos se procesan exclusivamente a través de la pasarela
            de pago de Niubiz, la cual cumple con los estándares internacionales
            de seguridad PCI DSS Level 1 y utiliza encriptación SSL de 256
            bits. IUBIZON no almacena, registra ni tiene acceso a los números
            de tarjeta de crédito o débito, fechas de vencimiento ni códigos
            de seguridad de los medios de pago utilizados por los clientes.
            Cada transacción es procesada directamente en los servidores
            certificados de Niubiz, garantizando la confidencialidad e
            integridad de los datos financieros en todo momento.
          </p>
          <p className="mt-2">
            Adicionalmente, IUBIZON reserva el derecho de solicitar
            documentación complementaria, realizar llamadas de verificación o
            rechazar transacciones cuando existan indicios razonables de
            actividad fraudulenta, suplantación de identidad o uso no
            autorizado de medios de pago.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Gestión de Disputas y Resolución de Conflictos
          </h3>
          <p>
            En caso de que surja una disputa entre comprador y proveedor
            respecto al estado, calidad o condiciones del producto entregado,
            IUBIZON actuará como intermediario imparcial en el proceso de
            resolución. Ambas partes deberán presentar sus argumentos y
            evidencias a través del módulo habilitado para tal fin dentro de
            la plataforma. IUBIZON evaluará la información proporcionada por
            ambas partes y emitirá una resolución basada en los términos y
            condiciones establecidos en esta plataforma, las evidencias
            presentadas y la normativa peruana aplicable.
          </p>
          <p className="mt-2">
            Las resoluciones emitidas por IUBIZON en materia de disputas
            tendrán carácter vinculante para ambas partes dentro del marco
            operativo de la plataforma. En caso de que alguna de las partes
            no esté conforme con la resolución adoptada, podrá recurrir a las
            vías legales pertinentes conforme a la legislación peruana
            vigente.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Seguridad de la Plataforma y Disponibilidad
          </h3>
          <p>
            IUBIZON mantiene infraestructura tecnológica con sistemas de
            monitoreo, respaldo y recuperación ante desastres para garantizar
            la disponibilidad continua de la plataforma. Se realizan
            auditorías de seguridad periódicas, actualizaciones de software
            y pruebas de penetración con el fin de identificar y corregir
            vulnerabilidades que pudieran comprometer la integridad de los
            datos o la operación normal del servicio.
          </p>
          <p className="mt-2">
            Sin perjuicio de lo anterior, IUBIZON no garantiza la
            disponibilidad ininterrumpida de la plataforma y no será responsable
            por interrupciones, demoras o fallas derivadas de causas ajenas a
            su control, incluyendo pero no limitándose a: desastres naturales,
            actos gubernamentales, fallas en la red de telecomunicaciones,
            ataques cibernéticos de fuerza mayor o casos fortuitos.
          </p>
        </div>
      </div>
    </div>
  );
}
