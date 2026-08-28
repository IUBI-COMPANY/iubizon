"use client";

import {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {AlertTriangle, Building2, Camera, Loader2, Lock, Trash2, X,} from "lucide-react";
import {useCompany} from "@/context/CompanyContext";
import {useToast} from "@/context/ToastContext";
import {Button} from "@/components/ui/Button";
import {Input} from "@/components/ui/Input";
import {FichaRucUploader} from "@/components/ui/FichaRucUploader";
import type {ExtractedCompanyData} from "@/lib/services/documentExtractor";

const editCompanySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres."),
  legal_name: z.string().min(2, "La razón social es obligatoria."),
  tax_id: z.string().optional(),
  tax_id_document_url: z.string().optional(),
  logo_url: z.string().optional(),
  phone: z.string().min(6, "Ingresa un teléfono de contacto válido."),
  email: z.string().email("Ingresa un correo electrónico corporativo válido."),
  location: z.string().min(3, "La ubicación o ciudad es obligatoria."),
  description: z.string().optional(),
});

type EditCompanyValues = z.infer<typeof editCompanySchema>;

interface EditCompanyModalProps {
  company: {
    id: string;
    name: string;
    slug?: string | null;
    legal_name?: string | null;
    tax_id: string | null;
    tax_id_document_url?: string | null;
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
    legal_name?: string | null;
    tax_id: string | null;
    tax_id_document_url?: string | null;
    logo_url: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
  }) => void;
  onDeleteSuccess?: () => void;
}

