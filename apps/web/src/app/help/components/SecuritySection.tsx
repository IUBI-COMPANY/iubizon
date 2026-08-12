import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#f25c05]" />
          Protección iubizon & Garantías
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Compostura legal y técnica diseñada para respaldar cada transacción
          comercial en la plataforma.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569]">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Protección de 7 Días al Cliente & Garantía del Proveedor
          </h3>
          <p>
            Cuentas con 7 días calendario de protección desde que recibes tu
            producto para verificar su correcto funcionamiento. En caso de
            fallas o inconvenientes, puedes solicitar la devolución a través
            de nuestro módulo de reembolsos. Adicionalmente, cada producto
            cuenta con la garantía oficial de fábrica o tienda declarada por el
            proveedor al momento de su publicación.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Pagos Retenidos y Protección de Fondos
          </h3>
          <p>
            Iubizon retiene el pago del cliente y solo realiza el abono al
            proveedor una vez transcurridos los 7 días de protección sin
            reclamos. De esta forma, garantizamos que tu dinero esté respaldado
            ante cualquier incumplimiento.
          </p>
        </div>

        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
          <h3 className="font-extrabold text-sm text-[#112237]">
            Prevención contra Transacciones Fraudulentas & Niubiz
          </h3>
          <p>
            Auditamos las solicitudes de venta y las empresas asociadas para
            garantizar transacciones legítimas. Los pagos son procesados
            directamente por la pasarela de Niubiz con encriptación bancaria de
            alta seguridad SSL.
          </p>
        </div>
      </div>
    </div>
  );
}
