"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Navigation,
  Save,
  Upload,
} from "lucide-react";
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
  const [geoLoading, setGeoLoading] = useState(false);
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
    latitude: null as number | null,
    longitude: null as number | null,
    description: "",
  });

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleGeolocate = async () => {
    setGeoLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setGeoLoading(false);
      return;
    }

    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Forzar GPS de alta precisión
          timeout: 15000,
          maximumAge: 0,
        });
      });
    };

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      let locationName = "";
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es&zoom=18`,
          {
            headers: {
              "User-Agent": "IubizonMarketplace/1.0",
            },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (res.ok) {
          const data = await res.json();
          const road = data.address?.road || data.address?.pedestrian || "";
          const district =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            "";
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          const state = data.address?.state || "";

          const parts = [road, district, city || state].filter(Boolean);
          if (parts.length > 0) {
            locationName = parts.join(", ");
          } else if (data.display_name) {
            locationName = data.display_name
              .split(",")
              .slice(0, 3)
              .join(",")
              .trim();
          }
        }
      } catch {
        // Fallback
      }

      if (!locationName) {
        locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setFormData((prev) => ({
        ...prev,
        location: locationName,
        latitude,
        longitude,
      }));
    } catch {
      setError(
        "No se pudo obtener la ubicación automáticamente. Por favor escríbela manualmente.",
      );
    } finally {
      setGeoLoading(false);
    }
  };

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

      // Resetear valor del input de archivo para poder volver a seleccionar
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
        err instanceof Error
          ? err.message
          : "Error inesperado al registrar la empresa.",
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
              Crea tu perfil comercial para publicar productos y colaborar con
              tu equipo.
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
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#cbd5e1] hover:border-[#f25c05] rounded-3xl bg-[#f8fafc] transition-all">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white ring-4 ring-[#f25c05]/20 bg-white flex items-center justify-center shadow-md mb-3 cursor-pointer group hover:scale-105 transition-all"
                  title="Haz clic para seleccionar o cambiar el logotipo"
                >
                  {formData.logo_url ? (
                    <Image
                      src={formData.logo_url}
                      alt="Logo de la empresa"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-[#94a3b8] group-hover:text-[#f25c05] transition-colors" />
                  )}
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="w-7 h-7 animate-spin" />
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
                  className="text-xs font-bold border-[#e2e8f0] flex items-center gap-2 rounded-xl py-2 px-4 shadow-sm"
                  disabled={isUploadingLogo}
                >
                  <Upload className="w-4 h-4 text-[#f25c05]" />
                  {formData.logo_url
                    ? "Cambiar Logotipo de Empresa"
                    : "Subir Logotipo de Empresa"}
                </Button>

                {formData.logo_url ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-2">
                    ✓ Logotipo listo para guardar
                  </span>
                ) : (
                  <p className="text-[11px] text-[#94a3b8] mt-2">
                    Formato recomendado: PNG, JPG o WEBP cuadradas (500x500px)
                  </p>
                )}
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
                    onChange={(e) =>
                      handleInputChange("tax_type", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                  >
                    <option value="ruc20">
                      RUC 20 (Persona Jurídica / Empresa)
                    </option>
                    <option value="ruc10">
                      RUC 10 (Persona Natural con Negocio)
                    </option>
                    <option value="dni">
                      DNI / CE (Persona Natural / Vendedor Ind.)
                    </option>
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
                    onChange={(e) =>
                      handleInputChange("tax_id", e.target.value)
                    }
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

              {/* Ubicación */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Ubicación / Ciudad
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Lima, Perú"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    className="h-10 px-3 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] hover:border-[#f25c05]/40 transition-all flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#f25c05] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    title="Obtener ubicación actual por GPS"
                  >
                    {geoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f25c05]" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-[#f25c05]" />
                    )}
                    <span>
                      {geoLoading ? "Localizando..." : "Mi ubicación"}
                    </span>
                  </button>
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
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
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
