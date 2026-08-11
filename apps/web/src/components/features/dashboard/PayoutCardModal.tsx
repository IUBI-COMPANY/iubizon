"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, X, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface PayoutCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string | null;
  initialData?: {
    cardNumber?: string;
    expirationMonth?: string;
    expirationYear?: string;
    alias?: string;
    aliasType?: string;
  } | null;
  onSuccess: () => void;
}

export function PayoutCardModal({
  isOpen,
  onClose,
  companyId,
  initialData,
  onSuccess,
}: PayoutCardModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasType, setAliasType] = useState("PHONE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCardNumber(initialData.cardNumber || "");
      setExpMonth(initialData.expirationMonth?.toString() || "");
      setExpYear(initialData.expirationYear?.toString() || "");
      setAlias(initialData.alias || "");
      setAliasType(initialData.aliasType || "PHONE");
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!cardNumber.trim() && !alias.trim()) {
      toast.error("Ingresa el número de tarjeta o un alias (Yape/Plin)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/seller/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId || null,
          payout_card: {
            cardNumber: cardNumber.trim() || null,
            expirationMonth: expMonth || null,
            expirationYear: expYear || null,
            alias: alias.trim() || null,
            aliasType: alias.trim() ? aliasType : null,
          },
        }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { throw new Error(text || "Error del servidor"); }
      if (res.ok) {
        toast.success("Tarjeta de pago guardada con éxito");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar los datos de la tarjeta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="bg-purple-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 text-white rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Tarjeta para Pagos P2P
              </h3>
              <p className="text-xs text-purple-200">
                Yape, Plin o tarjeta para recibir pagos inmediatos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-purple-900">
            <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <p>
              Registra tu número de tarjeta o tu alias de Yape/Plin para recibir
              pagos inmediatos de iubizon. Los datos se guardan de forma segura.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#112237] block mb-1">
              Número de Tarjeta (16 dígitos)
            </label>
            <Input
              placeholder="4222520032925652"
              className="text-xs"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                Mes Expiración
              </label>
              <Input
                placeholder="12"
                className="text-xs"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                Año Expiración
              </label>
              <Input
                placeholder="2030"
                className="text-xs"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>

          <div className="border-t border-[#f1f5f9] pt-4">
            <label className="text-xs font-bold text-[#112237] block mb-1">
              O usa tu Alias (Yape / Plin)
            </label>
            <div className="flex gap-2">
              <select
                className="w-[100px] bg-white border border-[#e2e8f0] rounded-xl px-2 py-2 text-xs font-semibold text-[#112237] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={aliasType}
                onChange={(e) => setAliasType(e.target.value)}
              >
                <option value="PHONE">📱 Teléfono</option>
              </select>
              <Input
                placeholder="+51987654321"
                className="text-xs flex-1"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#f1f5f9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Tarjeta"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
