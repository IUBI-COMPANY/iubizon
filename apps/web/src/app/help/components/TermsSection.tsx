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
          plataforma iubizon.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            1. Aceptación del Servicio
          </h3>
          <p>
            Al acceder, navegar o realizar transacciones a través de la
            plataforma web iubizon.com, el usuario acepta de manera íntegra y
            sin reservas los presentes Términos y Condiciones administrados por{" "}
            <strong>IUBIZON COMPANY S.A.C.</strong> (RUC 20614600374). Si no está
            de acuerdo con estas cláusulas, deberá abstenerse de utilizar los
            servicios.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            2. Rol de la Plataforma e Intermediación Tecnológica
          </h3>
          <p>
            iubizon opera exclusivamente como una plataforma tecnológica de
            intermediación que facilita la conexión entre compradores
            (institucionales o clientes finales) y proveedores o vendedores
            verificados. Los proveedores son los únicos responsables de publicar
            el catálogo, definir precios en Soles (incluyen IGV de ley), indicar
            el stock real y declarar las condiciones de garantía del producto.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            3. Registro de Usuarios y Perfil de Vendedor
          </h3>
          <p>
            Para realizar compras no es obligatorio crear una cuenta: se permite
            la compra en modalidad de invitado. Para publicar productos y operar
            como vendedor, el usuario debe registrarse con correo, contraseña y
            nombres, e iniciar sesión. Posteriormente, desde la plataforma,
            deberá solicitar la conversión a perfil de vendedor completando los
            datos del negocio (RUC, logo, dirección fiscal y cuenta bancaria).
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            4. Modalidades de Envío y Despacho
          </h3>
          <p>
            Para compras de un solo producto, el proveedor gestiona el despacho y
            coordinación de envío directo al cliente. Cuando el cliente realiza
            una compra con múltiples productos (de uno o varios proveedores),
            iubizon ofrece la opción de gestionar un envío consolidado por
            cuenta propia (cubierto por la plataforma por el momento).
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            5. Pagos, Pasarela y Comisiones de Servicio
          </h3>
          <p>
            Los pagos se procesan de forma segura a través de la pasarela de
            Niubiz. Iubizon percibe una comisión por servicio del 9% del costo de
            venta del producto, la cual se descuenta de la liquidación del
            proveedor. En compras con tarjeta de crédito o débito menores a S/
            40, se aplica un costo adicional de S/ 2.50 destinado a la
            protección de tarjeta. Para productos propios comercializados
            directamente por iubizon o servicios de mantenimiento y reparación,
            no aplica cobro de comisión intermediaria.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            6. Retención de Pagos y Periodo de Protección al Cliente
          </h3>
          <p>
            Iubizon resguarda los pagos realizados por el comprador durante un
            periodo de 7 días calendario de protección al cliente, contados a
            partir de la fecha confirmada de entrega del producto (se incluyen
            fines de semana y feriados). Transcurrido dicho plazo sin que se
            haya registrado ningún reporte en la plataforma, iubizon procederá a
            liberar y abonar los fondos correspondientes al proveedor.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            7. Módulo de Reembolsos y Devoluciones
          </h3>
          <p>
            Si el producto presenta alguna falla, defecto de fábrica o
            inconveniente dentro de los 7 días de protección posteriores a la
            entrega, el cliente debe registrar la solicitud a través del módulo
            de reembolsos de la plataforma detallando el problema. Iubizon
            realizará el seguimiento de la disputa. Para hacer efectiva la
            devolución, el cliente enviará el producto directamente al
            proveedor, asumiendo el costo del flete de envío. Confirmado el
            retorno, se reembolsará al cliente el 100% del monto pagado
            (incluida la comisión). Vencidos los 7 días calendario, no procederán
            devoluciones a través de la plataforma.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            8. Garantías del Producto
          </h3>
          <p>
            La garantía legal y de fábrica sobre el producto es otorgada
            directamente por el proveedor de acuerdo a los términos e
            indicaciones publicadas en la ficha técnica de cada artículo.
            Cualquier reclamo por garantía posterior al periodo de 7 días de
            protección al cliente deberá ser tramitado directamente con el
            proveedor responsable.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            9. Suspensión de Cuentas e Infracciones
          </h3>
          <p>
            iubizon se reserva la facultad discrecional de suspender o cancelar
            definitivamente el acceso o cuenta de cualquier usuario o empresa
            que incurra en maniobras fraudulentas, suplantación de identidad,
            incumplimiento reiterado en las entregas, o que publique productos que
            atenten contra las normas legales vigentes en el Perú.
          </p>
        </div>
      </div>
    </div>
  );
}
