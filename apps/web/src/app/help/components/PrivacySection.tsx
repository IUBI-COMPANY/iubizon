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
          Protección de datos personales conforme a la Ley N° 29733 del Perú.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            1. Recopilación y Tratamiento de la Información
          </h3>
          <p>
            <strong>IUBIZON COMPANY S.A.C.</strong> recopila datos personales
            necesarios para la prestación de servicios, tales como nombres,
            documentos de identidad (DNI o RUC), correo electrónico, teléfono
            de contacto, dirección de despacho e información de facturación. Estos
            datos son recopilados tanto en compras ordinarias como al momento del
            registro o solicitud de perfil vendedor.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            2. Finalidad del Tratamiento de Datos
          </h3>
          <p>
            La información recopilada se utiliza exclusivamente para: (a)
            procesar compras, pagos y emisiones de cotizaciones en PDF; (b)
            coordinar despachos de pedidos con proveedores o couriers; (c)
            gestionar el módulo de reembolsos durante el periodo de 7 días de
            protección; (d) abonos a cuentas bancarias de vendedores; y (e)
            comunicaciones transaccionales del estado de pedido.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            3. Seguridad Financiera y Pasarela Niubiz
          </h3>
          <p>
            Iubizon no almacena ni registra números de tarjetas de crédito o
            débito en sus servidores. Toda la transacción de pago se realiza
            directamente en los servidores seguros y certificados de Niubiz bajo
            estándares internacionales de encriptación SSL y tokenización de
            seguridad bancaria.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            4. Compartición de Datos con Terceros
          </h3>
          <p>
            Tus datos de contacto y entrega son compartidos de forma
            estrictamente necesaria con el proveedor asignado o la empresa de
            transporte a cargo del despacho a fin de completar la entrega física
            del producto. No comercializamos ni cedemos bases de datos personales
            a terceros con fines publicitarios no autorizados.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </h3>
          <p>
            Conforme a la Ley N° 29733 de Protección de Datos Personales de la
            República del Perú, el usuario puede ejercer en cualquier momento sus
            derechos ARCO enviando una solicitud formal a nuestro correo oficial:{" "}
            <strong>iubizon.company@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
