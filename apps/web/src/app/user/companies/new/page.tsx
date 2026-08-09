"use client";

import { useRef, useMemo, useState } from "react";
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
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const companyFormSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "El nombre de la empresa o marca comercial debe tener al menos 2 caracteres.",
    ),
  legal_name: z.string().min(2, "La razón social es obligatoria."),
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
  department: z.string().min(1, "Selecciona un departamento."),
  province: z.string().min(1, "Selecciona una provincia."),
  district: z.string().min(1, "Selecciona un distrito."),
  location: z.string().min(3, "La dirección es obligatoria."),
  description: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { refreshCompanies, setActiveCompanyId } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
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
      legal_name: "",
      tax_type: "ruc20",
      tax_id: "",
      logo_url: "",
      phone: "",
      email: "",
      department: "Lima",
      province: "Lima",
      district: "",
      location: "",
      description: "",
    },
  });

  const formData = watch();

  const provincesForDepartment = useMemo(
    () => peruUbigeo.find((d) => d.name === formData.department)?.provinces || [],
    [formData.department],
  );
  const districtsForProvince = useMemo(
    () => provincesForDepartment.find((p) => p.name === formData.province)?.districts || [],
    [provincesForDepartment, formData.province],
  );

  const handleDepartmentChange = (department: string) => {
    setValue("department", department, { shouldValidate: true });
    setValue("province", "", { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
  };

  const handleProvinceChange = (province: string) => {
    setValue("province", province, { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
  };

  const handleDistrictChange = (district: string) => {
    setValue("district", district, { shouldValidate: true });
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

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/companies/logo", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setValue("logo_url", result.url, { shouldValidate: true });
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
          legal_name: values.legal_name?.trim() || null,
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

              {/* Tipo de Documento y Número — PRIMERO */}
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

              <div>
                <label
                  htmlFor="legal_name"
                  className="block text-sm font-medium text-[#334155] mb-1"
                >
                  Razón Social *
                </label>
                <Input
                  id="legal_name"
                  {...register("legal_name")}
                  placeholder="ej: TecnoAulas S.A.C."
                />
                <p className="text-xs text-[#94a3b8] mt-1">
                  Nombre legal registrado en SUNAT. Distinto al nombre
                  comercial.
                </p>
              </div>


              {/* Departamento, Provincia, Distrito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-[#334155] mb-1">
                    Departamento *
                  </label>
                  <Select value={formData.department || undefined} onValueChange={handleDepartmentChange}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {peruUbigeo.map((dep) => (
                        <SelectItem key={dep.name} value={dep.name}>{dep.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-red-500 font-medium mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-[#334155] mb-1">
                    Provincia *
                  </label>
                  <Select value={formData.province || undefined} onValueChange={handleProvinceChange} disabled={!formData.department}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {provincesForDepartment.map((prov) => (
                        <SelectItem key={prov.name} value={prov.name}>{prov.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && <p className="text-xs text-red-500 font-medium mt-1">{errors.province.message}</p>}
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-[#334155] mb-1">
                    Distrito *
                  </label>
                  <Select value={formData.district || undefined} onValueChange={handleDistrictChange} disabled={!formData.province}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {districtsForProvince.map((dist) => (
                        <SelectItem key={dist.name} value={dist.name}>{dist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-red-500 font-medium mt-1">{errors.district.message}</p>}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[#334155] mb-1">
                  Dirección *
                </label>
                <Input id="location" {...register("location")} placeholder="Av. Principal 123" />
                {errors.location && <p className="text-xs text-red-500 font-medium mt-1">{errors.location.message}</p>}
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
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Este correo se usará para notificarte de nuevas ventas y
                    despachos.
                  </p>
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
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
