import { Store, Building2, CreditCard, Package } from "lucide-react";

export function SellSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <Store className="w-5 h-5 text-[#f25c05]" />
          Vender en IUBIZON (Empresas y Vendedores)
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Conecta tus productos tecnológicos con miles de compradores
          institucionales y personas en todo el Perú.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#475569]">
        <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
          <Building2 className="w-5 h-5 text-[#f25c05] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#112237] block mb-0.5 text-sm">Crea tu Perfil de Empresa</strong>
            Registra tu marca o empresa con RUC, personaliza tu catálogo comercial y gestiona tu equipo de trabajo de forma independiente.
          </div>
        </div>
        <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
          <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#112237] block mb-0.5 text-sm">Cobros y Transferencias Bancarias Directas</strong>
            Registra tu cuenta de ahorros o cuenta corriente en el panel de finanzas. Iubizon liquida y transfiere tus ventas de forma transparente.
          </div>
        </div>
        <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
          <Package className="w-5 h-5 text-[#f25c05] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#112237] block mb-0.5 text-sm">Gestión de Pedidos & Despachos</strong>
            Recibe notificaciones inmediatas ante cada venta, actualiza el código de seguimiento del envío y mantén la reputación de tu tienda alta.
          </div>
        </div>
      </div>
    </div>
  );
}
