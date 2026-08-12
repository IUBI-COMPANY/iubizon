import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import type { ExtractedCompanyData } from "@/lib/services/documentExtractor";
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const createCompanyStepSchema = z.object({
  tax_id: z
    .string()
    .min(1, "El número de RUC es obligatorio.")
    .refine((val) => val.replace(/\D/g, "").length === 11, {
      message: "El RUC debe tener exactamente 11 dígitos numéricos.",
    }),
  name: z
    .string()
    .min(2, "El nombre comercial debe tener al menos 2 caracteres."),
  legal_name: z.string().min(2, "La razón social es obligatoria."),
  email: z.string().email("Ingresa un correo electrónico válido."),
  logo_url: z.string().optional(),
  tax_id_document_url: z.string().optional(),
  phone: z.string().min(6, "Ingresa un teléfono de contacto válido."),
  department: z.string().min(1, "Selecciona un departamento."),
  province: z.string().min(1, "Selecciona una provincia."),
  district: z.string().min(1, "Selecciona un distrito."),
  location: z.string().min(3, "La dirección es obligatoria."),
  description: z.string().optional(),
  accept_terms: z.literal(true, {
    errorMap: () => ({
      message:
        "Debes aceptar los términos y condiciones para registrar tu empresa.",
    }),
  }),
});

type CreateCompanyStepValues = z.infer<typeof createCompanyStepSchema>;

interface CreateCompanyStepProps {
  onCompanyCreated: (newCompany: {
    id: string;
    name: string;
    slug: string;
  }) => void;
  extractedData: ExtractedCompanyData | null;
  taxIdDocumentUrl: string | null;
  onBack: () => void;
}

