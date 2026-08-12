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
          Última actualización: 2026.
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
            3. Consentimiento
          </h3>
          <p>
            Al acceder y utilizar la plataforma IUBIZON, el usuario otorga su
            consentimiento libre, previo, informado y expreso para el
            tratamiento de sus datos personales conforme a los términos
            establecidos en esta política. El consentimiento puede ser revocado
            en cualquier momento mediante solicitud formal al correo oficial.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            4. Seguridad Financiera y Pasarela Niubiz
          </h3>
          <p>
            IUBIZON no almacena ni registra números de tarjetas de crédito o
            débito en sus servidores. Toda la transacción de pago se realiza
            directamente en los servidores seguros y certificados de Niubiz bajo
            estándares internacionales de encriptación SSL y tokenización de
            seguridad bancaria.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            5. Medidas de Seguridad de los Datos
          </h3>
          <p>
            IUBIZON implementa medidas de seguridad administrativa, técnica y
            física para proteger los datos personales contra acceso no
            autorizado, pérdida, alteración o divulgación indebida. Estas
            medidas incluyen, entre otras, controles de acceso, cifrado de
            datos en tránsito y en reposo, auditorías periódicas y políticas
            internas de manejo de información.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            6. Compartición de Datos con Terceros
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
            7. Retención de Datos Personales
          </h3>
          <p>
            Los datos personales serán conservados durante el tiempo que el
            usuario mantenga una cuenta activa en la plataforma o resulten
            necesarios para el cumplimiento de las finalidades descritas. Una
            vez culminada la relación comercial, los datos serán eliminados o
            anonimizados dentro de un plazo máximo de 30 días, salvo que la
            ley exija su conservación por un periodo mayor.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            8. Compartición Internacional de Datos
          </h3>
          <p>
            IUBIZON no realiza transferencias internacionales de datos personales
            fuera del territorio de la República del Perú. En caso de que en el
            futuro se requiera dicha transferencia, se solicitará el
            consentimiento previo al usuario y se garantizará que el país
            receptor cuente con un nivel de protección adecuado conforme a la
            Ley N° 29733.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            9. Menores de Edad
          </h3>
          <p>
            Los servicios de la plataforma IUBIZON están dirigidos exclusivamente
            a personas mayores de 18 años. IUBIZON no recopila intencionalmente
            datos personales de menores de edad. Si se detectase el registro de
            un menor de edad, sus datos serán eliminados de forma inmediata.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            10. Cookies y Tecnologías de Rastreo
          </h3>
          <p>
            La plataforma IUBIZON utiliza cookies y tecnologías similares para
            mejorar la experiencia del usuario, recordar preferencias y obtener
            estadísticas de uso. El usuario puede gestionar el uso de cookies
            desde la configuración de su navegador. El bloqueo de cookies no
            afecta la funcionalidad básica de la plataforma, pero podría
            limitar ciertas características.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            11. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </h3>
          <p>
            Conforme a la Ley N° 29733 de Protección de Datos Personales de la
            República del Perú, el usuario puede ejercer en cualquier momento sus
            derechos ARCO enviando una solicitud formal a nuestro correo oficial:{" "}
            <strong>iubizon.company@gmail.com</strong>. IUBIZON responderá en un
            plazo máximo de 10 días hábiles desde la recepción de la solicitud.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            12. Modificaciones de esta Política
          </h3>
          <p>
            IUBIZON se reserva el derecho de modificar la presente Política de
            Privacidad en cualquier momento. Las modificaciones serán
            publicadas en esta misma página y serán efectivas desde su fecha de
            publicación. Se recomienda a los usuarios revisar periódicamente
            esta política para mantenerse informados sobre el tratamiento de
            sus datos personales.
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-[#112237] mb-1">
            13. Jurisdicción Aplicable
          </h3>
          <p>
            Para cualquier controversia derivada del tratamiento de datos
            personales, las partes se someten a la jurisdicción de los
            tribunales competentes de la ciudad de Lima, Perú, con renuncia
            expresa a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>
      </div>
    </div>
  );
}