export const EditCompanyModal = ({
  company,
  isOpen,
  onClose,
  onSuccess,
  onDeleteSuccess,
}: EditCompanyModalProps) => {
  const router = useRouter();
  const toast = useToast();
  const { refreshCompanies, activeCompany, setActiveCompanyId } = useCompany();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [freshCompany, setFreshCompany] = useState(company);

  // Estados para modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cleanTaxId = company.tax_id ? company.tax_id.replace(/\D/g, "") : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditCompanyValues>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      name: company.name || "",
      tax_id: cleanTaxId || "",
      legal_name: company.legal_name || "",
      logo_url: company.logo_url || "",
      phone: company.phone || "",
      email: company.email || "",
      location: company.location || "",
      description: company.description || "",
    },
  });

  // Cada vez que cambia la empresa o se abre el modal: resetear inmediatamente
  // con los datos del context (disponibles síncronamente) y luego refinar
  // con datos frescos del servidor para evitar datos obsoletos o campos vacíos.
  useEffect(() => {
    if (!isOpen || !company?.id) return;

    // 1. Limpiar errores previos
    setServerError(null);
    setDeleteError(null);
    setShowDeleteConfirm(false);
    setDeleteConfirmInput("");

    // 2. Reset INMEDIATO con los datos del context (síncrono — sin esperar al fetch)
    const rawTaxIdImmediate = company.tax_id
      ? company.tax_id.replace(/RUC\d+:\s*/i, "").replace(/\D/g, "")
      : "";
    setFreshCompany(company);
    reset({
      name: company.name || "",
      tax_id: rawTaxIdImmediate,
      tax_id_document_url: company.tax_id_document_url || "",
      legal_name: company.legal_name || "",
      logo_url: company.logo_url || "",
      phone: company.phone || "",
      email: company.email || "",
      location: company.location || "",
      description: company.description || "",
    });

    // 3. Refrescar desde el servidor en segundo plano para asegurar datos actualizados
    const controller = new AbortController();

    fetch(`/api/companies/${company.id}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.company) return;
        const c = data.company;
        setFreshCompany(c);
        const rawTaxId = c.tax_id
          ? c.tax_id.replace(/RUC\d+:\s*/i, "").replace(/\D/g, "")
          : "";
        reset({
          name: c.name || "",
          tax_id: rawTaxId,
          tax_id_document_url: c.tax_id_document_url || "",
          legal_name: c.legal_name || "",
          logo_url: c.logo_url || "",
          phone: c.phone || "",
          email: c.email || "",
          location: c.location || "",
          description: c.description || "",
        });
      })
      .catch(() => {
        // El AbortController cancela el fetch cuando el companyId cambia — ignorar ese error
      });

    return () => {
      controller.abort();
    };
  }, [company.id, isOpen, reset]);

  if (!isOpen) return null;

  const formData = watch();

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setServerError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("company_id", company.id);

      const res = await fetch("/api/companies/logo", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al subir");

      setValue("logo_url", result.url, { shouldValidate: true });
    } catch (err: unknown) {
      console.error("Error subiendo logo:", err);
      setServerError("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleExtractedDocument = (
    url: string,
    extractedData?: ExtractedCompanyData | null,
  ) => {
    setValue("tax_id_document_url", url, { shouldValidate: true });

    if (extractedData) {
      if (extractedData.legal_name && !formData.legal_name) {
        setValue("legal_name", extractedData.legal_name, {
          shouldValidate: true,
        });
      }
      if (extractedData.name && !formData.name) {
        setValue("name", extractedData.name, { shouldValidate: true });
      }
      if (extractedData.location && !formData.location) {
        setValue("location", extractedData.location, {
          shouldValidate: true,
        });
      }
      if (extractedData.phone && !formData.phone) {
        setValue("phone", extractedData.phone, { shouldValidate: true });
      }
      if (extractedData.email && !formData.email) {
        setValue("email", extractedData.email, { shouldValidate: true });
      }
    }
  };

  const onSubmit = async (values: EditCompanyValues) => {
    try {
      setSaving(true);
      setServerError(null);

      // Construir tax_id: mantener el de la BD si ya existe; solo formatearlo si es nuevo
      const existingTaxId = freshCompany.tax_id;
      let finalTaxId: string | null = existingTaxId;

      if (!existingTaxId) {
        // Solo si aún no tiene RUC, intentamos guardar el que el usuario escribió
        const cleanDoc = (values.tax_id || "").replace(/\D/g, "");
        if (cleanDoc) {
          finalTaxId = cleanDoc.startsWith("20")
            ? `RUC20: ${cleanDoc}`
            : `RUC10: ${cleanDoc}`;
        } else {
          finalTaxId = null;
        }
      }

      const payload = {
        name: typeof values.name === "string" ? values.name.trim() : "",
        legal_name:
          typeof values.legal_name === "string"
            ? values.legal_name.trim() || null
            : null,
        tax_id: finalTaxId,
        tax_id_document_url: values.tax_id_document_url || null,
        logo_url: values.logo_url || null,
        phone:
          typeof values.phone === "string" ? values.phone.trim() || null : null,
        email:
          typeof values.email === "string" ? values.email.trim() || null : null,
        location:
          typeof values.location === "string"
            ? values.location.trim() || null
            : null,
        description:
          typeof values.description === "string"
            ? values.description.trim() || null
            : null,
      };

      const res = await fetch(`/api/companies/${freshCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar la empresa.");
      }

      onSuccess(data.company);
      onClose();
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Error al guardar cambios.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);

      const res = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar la empresa.");
      }

      await refreshCompanies();
      if (activeCompany?.id === company.id) {
        setActiveCompanyId(null);
      }

      toast.success(
        `La empresa "${company.name}" ha sido eliminada.`,
        "Empresa Eliminada",
      );

      setShowDeleteConfirm(false);
      onClose();

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Error al eliminar la empresa.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f25c05]/10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#f25c05]" />
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
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#f8fafc] text-[#64748b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Logotipo */}
            <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-[#f25c05] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-sm border border-slate-200">
                  {formData.logo_url ? (
                    <Image
                      src={formData.logo_url}
                      alt={formData.name || "Empresa"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>
                      {formData.name?.[0]?.toUpperCase() || (
                        <Building2 className="w-8 h-8" />
                      )}
                    </span>
                  )}

                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#112237] mb-1">
                    Logotipo Comercial{" "}
                    <span className="text-[#94a3b8] font-normal">
                      (Opcional)
                    </span>
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
              {errors.logo_url && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.logo_url.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1 flex items-center justify-between">
                  <span>Número de RUC (SUNAT)</span>
                  <span className="text-[10px] text-[#64748b] font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#94a3b8]" /> No modificable
                  </span>
                </label>
                <Input
                  {...register("tax_id")}
                  disabled
                  readOnly
                  className="bg-slate-100 border-[#cbd5e1] text-[#64748b] cursor-not-allowed font-medium select-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Ubicación / Ciudad *
                </label>
                <Input
                  {...register("location")}
                  placeholder="Lima, Chorrillos"
                />
                {errors.location && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Componente Reutilizable FichaRucUploader */}
            <FichaRucUploader
              compact
              value={formData.tax_id_document_url}
              onDocumentUploaded={handleExtractedDocument}
              companyId={company.id}
            />

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Nombre de la Empresa / Marca *
              </label>
              <Input {...register("name")} placeholder="Ej: ElleonStore" />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Razón Social *
              </label>
              <Input
                {...register("legal_name")}
                placeholder="Ej: ElleonStore S.A.C."
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                Nombre legal registrado en SUNAT. Distinto al nombre comercial.
              </p>
              {errors.legal_name && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.legal_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Teléfono de Contacto *
                </label>
                <Input {...register("phone")} placeholder="987654321" />
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Correo Electrónico Comercial *
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="contacto@miempresa.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Descripción Comercial{" "}
                <span className="text-[#94a3b8] font-normal">(Opcional)</span>
              </label>
              <textarea
                {...register("description")}
                placeholder="Breve reseña sobre tus productos y experiencia..."
                rows={3}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
              />
              {errors.description && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#f1f5f9]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Empresa
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploadingLogo || deleting}
                  className="bg-[#f25c05] hover:bg-[#d94d04] text-[#ffffff] text-xs font-bold"
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
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-[#112237]">
                  ¿Eliminar esta empresa?
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                  setDeleteError(null);
                }}
                className="p-1 rounded-lg text-[#94a3b8] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-800 space-y-1.5">
              <p className="font-bold text-red-900">
                Esta acción es irreversible.
              </p>
              <p>
                Se eliminará permanentemente la empresa{" "}
                <span className="font-black text-red-950 underline">
                  {company.name}
                </span>{" "}
                junto con todos sus productos, imágenes, ventas registradas y
                miembros asociados para mantener la base de datos limpia y
                consistente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Para confirmar, escribe el nombre exacto de la empresa:
                <br />
                <span className="font-bold text-[#112237]">{company.name}</span>
              </label>
              <Input
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={company.name}
                className="text-xs"
              />
            </div>

            {deleteError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDeleteCompany}
                disabled={
                  deleting ||
                  deleteConfirmInput.trim().toLowerCase() !==
                    company.name.trim().toLowerCase()
                }
                className="bg-red-600 hover:bg-red-700 text-[#ffffff] text-xs font-bold"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, Eliminar Empresa"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
