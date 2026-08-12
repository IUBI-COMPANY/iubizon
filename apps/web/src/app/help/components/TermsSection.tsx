import { FileText } from "lucide-react";

export function TermsSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#f25c05]" />
          Términos y Condiciones de Uso
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Última actualización: 2026. Documento regulador de servicios para la
          plataforma IUBIZON. Al acceder o utilizar la plataforma, el usuario
          declara haber leído, comprendido y aceptado la totalidad de las
          cláusulas aquí establecidas.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            1. Aceptación del Servicio
          </h3>
          <p>
            Al acceder, navegar o realizar transacciones a través de la
            plataforma web IUBIZON, el usuario acepta de manera íntegra y
            sin reservas los presentes Términos y Condiciones administrados
            por <strong>IUBIZON COMPANY S.A.C.</strong> (RUC 20614600374). El
            uso de la plataforma implica la aceptación plena y sin condiciones
            de todas las cláusulas aquí expuestas. Si el usuario no está de
            acuerdo con alguno de los términos establecidos, deberá abstenerse
            de utilizar los servicios ofrecidos por la plataforma. IUBIZON se
            reserva el derecho de modificar, actualizar o complementar los
            presentes términos en cualquier momento, siendo efectivos los
            cambios desde su publicación en la plataforma. El uso continuado
            de la plataforma después de dichas modificaciones constituirá la
            aceptación tácita de los términos actualizados.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            2. Definiciones
          </h3>
          <p>
            Para los fines de estos Términos y Condiciones, se entenderá por:
            (a) <strong>Plataforma</strong>: el sitio web IUBIZON y todos sus
            módulos, funcionalidades y servicios disponibles a través del
            mismo; (b) <strong>Usuario</strong>: toda persona natural o jurídica
            que acceda, navegue o utilice la plataforma, ya sea en calidad de
            comprador, vendedor o visitante; (c) <strong>Proveedor o
            Vendedor</strong>: el usuario registrado que ha completado el
            proceso de verificación y opera como comercializador de productos
            a través de la plataforma; (d) <strong>Comprador</strong>: el
            usuario que realiza una adquisición de productos ofrecidos en la
            plataforma, incluyendo compras en modalidad de invitado; (e)
            <strong>Producto</strong>: bien mueble material ofrecido por el
            proveedor para su venta a través de la plataforma; (f)
            <strong>Periodo de Protección</strong>: lapso de siete (7) días
            calendario contados a partir de la entrega del producto durante
            el cual el comprador podrá solicitar devolución o reemplazo.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            3. Objeto de la Plataforma e Intermediación Tecnológica
          </h3>
          <p>
            IUBIZON opera exclusivamente como una plataforma tecnológica de
            intermediación que facilita la conexión entre compradores
            (institucionales o clientes finales) y proveedores o vendedores
            verificados. IUBIZON no es propietaria, fabricante, distribuidora
            ni responsable directa de los productos ofrecidos por los
            proveedores en la plataforma. Los proveedores son los únicos
            responsables de: publicar el catálogo de productos con información
            veraz, completa y actualizada; definir precios en moneda nacional
            Soles (PEN) incluyendo el Impuesto General a las Ventas (IGV)
            conforme a la ley; indicar el stock real y disponible; declarar
            las condiciones de garantía del producto; y cumplir con los plazos
            de entrega y las condiciones de despacho anunciadas.
          </p>
          <p className="mt-2">
            IUBIZON no se responsabiliza por la exactitud de la información
            publicada por los proveedores, por la calidad, idoneidad o
            legalidad de los productos ofrecidos, ni por el cumplimiento de
            las obligaciones legales de los proveedores en relación con los
            productos vendidos a través de la plataforma.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            4. Registro de Usuarios y Perfil de Vendedor
          </h3>
          <p>
            Para realizar compras en la plataforma no es obligatorio crear una
            cuenta de usuario: se permite la compra en modalidad de invitado,
            la cual podrá requerir únicamente los datos necesarios para el
            procesamiento del pago y la coordinación del despacho. Para
            publicar productos y operar como vendedor, el usuario debe
            completar previamente el proceso de registro proporcionando
            correo electrónico, contraseña segura y nombres completos, y
            proceder al inicio de sesión. Una vez registrado, el usuario
            deberá solicitar la conversión a perfil de vendedor desde la
            plataforma, completando los datos requeridos del negocio, tales
            como número de RUC, logo institucional, dirección fiscal, datos
            de contacto y cuenta bancaria para recepción de transferencias.
          </p>
          <p className="mt-2">
            El usuario es responsable de mantener la confidencialidad de sus
            credenciales de acceso y de todas las actividades que se realicen
            desde su cuenta. En caso de detectar un uso no autorizado de la
            cuenta, el usuario deberá notificar de forma inmediata a IUBIZON
            a través de los canales de contacto habilitados. IUBIZON no será
            responsable por pérdidas, daños o perjuicios derivados del uso no
            autorizado de la cuenta del usuario.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            5. Modalidades de Envío y Despacho
          </h3>
          <p>
            Para compras de un solo producto, el proveedor es responsable de
            gestionar el despacho y la coordinación del envío directo al
            cliente dentro de los plazos indicados en la ficha del producto.
            Cuando el cliente realiza una compra que incluye múltiples
            productos de uno o varios proveedores, IUBIZON ofrece la opción
            de gestionar un envío consolidado por cuenta propia, servicio que
            actualmente es cubierto por la plataforma sin costo adicional
            para el comprador. El plazo de entrega estimado se indicará en
            la ficha de cada producto y podrá variar según la ubicación del
            destinatario y la disponibilidad del stock.
          </p>
          <p className="mt-2">
            IUBIZON no se responsabiliza por demoras en los tiempos de entrega
            atribuibles al proveedor, a la empresa de transporte o a
            circunstancias ajenas al control de la plataforma, tales como
            desastres naturales, huelgas, restricciones viales o
            inconsistencias en la información de dirección proporcionada por
            el comprador. En caso de que el despacho sea gestionado por el
            proveedor, este deberá actualizar el código de seguimiento del
            envío en la plataforma dentro de las 24 horas siguientes a la
            despacho del producto.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            6. Pagos, Pasarela de Cobro y Comisiones de Servicio
          </h3>
          <p>
            Los pagos se procesan de forma exclusiva a través de la pasarela
            de cobro de Niubiz, la cual cumple con los estándares internacionales
            de seguridad PCI DSS Level 1. IUBIZON percibe una comisión por
            servicio del nueve por ciento (9%) sobre el costo de venta del
            producto, la cual se descuenta automáticamente de la liquidación
            correspondiente al proveedor. Para compras realizadas con tarjeta
            de crédito o débito por un monto inferior a S/ 40.00 (cuarenta
            soles), se aplicará un costo adicional de S/ 2.50 (dos con
            cincuenta soles) destinado a cubrir los gastos de protección de
            la transacción con tarjeta.
          </p>
          <p className="mt-2">
            Para productos propiedad de IUBIZON comercializados directamente
            por la plataforma, así como para servicios de mantenimiento,
            reparación o soporte técnico ofrecidos por IUBIZON, no será
            aplicable el cobro de comisión intermediaria, toda vez que dichos
            productos y servicios son prestados directamente por la empresa.
            Los precios mostrados en la plataforma incluyen el IGV de ley
            (18%) y constituyen el monto total que el comprador deberá abonar
            al momento de confirmar la compra.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            7. Retención de Pagos y Periodo de Protección al Cliente
          </h3>
          <p>
            IUBIZON resguarda los pagos realizados por el comprador durante
            un periodo de siete (7) días calendario de protección al cliente,
            contados a partir de la fecha confirmada de entrega del producto,
            incluyendo fines de semana y feriados. Durante dicho periodo, los
            fondos permanecerán retenidos en una cuenta segregada e
            independiente del patrimonio de IUBIZON. Transcurrido el plazo
            de siete días sin que se haya registrado ningún reporte, disputa
            o solicitud de devolución por parte del comprador en la
            plataforma, IUBIZON procederá a liberar y abonar los fondos
            correspondientes al proveedor dentro de un plazo máximo de tres
            (3) días hábiles siguientes a la fecha de liberación.
          </p>
          <p className="mt-2">
            En caso de que el comprador presente un reclamo válido dentro del
            periodo de protección, los fondos permanecerán retenidos hasta que
            se resuelva definitivamente la disputa conforme al procedimiento
            establecido en la plataforma. Una vez resuelta la disputa, los
            fondos serán transferidos a la parte que resulte favorecida
            conforme a la resolución adoptada.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            8. Módulo de Reembolsos y Devoluciones
          </h3>
          <p>
            Si el producto presenta alguna falla, defecto de fábrica,
            inconveniente o discrepancia con la descripción publicada en la
            ficha del producto, dentro de los siete (7) días de protección
            posteriores a la entrega, el cliente deberá registrar la solicitud
            de devolución o reemplazo a través del módulo de reembolsos de la
            plataforma, detallando de forma clara y completa el problema
            presentado, adjuntando fotografías o evidencias cuando corresponda,
            e indicando los datos del pedido asociado.
          </p>
          <p className="mt-2">
            IUBIZON actuará como intermediario en el proceso de seguimiento
            de la disputa, pudiendo solicitar información adicional a ambas
            partes para la correcta evaluación del caso. Para hacer efectiva
            la devolución, el cliente deberá enviar el producto directamente
            al proveedor, asumiendo el costo del flete de envío de retorno.
            Una vez que el proveedor confirme la recepción del producto en
            condiciones aceptables, IUBIZON procederá a reembolsar al cliente
            el monto pagado por el producto, descontando la comisión por
            servicio cobrada por la intermediación, la cual será retenida por
            IUBIZON en compensación por los servicios prestados. Vencidos los
            siete (7) días calendario de protección, no procederán
            devoluciones a través de la plataforma.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            9. Garantías del Producto
          </h3>
          <p>
            La garantía legal y de fábrica sobre el producto es otorgada
            directamente por el proveedor, de acuerdo a los términos,
            condiciones e indicaciones publicadas en la ficha técnica de cada
            artículo. IUBIZON no otorga garantía adicional alguna sobre los
            productos vendidos por los proveedores, limitándose a facilitar
            el canal de intermediación para la comercialización de los mismos.
            Cualquier reclamo por garantía que se presente con posterioridad
            al periodo de siete (7) días de protección al cliente deberá ser
            tramitado directamente con el proveedor responsable, conforme a
            los mecanismos establecidos en la ficha del producto y en la
            normativa peruana de protección al consumidor.
          </p>
          <p className="mt-2">
            El comprador podrá contactar al proveedor a través de los datos
            de contacto publicados en la plataforma para gestionar directamente
            cualquier reclamo por garantía. IUBIZON no intervendrá en dicho
            proceso, salvo que medie una solicitud formal del comprador y el
            proveedor haya incumplido con las condiciones de garantía
            declaradas en la plataforma.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            10. Obligaciones del Proveedor
          </h3>
          <p>
            El proveedor registrado en la plataforma IUBIZON se obliga a:
            (a) publicar información veraz, completa y actualizada sobre sus
            productos, incluyendo precio, especificaciones técnicas, stock
            disponible y condiciones de garantía; (b) procesar y despachar
            los pedidos dentro de los plazos indicados en la ficha de cada
            producto; (c) actualizar el código de seguimiento del envío en la
            plataforma dentro de las 24 horas siguientes al despacho; (d)
            responder a los reclamos y solicitudes de los compradores de
            forma oportuna y dentro de los plazos establecidos; (e) cumplir
            con la normativa peruana vigente en materia de protección al
            consumidor, comercio electrónico y tributaria; y (f) mantener
            actualizados sus datos de registro, incluyendo RUC, dirección
            fiscal, datos de contacto y cuenta bancaria para recepción de
            transferencias.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            11. Propiedad Intelectual y Contenido de la Plataforma
          </h3>
          <p>
            Todos los contenidos, diseños, logotipos, textos, gráficos,
            imágenes, software, códigos fuente y demás elementos protegidos
            por las leyes de propiedad intelectual que forman parte de la
            plataforma IUBIZON son propiedad exclusiva de IUBIZON COMPANY
            S.A.C. o de sus licenciantes, y están protegidos por las leyes
            peruanas e internacionales de propiedad intelectual. Queda
            prohibida la reproducción, distribución, comunicación pública,
            transformación o cualquier otra forma de explotación de dichos
            contenidos sin la autorización previa y por escrito de IUBIZON.
          </p>
          <p className="mt-2">
            El uso del nombre comercial IUBIZON, sus logotipos y demás
            signos distintivos está restringido exclusivamente a los fines
            de la operación de la plataforma. Cualquier uso no autorizado
            constituirá una infracción que podrá ser perseguida legalmente
            conforme a la legislación peruana aplicable.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            12. Responsabilidad y Limitación de Responsabilidad
          </h3>
          <p>
            IUBIZON actúa exclusivamente como intermediario tecnológico entre
            compradores y proveedores, y en ningún caso será responsable por:
            (a) la calidad, idoneidad, legalidad o disponibilidad de los
            productos ofrecidos por los proveedores; (b) el cumplimiento de
            las obligaciones legales de los proveedores en relación con los
            productos vendidos; (c) las pérdidas, daños o perjuicios directos
            o indirectos derivados del uso de la plataforma o de los
            productos adquiridos; (d) interrupciones, demoras o fallas en
            el funcionamiento de la plataforma por causas ajenas a su control;
            (e) la veracidad de la información publicada por los proveedores
            o por los compradores en la plataforma.
          </p>
          <p className="mt-2">
            En ningún caso la responsabilidad total de IUBIZON derivada del
            uso de la plataforma excederá el monto de la comisión cobrada
            por el servicio correspondiente a la transacción que haya dado
            origen al reclamo.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            13. Suspensión y Cancelación de Cuentas
          </h3>
          <p>
            IUBIZON se reserva la facultad discrecional de suspender o
            cancelar definitivamente el acceso o cuenta de cualquier usuario
            o empresa que incurra en cualquiera de las siguientes conductas:
            (a) maniobras fraudulentas, suplantación de identidad o uso no
            autorizado de medios de pago; (b) incumplimiento reiterado de las
            obligaciones de entrega o las condiciones de venta declaradas;
            (c) publicación de productos que atenten contra las normas legales
            vigentes en el Perú, que infrinjan derechos de propiedad
            intelectual o que representen un riesgo para la seguridad de los
            compradores; (d) conducta que resulte perjudicial para la
            reputación de la plataforma o para otros usuarios; y (e) el
            suministro de información falsa o engañosa durante el proceso
            de registro o en la publicación de productos.
          </p>
          <p className="mt-2">
            La suspensión o cancelación de la cuenta no generará derecho a
            indemnización alguna por parte de IUBIZON. Las decisiones
            adoptadas por IUBIZON en ejercicio de esta facultad serán
            definitivas e inapelables.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            14. Legislación Aplicable y Jurisdicción
          </h3>
          <p>
            Los presentes Términos y Condiciones se rigen por las leyes de
            la República del Perú. Para cualquier controversia derivada del
            uso de la plataforma, la interpretación o el cumplimiento de los
            presentes términos, las partes se someten a la jurisdicción
            exclusiva de los tribunales competentes de la ciudad de Lima,
            Perú, con renuncia expresa a cualquier otro fuero que pudiera
            corresponderles por razón de domicilio presente o futuro.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            15. Disposiciones Generales
          </h3>
          <p>
            Si cualquier cláusula de los presentes Términos y Condiciones
            fuera declarada nula o inaplicable, las demás cláusulas mantendrán
            su plena vigencia y efectos. La falta de ejercicio por parte de
            IUBIZON de cualquier derecho establecido en estos términos no
            constituirá una renuncia al mismo. Estos Términos y Condiciones
            constituyen el acuerdo completo entre el usuario e IUBIZON en
            relación con el uso de la plataforma, y reemplazan cualquier
            acuerdo o entendimiento anterior, ya sea escrito u oral, en
            relación con el mismo.
          </p>
        </div>
      </div>
    </div>
  );
}
