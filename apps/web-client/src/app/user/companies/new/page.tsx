"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, Loader2, Save, Upload } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { useCompany } from "@/context/CompanyContext";
import { createClient } from "@/lib/supabase/client";

export default function NewCompanyPage() {
  const router = useRouter();
  const { refreshCompanies, setActiveCompanyId } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    tax_type: "ruc20", // ruc20 | ruc10 | dni
    tax_id: "",
    logo_url: "",
    phone: "",
    email: "",
    location: "",
    website: "",
    description: "",
  });

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

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
      const supabase = createClient();
      const fileName = `company-logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage
        .from("products")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) {
        // Fallback: usar vista previa Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            logo_url: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);
        setFormData((prev) => ({ ...prev, logo_url: publicUrlData.publicUrl }));
      }
    } catch (err: unknown) {
      console.error("Error al subir logo:", err);
      setError("No se pudo subir la imagen del logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la empresa es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formattedTaxId = formData.tax_id.trim()
        ? `${formData.tax_type.toUpperCase()}: ${formData.tax_id.trim()}`
        : null;

      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          tax_id: formattedTaxId,
          logo_url: formData.logo_url || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          location: formData.location.trim() || null,
          website: formData.website.trim() || null,
          description: formData.description.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la empresa.");

      await refreshCompanies();
      if (data.company?.id) {
        setActiveCompanyId(data.company.id);
      }

      router.push("/user/profile");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error inesperado al registrar la empresa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#112237] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Perfil
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#112237] text-white rounded-xl shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#112237]">
              Registrar mi Empresa
            </h1>
            <p className="text-sm text-[#64748b]">
              Crea tu perfil comercial para publicar productos y colaborar con tu equipo.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <Card className="border border-[#e2e8f0] bg-white shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logotipo de la Empresa */}
              <div className="flex flex-col items-center justify-center p-5 border border-dashed border-[#cbd5e1] rounded-2xl bg-[#f8fafc]">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#f25c05] bg-white flex items-center justify-center shadow-sm mb-3">
                  {formData.logo_url ? (
                    <Image
                      src={formData.logo_url}
                      alt="Logo de la empresa"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-[#94a3b8]" />
                  )}
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
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
                  className="text-xs font-semibold border-[#e2e8f0] flex items-center gap-1.5"
                  disabled={isUploadingLogo}
                >
                  <Upload className="w-3.5 h-3.5 text-[#f25c05]" />
                  {formData.logo_url
                    ? "Cambiar Logotipo"
                    : "Subir Logotipo de Empresa"}
                </Button>
                <p className="text-[11px] text-[#94a3b8] mt-1.5">
                  Formato recomendado: PNG, JPG o WEBP cuadradas (500x500px)
                </p>
              </div>

              {/* Nombre Comercial */}
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Nombre de la Empresa o Marca Comercial *
                </label>
                <Input
                  id="company_name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="ej: TecnoAulas SAC o Juan Pérez Equipos"
                  required
                />
              </div>

              {/* Tipo de Documento y Número */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tax_type"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Tipo de Identificación *
                  </label>
                  <select
                    id="tax_type"
                    value={formData.tax_type}
                    onChange={(e) => handleInputChange("tax_type", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                  >
                    <option value="ruc20">RUC 20 (Persona Jurídica / Empresa)</option>
                    <option value="ruc10">RUC 10 (Persona Natural con Negocio)</option>
                    <option value="dni">DNI / CE (Persona Natural / Vendedor Ind.)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="tax_id"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Número de RUC o DNI
                  </label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => handleInputChange("tax_id", e.target.value)}
                    placeholder={
                      formData.tax_type === "dni"
                        ? "ej: 72819201"
                        : "ej: 20123456789"
                    }
                  />
                </div>
              </div>

              {/* Teléfono y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Teléfono de Contacto
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+51 999 999 999"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Correo Corporativo
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              {/* Ubicación y Sitio Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Ubicación / Ciudad
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Lima, Perú"
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Sitio Web
                  </label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://miempresa.com"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Descripción de la Empresa
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Resumen de tus productos y servicios para colegios y empresas..."
                  rows={3}
                />
              </div>

              {/* Botón de Enviar */}
              <Button
                type="submit"
                className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
                disabled={isSaving || isUploadingLogo}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando Empresa...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Registrar Empresa
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
