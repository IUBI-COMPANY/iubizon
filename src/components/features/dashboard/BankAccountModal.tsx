"use client";

import { useState, useEffect } from "react";
import { CreditCard, Building2, CheckCircle, X, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string | null;
  initialData?: {
    bank_name?: string;
    account_type?: string;
    account_number?: string;
    cci?: string;
    holder_name?: string;
    holder_doc?: string;
  } | null;
  onSuccess: () => void;
}

export function BankAccountModal({
  isOpen,
  onClose,
  companyId,
  initialData,
  onSuccess,
}: BankAccountModalProps) {
  const [bankName, setBankName] = useState(initialData?.bank_name || "BCP");
  const [accountType, setAccountType] = useState(initialData?.account_type || "corriente");
  const [accountNumber, setAccountNumber] = useState(initialData?.account_number || "");
  const [cci, setCci] = useState(initialData?.cci || "");
  const [holderName, setHolderName] = useState(initialData?.holder_name || "");
  const [holderDoc, setHolderDoc] = useState(initialData?.holder_doc || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setBankName(initialData.bank_name || "BCP");
      setAccountType(initialData.account_type || "corriente");
      setAccountNumber(initialData.account_number || "");
      setCci(initialData.cci || "");
      setHolderName(initialData.holder_name || "");
      setHolderDoc(initialData.holder_doc || "");
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !holderName.trim()) {
      toast.error("Por favor ingresa el número de cuenta y el titular.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/seller/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId || null,
          bank_name: bankName,
          account_type: accountType,
          account_number: accountNumber.trim(),
          cci: cci.trim(),
          holder_name: holderName.trim(),
          holder_doc: holderDoc.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Cuenta bancaria configurada con éxito");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Error al guardar la cuenta bancaria");
      }
    } catch (err) {
      console.error("Error al guardar cuenta bancaria:", err);
      toast.error("Error al guardar los datos bancarios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden">
        {/* Encabezado */}
        <div className="bg-[#112237] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f25c05] text-white rounded-xl shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Cuenta Bancaria para Abonos
              </h3>
              <p className="text-xs text-slate-300">
                Registra la cuenta donde iubizon te transferirá tus ventas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Tus datos bancarios se guardan de forma encriptada y son utilizados exclusivamente por iubizon para realizar las liquidaciones de tus productos entregados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                Banco / Entidad Financiera *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs font-semibold text-[#112237] focus:ring-2 focus:ring-[#f25c05] focus:outline-none"
              >
                <option value="BCP">BCP - Banco de Crédito del Perú</option>
                <option value="Interbank">Interbank</option>
                <option value="BBVA">BBVA Perú</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="Banco de la Nación">Banco de la Nación</option>
                <option value="Caja Huancayo">Caja Huancayo</option>
                <option value="Caja Arequipa">Caja Arequipa</option>
                <option value="Otro">Otro Banco / Financiera</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                Tipo de Cuenta *
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs font-semibold text-[#112237] focus:ring-2 focus:ring-[#f25c05] focus:outline-none"
              >
                <option value="corriente">Cuenta Corriente</option>
                <option value="ahorros">Cuenta de Ahorros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#112237] block mb-1">
              Número de Cuenta *
            </label>
            <Input
              value={accountNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
              placeholder="Ej: 191-98765432-0-12 ó 987654321"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#112237] block mb-1">
              Código CCI (Interbancario - 20 dígitos)
            </label>
            <Input
              value={cci}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCci(e.target.value)}
              placeholder="Ej: 00219100987654320124 (Opcional)"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                Nombre / Razón Social del Titular *
              </label>
              <Input
                value={holderName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHolderName(e.target.value)}
                placeholder="Ej: SigmaSkill Store S.A.C."
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#112237] block mb-1">
                RUC o DNI del Titular
              </label>
              <Input
                value={holderDoc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHolderDoc(e.target.value)}
                placeholder="Ej: 20634600385"
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#f1f5f9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Datos Bancarios"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
