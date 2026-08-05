"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Navigation,
  Save,
  Search,
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

const companyFormSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "El nombre de la empresa o marca comercial debe tener al menos 2 caracteres.",
    ),
  tax_type: z.enum(["ruc20", "ruc10"], {
    message: "Selecciona un tipo de RUC válido.",
  }),
  tax_id: z
    .string()
    .min(1, "El número de RUC es obligatorio.")
    .refine((val) => val.replace(/\D/g, "").length === 11, {
      message:
        "El RUC de la empresa debe tener exactamente 11 dígitos numéricos.",
    }),
  logo_url: z.string().optional(),
  phone: z.string().min(6, "Ingresa un teléfono de contacto válido."),
  email: z.string().email("Ingresa un correo electrónico corporativo válido."),
  location: z.string().min(3, "La ubicación o ciudad es obligatoria."),
  description: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { refreshCompanies, setActiveCompanyId } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [sunatLoading, setSunatLoading] = useState(false);
  const [sunatInfo, setSunatInfo] = useState<{
    verified: boolean;
    name?: string;
    message?: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      tax_type: "ruc20",
      tax_id: "",
      logo_url: "",
      phone: "",
      email: "",
      location: "",
      description: "",
    },
  });

  const formData = watch();

  const handleGeolocate = async () => {
    setGeoLoading(true);
    setServerError(null);

    if (!navigator.geolocation) {
      setServerError("Tu navegador no soporta geolocalización.");
      setGeoLoading(false);
      return;
    }

    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
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
            "";
          locationName = [road, district, city]
            .filter(Boolean)
            .join(", ")
            .trim();
        }
      } catch {
        // Fallback
      }

      if (!locationName) {
        locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setValue("location", locationName, { shouldValidate: true });
    } catch {
      setServerError(
        "No se pudo obtener la ubicación automáticamente. Por favor escríbela manualmente.",
      );
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSunatLookup = async (docOverride?: string) => {
    const doc = (docOverride || formData.tax_id).replace(/\D/g, "");
    if (!doc || doc.length !== 11) {
      setServerError(
        "Por favor ingresa un número de RUC válido de 11 dígitos (RUC 10 o RUC 20) para la facturación.",
      );
      return;
    }

    setSunatLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/sunat/lookup?docNumber=${doc}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.error || "No se encontró el RUC en SUNAT.");
        setSunatInfo(null);
        return;
      }

      setSunatInfo({
        verified: data.isVerified ?? true,
        name: data.name,
        message: `SUNAT: ${data.status || "ACTIVO"} - ${data.condition || "HABIDO"}`,
      });

      const autoTaxType = doc.startsWith("20") ? "ruc20" : "ruc10";
      setValue("tax_type", autoTaxType, { shouldValidate: true });
      setValue("tax_id", doc, { shouldValidate: true });
      if (data.name) {
        setValue("name", data.name, { shouldValidate: true });
      }
      if (data.address) {
        setValue("location", data.address, { shouldValidate: true });
      }
    } catch (err) {
      console.error("Error consultando SUNAT:", err);
      setServerError("Error al conectar con el servicio de SUNAT.");
    } finally {
      setSunatLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError(
        "Por favor selecciona una imagen válida (PNG, JPG, WEBP).",
      );
      return;
    }

    setIsUploadingLogo(true);
    setServerError(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setValue("logo_url", dataUrl, { shouldValidate: true });

      if (e.target) {
        e.target.value = "";
      }

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
          setValue("logo_url", publicUrlData.publicUrl, {
            shouldValidate: true,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Error al procesar logo:", err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (values: CompanyFormValues) => {
    setIsSaving(true);
    setServerError(null);

    try {
      const cleanTaxId = values.tax_id.replace(/\D/g, "");
      const formattedTaxId = `${values.tax_type.toUpperCase()}: ${cleanTaxId}`;

      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          tax_id: formattedTaxId,
          logo_url: values.logo_url,
          phone: values.phone.trim(),
          email: values.email.trim(),
          location: values.location.trim(),
          description: values.description?.trim() || null,
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
      setServerError(
        err instanceof Error
          ? err.message
          : "Error inesperado al registrar la empresa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Encabezado y Navegación */}
        <div className="mb-6">
          <Link
            href="/user/profile"
            className="inline-flex items-center text-sm font-semibold text-[#64748b] hover:text-[#f25c05] transition-colors mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mi Perfil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f25c05]/10 text-[#f25c05] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#112237]">
                Registrar Nueva Empresa o Marca
              </h1>
              <p className="text-sm text-[#64748b]">
                Completa la información oficial para empezar a vender tus
                productos en iubizon.
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Error de Servidor */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl">
            {serverError}
          </div>
        )}

        <Card className="border-[#e2e8f0] shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Cargar Logotipo */}
              <div>
                <p className="text-xs font-bold text-[#112237] mb-3 text-center">
                  Logotipo de la Empresa{" "}
                  <span className="text-[#94a3b8] font-normal">(Opcional)</span>
                </p>
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

                  {errors.logo_url && (
                    <p className="text-xs text-red-500 font-semibold mt-2">
                      {errors.logo_url.message}
                    </p>
                  )}
                </div>
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
                  {...register("name")}
                  placeholder="ej: TecnoAulas SAC o Juan Pérez Equipos"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.name.message}
                  </p>
                )}
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
                    {...register("tax_type")}
                    className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                  >
                    <option value="ruc20">
                      RUC 20 (Persona Jurídica / Empresa)
                    </option>
                    <option value="ruc10">
                      RUC 10 (Persona Natural con Negocio)
                    </option>
                  </select>
                  {errors.tax_type && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.tax_type.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="tax_id"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Número de RUC *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="tax_id"
                      {...register("tax_id", {
                        onChange: (e) => {
                          if (sunatInfo) setSunatInfo(null);
                          const clean = e.target.value.replace(/\D/g, "");
                          if (clean.length === 11) {
                            handleSunatLookup(clean);
                          }
                        },
                      })}
                      placeholder="ej: 20123456789 o 10123456789"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSunatLookup()}
                      disabled={sunatLoading || !formData.tax_id.trim()}
                      className="shrink-0 border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05]/10 font-semibold"
                    >
                      {sunatLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Search className="w-4 h-4 mr-1" />
                      )}
                      Validar SUNAT
                    </Button>
                  </div>
                  {errors.tax_id && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.tax_id.message}
                    </p>
                  )}
                  {sunatInfo && sunatInfo.verified && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        Verificado: <strong>{sunatInfo.name}</strong> (
                        {sunatInfo.message})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teléfono y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Teléfono de Contacto *
                  </label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+51 999 999 999"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#334155] mb-1"
                  >
                    Correo Corporativo *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contacto@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Ubicación / Ciudad *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="location"
                      {...register("location")}
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
                {errors.location && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Descripción de la Empresa{" "}
                  <span className="text-[#94a3b8] text-xs font-normal">
                    (Opcional)
                  </span>
                </label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Resumen de tus productos y servicios para colegios y empresas..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Botón de Enviar */}
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registrando empresa...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar y Crear Empresa
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
