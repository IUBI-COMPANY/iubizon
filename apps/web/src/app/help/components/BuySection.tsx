import { ShoppingBag } from "lucide-react";

export function BuySection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-[#f1f5f9] pb-4">
        <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#f25c05]" />
          Cómo Comprar en IUBIZON
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Sigue estos pasos para adquirir tecnología de forma rápida y segura.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">1</div>
          <h3 className="font-extrabold text-sm text-[#112237]">Arma tu Set o Paquete Tecnológico</h3>
          <p className="text-xs text-[#64748b]">Selecciona productos complementarios y agréguelos a tu paquete en un solo pago unificado.</p>
        </div>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">2</div>
          <h3 className="font-extrabold text-sm text-[#112237]">Cotización Oficial en PDF</h3>
          <p className="text-xs text-[#64748b]">Genera y descarga al instante una Cotización con RUC emitida por <strong>IUBIZON COMPANY S.A.C.</strong></p>
        </div>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">3</div>
          <h3 className="font-extrabold text-sm text-[#112237]">Pasarela de Pagos 100% Segura</h3>
          <p className="text-xs text-[#64748b]">Paga mediante tarjetas de crédito o débito a través de Niubiz con encriptación bancaria de alta seguridad.</p>
        </div>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">4</div>
          <h3 className="font-extrabold text-sm text-[#112237]">Despacho & Seguimiento</h3>
          <p className="text-xs text-[#64748b]">Monitorea el estado de tu pedido desde tu panel de usuario hasta recibirlo.</p>
        </div>
      </div>
    </div>
  );
}
