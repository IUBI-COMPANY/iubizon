"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Building2, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface CreateCompanyStepProps {
  onCompanyCreated: (newCompany: {
    id: string;
    name: string;
    slug: string;
  }) => void;
}

export const CreateCompanyStep = ({
  onCompanyCreated,
}: CreateCompanyStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    logo_url: "",
    location: "",
    phone: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida (PNG, JPG, WEBP).");
      return;
    }

    setIsUploadingLogo(true);
    setError(null);

    try {
      // 1. Convertir inmediatamente a Data URL para guardado garantizado
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setFormData((prev) => ({ ...prev, logo_url: dataUrl }));

      if (e.target) {
        e.target.value = "";
      }

      // 2. Intentar subir al Storage publico
      const supabase = createClient();
      const fileName = `company-logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage
        .from("products")
        .upload(fileName, file, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          setFormData((prev) => ({
            ...prev,
            logo_url: publicUrlData.publicUrl,
          }));
        }
      }
    } catch (err: unknown) {
      console.error("Error al procesar logo:", err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la empresa o marca es obligatorio.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar la empresa.");
      }

      onCompanyCreated(data.company);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al crear la empresa.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-[#f1f5f9] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#f25c05]/10 text-[#f25c05] flex items-center justify-center font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#112237]">
              Paso 1: Registra tu Empresa o Marca Comercial
            </h2>
            <span className="bg-orange-100 text-[#f25c05] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Primer Paso
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Para empezar a vender en iubizon necesitas registrar la marca con la
            que publicarás tus productos.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logotipo de la Marca */}
        <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#cbd5e1] hover:border-[#f25c05] rounded-3xl bg-[#f8fafc] transition-all">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white ring-4 ring-[#f25c05]/20 bg-white flex items-center justify-center shadow-md mb-2 cursor-pointer group hover:scale-105 transition-all"
            title="Haz clic para seleccionar o cambiar el logotipo"
          >
            {formData.logo_url ? (
              <Image
                src={formData.logo_url}
                alt="Logo de la marca"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Building2 className="w-8 h-8 text-[#94a3b8] group-hover:text-[#f25c05] transition-colors" />
            )}
            {isUploadingLogo && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold border-[#e2e8f0] flex items-center gap-1.5 rounded-xl py-1.5 px-3.5 shadow-sm"
            disabled={isUploadingLogo}
          >
            <Upload className="w-3.5 h-3.5 text-[#f25c05]" />
            {formData.logo_url ? "Cambiar Logotipo" : "Subir Logotipo de Marca"}
          </Button>

          {formData.logo_url ? (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1.5">
              ✓ Logotipo listo para guardar
            </span>
          ) : (
            <p className="text-[10px] text-[#94a3b8] mt-1.5">
              Opcional: PNG, JPG o WEBP cuadradas (500x500px)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#112237] mb-1.5">
            Nombre Comercial o de la Marca *
          </label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ej: ElleonStore, Mi Tienda Tech"
            required
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              RUC / DNI / Tax ID (Opcional)
            </label>
            <Input
              value={formData.tax_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tax_id: e.target.value }))
              }
              placeholder="10750748827"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              Ubicación / Ciudad
            </label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Lima, Chorrillos"
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              Teléfono de Contacto
            </label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="972332824"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              Descripción Corta de tu Negocio
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ej: Tienda especializada en tecnología y accesorios"
              className="text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Registrando marca...
              </>
            ) : (
              "Continuar a Publicar Producto ➔"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