export const CreateCompanyStep = ({
  onCompanyCreated,
  extractedData,
  taxIdDocumentUrl,
  onBack,
}: CreateCompanyStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [sunatLoading, setSunatLoading] = useState(false);
  const [sunatInfo, setSunatInfo] = useState<{
    verified: boolean;
    name?: string;
    message?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateCompanyStepValues>({
    resolver: zodResolver(createCompanyStepSchema),
    defaultValues: {
      tax_id: "",
      name: "",
      legal_name: "",
      email: "",
      logo_url: "",
      tax_id_document_url: taxIdDocumentUrl || "",
      phone: "",
      department: "Lima",
      province: "Lima",
      district: "",
      location: "",
      description: "",
      accept_terms: false as any,
    },
  });

  const formData = watch();

  const provincesForDepartment = useMemo(
    () =>
      peruUbigeo.find((d) => d.name === formData.department)?.provinces || [],
    [formData.department],
  );
  const districtsForProvince = useMemo(
    () =>
      provincesForDepartment.find((p) => p.name === formData.province)
        ?.districts || [],
    [provincesForDepartment, formData.province],
  );

  // Pre-rellenar formulario cuando se recibe extractedData (pasado desde el paso 1)
  useEffect(() => {
    const opts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
    if (taxIdDocumentUrl) {
      setValue("tax_id_document_url", taxIdDocumentUrl, opts);
    }
    if (extractedData) {
      if (extractedData.tax_id) {
        setValue("tax_id", extractedData.tax_id, opts);
        handleSunatLookup(extractedData.tax_id);
      }
      if (extractedData.legal_name) {
        setValue("legal_name", extractedData.legal_name, opts);
      }
      if (extractedData.name) {
        setValue("name", extractedData.name, opts);
      }
      if (extractedData.phone) {
        setValue("phone", extractedData.phone, opts);
      }
      if (extractedData.email) {
        setValue("email", extractedData.email, opts);
      }

      // Autocompletar ubigeo en cascada de forma secuencial y asíncrona para sincronizar los Selects de React/Radix
      if (extractedData.department) {
        const cleanText = (str: string) =>
          str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();

        const depNorm = cleanText(extractedData.department);
        const matchedDep = peruUbigeo.find(
          (d) => cleanText(d.name) === depNorm,
        );

        if (matchedDep) {
          setValue("department", matchedDep.name, opts);

          // Esperar a que React renderice las provincias disponibles del departamento
          setTimeout(() => {
            if (extractedData.province) {
              const provNorm = cleanText(extractedData.province);
              const matchedProv = matchedDep.provinces.find(
                (p) => cleanText(p.name) === provNorm,
              );

              if (matchedProv) {
                setValue("province", matchedProv.name, opts);

                // Esperar a que React renderice los distritos disponibles de la provincia
                setTimeout(() => {
                  if (extractedData.district) {
                    const distNorm = cleanText(extractedData.district);
                    const matchedDist = matchedProv.districts.find(
                      (d) => cleanText(d.name) === distNorm,
                    );

                    if (matchedDist) {
                      setValue("district", matchedDist.name, opts);
                    }
                  }
                }, 50);
              }
            }
          }, 50);
        }
      }

      if (extractedData.location) {
        setValue("location", extractedData.location, opts);
      }

      if (extractedData.description) {
        setValue("description", extractedData.description, opts);
      }

      if (extractedData.status) {
        setSunatInfo({
          verified: true,
          name: extractedData.legal_name || extractedData.name || "",
          message: `SUNAT (IA): ${extractedData.status} - ${extractedData.condition || "HABIDO"}`,
        });
      }
    }
  }, [extractedData, taxIdDocumentUrl]);

  const handleDepartmentChange = (dep: string) => {
    const opts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
    setValue("department", dep, opts);
    setValue("province", "", opts);
    setValue("district", "", opts);
  };

  const handleProvinceChange = (prov: string) => {
    const opts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
    setValue("province", prov, opts);
    setValue("district", "", opts);
  };

  const handleDistrictChange = (dist: string) => {
    setValue("district", dist, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleSunatLookup = async (docNum?: string) => {
    const doc = (docNum || formData.tax_id).replace(/\D/g, "");
    if (!doc || doc.length !== 11) {
      toast.error("Por favor ingresa un RUC válido de 11 dígitos.", "SUNAT");
      return;
    }

    setSunatLoading(true);

    try {
      const res = await fetch(`/api/sunat/lookup?docNumber=${doc}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "No se encontró el RUC en SUNAT.", "SUNAT");
        setSunatInfo(null);
        return;
      }

      setSunatInfo({
        verified: data.isVerified ?? true,
        name: data.name,
        message: `SUNAT: ${data.status || "ACTIVO"} - ${data.condition || "HABIDO"}`,
      });

      const opts = {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      };
      setValue("tax_id", doc, opts);
      if (data.name) {
        setValue("legal_name", data.name, opts);
        // Usar getValues() en tiempo real (no el snapshot formData que puede estar desactualizado)
        if (!getValues("name")) {
          setValue("name", data.name, opts);
        }
      }
      if (data.address && !getValues("location")) {
        setValue("location", data.address, opts);
      }
    } catch {
      toast.error("Error al conectar con el servicio de SUNAT.", "SUNAT");
    } finally {
      setSunatLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Por favor selecciona una imagen válida (PNG, JPG, WEBP).",
        "Logo",
      );
      return;
    }

    setIsUploadingLogo(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setValue("logo_url", dataUrl, { shouldValidate: true });

      if (e.target) e.target.value = "";

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/companies/logo", {
        method: "POST",
        body: fd,
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

  const onSubmit = async (values: CreateCompanyStepValues) => {
    try {
      setIsLoading(true);

      const cleanTaxId = values.tax_id.replace(/\D/g, "");
      const formattedTaxId = cleanTaxId.startsWith("20")
        ? `RUC20: ${cleanTaxId}`
        : `RUC10: ${cleanTaxId}`;

      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          legal_name: values.legal_name.trim(),
          tax_id: formattedTaxId,
          tax_id_document_url: values.tax_id_document_url || null,
          logo_url: values.logo_url,
          email: values.email.trim(),
          location: values.location.trim(),
          phone: values.phone.trim(),
          description: values.description?.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al registrar la empresa.");

      onCompanyCreated(data.company);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear la empresa.",
        "Error",
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
              Paso 2: Confirmar y Completar Datos de la Empresa
            </h2>
            <span className="bg-orange-100 text-[#f25c05] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Datos Extraídos
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Por favor, revisa y completa los campos. Puedes modificarlos si es
            necesario antes de registrar tu empresa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Logotipo */}
        <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#cbd5e1] hover:border-[#f25c05] rounded-3xl bg-[#f8fafc] transition-all">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white ring-4 ring-[#f25c05]/20 bg-white flex items-center justify-center shadow-md mb-2 cursor-pointer group hover:scale-105 transition-all"
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
              Logotipo listo para guardar
            </span>
          ) : (
            <p className="text-[10px] text-[#94a3b8] mt-1.5">
              PNG, JPG o WEBP cuadradas (500x500px)
            </p>
          )}
        </div>

        <FormField
          name="tax_id"
          label="Número de RUC20 ó RUC10"
          required
          error={errors.tax_id?.message}
        >
          <div className="flex gap-2">
            <Input
              id="field_tax_id"
              {...register("tax_id", {
                onChange: (e) => {
                  if (sunatInfo) setSunatInfo(null);
                  const clean = e.target.value.replace(/\D/g, "");
                  if (clean.length === 11) handleSunatLookup(clean);
                },
              })}
              placeholder="ej: 20123456789 o 10123456789"
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSunatLookup()}
              disabled={sunatLoading || !formData.tax_id.trim()}
              className="shrink-0 border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05]/10 text-xs font-bold"
            >
              {sunatLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Search className="w-3.5 h-3.5 mr-1" />
              )}
              Validar SUNAT
            </Button>
          </div>
          {sunatInfo?.verified && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>
                Verificado: <strong>{sunatInfo.name}</strong> (
                {sunatInfo.message})
              </span>
            </div>
          )}
        </FormField>

        <FormField
          name="name"
          label="Nombre Comercial"
          required
          error={errors.name?.message}
        >
          <Input
            id="field_name"
            {...register("name")}
            placeholder="Ej: ElleonStore, Mi Tienda Tech"
            className="text-xs"
          />
        </FormField>

        <FormField
          name="legal_name"
          label="Razón Social"
          required
          error={errors.legal_name?.message}
          hint="Nombre legal registrado en SUNAT"
        >
          <Input
            id="field_legal_name"
            {...register("legal_name")}
            placeholder="Ej: ElleonStore S.A.C."
            className="text-xs"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="email"
            label="Correo Electrónico"
            required
            error={errors.email?.message}
          >
            <Input
              id="field_email"
              {...register("email")}
              type="email"
              placeholder="contacto@empresa.com"
              className="text-xs"
            />
          </FormField>

          <FormField
            name="phone"
            label="Teléfono de Contacto"
            required
            error={errors.phone?.message}
          >
            <Input
              id="field_phone"
              {...register("phone")}
              placeholder="972332824"
              className="text-xs"
            />
          </FormField>
        </div>

        {/* Departamento, Provincia, Distrito */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            name="department"
            label="Departamento"
            required
            error={errors.department?.message}
          >
            <Select
              value={formData.department || undefined}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {peruUbigeo.map((dep) => (
                  <SelectItem
                    key={dep.name}
                    value={dep.name}
                    className="text-xs"
                  >
                    {dep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            name="province"
            label="Provincia"
            required
            error={errors.province?.message}
          >
            <Select
              value={formData.province || undefined}
              onValueChange={handleProvinceChange}
              disabled={!formData.department}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {provincesForDepartment.map((prov) => (
                  <SelectItem
                    key={prov.name}
                    value={prov.name}
                    className="text-xs"
                  >
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            name="district"
            label="Distrito"
            required
            error={errors.district?.message}
          >
            <Select
              value={formData.district || undefined}
              onValueChange={handleDistrictChange}
              disabled={!formData.province}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {districtsForProvince.map((dist) => (
                  <SelectItem
                    key={dist.name}
                    value={dist.name}
                    className="text-xs"
                  >
                    {dist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="location"
            label="Dirección"
            required
            error={errors.location?.message}
          >
            <Input
              id="field_location"
              {...register("location")}
              placeholder="Av. Principal 123, Urb. La Villa"
              className="text-xs"
            />
          </FormField>

          <FormField
            name="description"
            label="Descripción"
            optional
            error={errors.description?.message}
          >
            <Input
              id="field_description"
              {...register("description")}
              placeholder="Ej: Tienda especializada en tecnología"
              className="text-xs"
            />
          </FormField>
        </div>

        {/* Términos y Condiciones */}
        <div className="pt-3 pb-1 border-t border-[#f1f5f9]">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="step_accept_terms"
              {...register("accept_terms")}
              className="w-4 h-4 rounded border-[#cbd5e1] text-[#f25c05] focus:ring-[#f25c05] mt-0.5 accent-[#f25c05]"
            />
            <span className="text-xs text-[#64748b] leading-tight">
              Acepto los{" "}
              <a
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f25c05] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                términos y condiciones
                <ExternalLink className="w-3 h-3" />
              </a>{" "}
              de la plataforma iubizon y autorizo la creación de mi perfil
              comercial.
            </span>
          </label>
          {errors.accept_terms && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.accept_terms.message}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[#f1f5f9] flex justify-between items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="border-[#cbd5e1] text-[#64748b] hover:bg-slate-50 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Ficha RUC
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Registrando empresa...
              </>
            ) : (
              "Confirmar y Guardar Empresa"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
