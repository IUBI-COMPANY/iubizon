"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EditCompanyModalProps {
  company: {
    id: string;
    name: string;
    slug?: string | null;
    tax_id: string | null;
    logo_url: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCompany: {
    id: string;
    name: string;
    slug?: string | null;
    tax_id: string | null;
    logo_url: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
  }) => void;
}

export const EditCompanyModal = ({
  company,
  isOpen,
  onClose,
  onSuccess,
}: EditCompanyModalProps) => {
  const [formData, setFormData] = useState({
    name: company.name || "",
    tax_id: company.tax_id || "",
    logo_url: company.logo_url || "",
    phone: company.phone || "",
    email: company.email || "",
    location: company.location || "",
    description: company.description || "",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("El logotipo no debe superar los 5 MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);

      // 1. Convertir inmediatamente a Data URL para guardado garantizado
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setFormData((prev) => ({ ...prev, logo_url: dataUrl }));

      // 2. Intentar subir al Storage publico
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `company-logos/${company.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          setFormData((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
        }
      }
    } catch {
      setError("Error al procesar la imagen del logotipo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la empresa es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la empresa.");
      }

      onSuccess({
        id: company.id,
        ...data.company,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar los cambios.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#e2e8f0] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#112237] transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-[#f1f5f9] pb-4">
          <div className="w-10 h-10 bg-[#f25c05]/10 text-[#f25c05] rounded-2xl flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#112237]">
              Editar Perfil de Empresa
            </h2>
            <p className="text-xs text-[#64748b]">
              Actualiza la información visible en tu tienda oficial
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Carga de Logo */}
          <div className="flex items-center gap-4 p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
            <div className="relative w-16 h-16 rounded-2xl bg-[#f25c05] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-sm border border-white">
              {formData.logo_url ? (
                <Image
                  src={formData.logo_url}
                  alt={formData.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{formData.name?.[0]?.toUpperCase() || <Building2 className="w-8 h-8" />}</span>
              )}

              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#112237] mb-1">
                Logotipo Comercial
              </p>
              <label className="inline-flex items-center gap-1.5 bg-white border border-[#e2e8f0] text-xs font-semibold text-[#334155] px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Subir logo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Nombre de la Empresa / Marca *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: ElleonStore"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                RUC / DNI / Tax ID
              </label>
              <Input
                value={formData.tax_id}
                onChange={(e) => handleInputChange("tax_id", e.target.value)}
                placeholder="10750748827"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Ubicación / Ciudad
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Lima, Chorrillos"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Teléfono de Contacto
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="972332824"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Correo Electrónico Comercial
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contacto@miempresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Descripción Comercial
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Breve reseña sobre tus productos y experiencia..."
              rows={3}
              className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || uploadingLogo}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
