"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useToast } from "@/context/ToastContext";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldError } from "@/components/ui/FieldError";
import { Label } from "@/components/ui/Label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Loader2,
  type LucideIcon,
  Package,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Wrench,
} from "lucide-react";

import { CreateCompanyStep } from "@/components/features/products/CreateCompanyStep";
import { UploadFichaStep } from "@/components/features/products/UploadFichaStep";
import type { ExtractedCompanyData } from "@/lib/services/documentExtractor";
import {
  MediaUploader,
  UploadedImage,
} from "@/components/features/products/MediaUploader";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  getFormattedWarrantyText,
  WarrantyField,
} from "@/components/ui/WarrantyField";
import { detectForbiddenContactInfo } from "@/lib/utils/contactDetector";
import { syncProductMedia } from "@/lib/services/mediaUpload";
import type { Category } from "@/types";

const productFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título del producto debe tener al menos 3 caracteres.")
    .max(100, "El título no puede exceder los 100 caracteres."),
  price: z
    .string()
    .min(1, "Ingresa un precio válido.")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "El precio debe ser un número mayor a S/ 0.00.",
    }),
  category_id: z.string().min(1, "Selecciona una categoría."),
  condition: z.string().min(1, "Selecciona el estado de tu producto."),
  brand: z.string().optional(),
  stock: z
    .string()
    .min(1, "Ingresa una cantidad de stock válida.")
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1, {
      message: "El stock debe ser al menos 1 unidad.",
    }),
  description: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const check = detectForbiddenContactInfo(val);
        return !check.hasViolation;
      },
      {
        message:
          "No se permite incluir números de teléfono, correos ni datos de contacto en la descripción.",
      },
    ),
  hasWarranty: z.boolean(),
  warrantyOption: z.string(),
  customWarranty: z.string().optional(),
  warrantyConditions: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const conditionOptions: Record<
  string,
  { icon: LucideIcon; label: string; desc: string; color: string }
> = {
  new: {
    icon: Sparkles,
    label: "Nuevo",
    desc: "Sin uso, en empaque original",
    color: "#10b981",
  },
  like_new: {
    icon: ShieldCheck,
    label: "Como nuevo",
    desc: "Sin marcas de uso visible",
    color: "#3b82f6",
  },
  good: {
    icon: ThumbsUp,
    label: "Buen estado",
    desc: "Marcas mínimas de uso",
    color: "#f59e0b",
  },
  fair: {
    icon: Wrench,
    label: "Aceptable",
    desc: "Marcas visibles, completamente funcional",
    color: "#ef4444",
  },
};

const techCategorySlugs = [
  "proyectores",
  "laptops",
  "pantallas-interactivas",
  "moviles",
  "audio",
  "mobiliario",
  "redes",
  "electronica",
  "accesorios",
  "utiles-suministros",
  "otros",
];

function PublishProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { user } = useAuth();
  const { companies, isLoadingCompanies, activeCompany, refreshCompanies } =
    useCompany();
  const toast = useToast();

  const handleBack = () => {
    if (from === "dashboard") {
      router.push("/user/dashboard/products");
    } else {
      router.back();
    }
  };

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [extractedData, setExtractedData] = useState<ExtractedCompanyData | null>(null);
  const [taxIdDocumentUrl, setTaxIdDocumentUrl] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      price: "",
      condition: "",
      category_id: "",
      brand: "",
      stock: "1",
      hasWarranty: false,
      warrantyOption: "6_months",
      customWarranty: "",
      warrantyConditions: "",
    },
  });

  const formData = watch();

  const getWarrantyText = () =>
    getFormattedWarrantyText(
      formData.hasWarranty ?? false,
      formData.warrantyOption ?? "6_months",
      formData.customWarranty ?? "",
      "product",
    );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories as Category[]);
      } catch {
        // fallback silencioso
      }
      setCategoriesLoaded(true);
    };
    loadCategories();
  }, []);

  const onSubmit = async (values: ProductFormValues): Promise<void> => {
    if (images.length === 0) {
      setImageError("Sube al menos una imagen del producto.");
      toast.error("Sube al menos una imagen del producto.", "Fotos requeridas");
      return;
    }
    setImageError(null);

    if (!user) {
      router.push("/auth/login?redirect=/products/new");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedStock = parseInt(values.stock, 10) || 1;
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description ? values.description.trim() : null,
          price: parseFloat(values.price),
          condition: values.condition,
          category_id: values.category_id,
          brand: values.brand ? values.brand.trim() : null,
          availability_type: parsedStock > 1 ? "available" : "unique",
          stock: parsedStock,
          location: activeCompany?.location || "Lima, Perú",
          latitude: null,
          longitude: null,
          company_id: activeCompany?.id || null,
          warranty: getWarrantyText(),
          warranty_conditions:
            values.hasWarranty && values.warrantyConditions?.trim()
              ? values.warrantyConditions.trim()
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Error al crear el producto.";
        setError(errorMsg);
        toast.error(errorMsg, "Error al guardar");
        return;
      }

      const productId = result.product?.id;

      if (productId) {
        toast.info("Subiendo imágenes y recursos...");
        await syncProductMedia({ productId, images, videoFile });
      }

      toast.success(
        "¡Tu producto ya está disponible en iubizon!",
        "Producto Publicado",
      );

      if (activeCompany?.id) {
        router.push(`/user/dashboard/products?company_id=${activeCompany.id}`);
      } else {
        router.push("/user/dashboard/products");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al crear el producto.";
      setError(errorMsg);
      toast.error(errorMsg, "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const hasNoCompanies = !isLoadingCompanies && companies.length === 0;
  const currentStep = hasNoCompanies ? wizardStep : 3;

  if (isLoadingCompanies) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#64748b] hover:text-[#112237] transition-colors mb-6 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Stepper por Pasos si el usuario no tiene empresas */}
          {hasNoCompanies && (
            <div className="flex items-center justify-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm">
              {/* Paso 1: Ficha RUC */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                    currentStep === 1
                      ? "bg-[#f25c05] text-white shadow-md"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {currentStep === 1 ? "1" : "✓"}
                </div>
                <span
                  className={`text-xs font-bold ${
                    currentStep === 1 ? "text-[#f25c05]" : "text-emerald-700"
                  }`}
                >
                  1. Ficha RUC
                </span>
              </div>

              <div className="w-10 h-0.5 bg-[#e2e8f0]" />

              {/* Paso 2: Registrar Empresa */}
              <div
                className={`flex items-center gap-2 transition-all ${
                  currentStep >= 2 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                    currentStep === 2
                      ? "bg-[#f25c05] text-white shadow-md"
                      : currentStep > 2
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > 2 ? "✓" : "2"}
                </div>
                <span
                  className={`text-xs font-bold ${
                    currentStep === 2
                      ? "text-[#f25c05]"
                      : currentStep > 2
                      ? "text-emerald-700"
                      : "text-[#64748b]"
                  }`}
                >
                  2. Registrar Empresa
                </span>
              </div>

              <div className="w-10 h-0.5 bg-[#e2e8f0]" />

              {/* Paso 3: Publicar Producto */}
              <div
                className={`flex items-center gap-2 transition-all ${
                  currentStep === 3 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                    currentStep === 3
                      ? "bg-[#f25c05] text-white shadow-md"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-bold ${
                    currentStep === 3 ? "text-[#f25c05]" : "text-[#64748b]"
                  }`}
                >
                  3. Publicar Producto
                </span>
              </div>
            </div>
          )}

          {currentStep === 1 ? (
            <UploadFichaStep
              onNext={(url, data) => {
                setTaxIdDocumentUrl(url);
                setExtractedData(data);
                setWizardStep(2);
              }}
            />
          ) : currentStep === 2 ? (
            <CreateCompanyStep
              extractedData={extractedData}
              taxIdDocumentUrl={taxIdDocumentUrl}
              onCompanyCreated={async () => {
                await refreshCompanies();
                setWizardStep(3);
              }}
              onBack={() => {
                setWizardStep(1);
              }}
            />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f25c05] to-[#d94d04] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f25c05]/20">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#112237]">
                    Publicar producto
                  </h1>
                  <p className="text-sm text-[#64748b]">
                    Agrega fotos y detalles para vender más rápido
                  </p>
                  {activeCompany && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-orange-50 border border-orange-200 text-[#f25c05] text-xs font-semibold rounded-full shadow-sm">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Publicando a nombre de: {activeCompany.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {activeCompany && !activeCompany.is_personal && !activeCompany.is_verified && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Empresa en Proceso de Verificación de Ficha RUC
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      ¡Tu documento ha sido recibido con éxito y tu cuenta se encuentra en revisión! 
                      Mientras tanto, <strong>puedes seguir registrando y guardando tus productos</strong>. Éstos se guardarán como borradores en tu catálogo, pero no estarán disponibles para la venta pública hasta que iubizon verifique y active tu empresa.
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit as any)}
                className="space-y-5"
              >
                {/* Componente Unificado MediaUploader (Fotos + Video) */}
                <div>
                  <MediaUploader
                    mode="both"
                    maxImages={10}
                    images={images}
                    onImagesChange={(imgs) => {
                      setImages(imgs);
                      if (imgs.length > 0) setImageError(null);
                    }}
                    videoPreview={videoPreview}
                    onVideoChange={(file, prev) => {
                      setVideoFile(file);
                      setVideoPreview(prev);
                    }}
                  />
                  {imageError && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {imageError}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Título <span className="text-[#f25c05]">*</span>
                    </Label>
                    <Input
                      placeholder="Ej: iPhone 14 Pro Max 256GB"
                      {...register("title")}
                      error={errors.title?.message}
                      maxLength={100}
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-[#94a3b8]">
                        {(formData.title || "").length}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Precio <span className="text-[#f25c05]">*</span>
                    </Label>
                    <CurrencyInput
                      currency="PEN"
                      value={formData.price}
                      onChange={(val) => {
                        setValue("price", val, { shouldValidate: true });
                      }}
                      error={errors.price?.message}
                    />
                    {formData.price && parseFloat(formData.price) > 0 && (
                      <p className="text-sm font-medium text-[#10b981]">
                        {formatPrice(parseFloat(formData.price))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Garantía del Proveedor */}
                <WarrantyField
                  itemType="product"
                  hasWarranty={formData.hasWarranty}
                  onHasWarrantyChange={(checked) =>
                    setValue("hasWarranty", checked, { shouldValidate: true })
                  }
                  warrantyOption={formData.warrantyOption}
                  onWarrantyOptionChange={(opt) =>
                    setValue("warrantyOption", opt, { shouldValidate: true })
                  }
                  customWarranty={formData.customWarranty || ""}
                  onCustomWarrantyChange={(val) =>
                    setValue("customWarranty", val, { shouldValidate: true })
                  }
                  warrantyConditions={formData.warrantyConditions || ""}
                  onWarrantyConditionsChange={(val) =>
                    setValue("warrantyConditions", val, {
                      shouldValidate: true,
                    })
                  }
                />

                {/* Category */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Categoría <span className="text-[#f25c05]">*</span>
                    </Label>
                    {categoriesLoaded ? (
                      <div className="grid grid-cols-3 gap-2">
                        {categories
                          .filter((cat) => techCategorySlugs.includes(cat.slug))
                          .sort(
                            (a, b) =>
                              techCategorySlugs.indexOf(a.slug) -
                              techCategorySlugs.indexOf(b.slug),
                          )
                          .map((cat) => {
                            const Icon = getCategoryIcon(cat.slug);
                            const isSelected = formData.category_id === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setValue("category_id", cat.id, {
                                    shouldValidate: true,
                                  });
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? "border-[#f25c05] bg-[#f25c05]/5 text-[#f25c05] shadow-xs"
                                    : "border-[#e2e8f0] hover:border-[#cbd5e1] text-[#64748b] hover:text-[#112237]"
                                }`}
                              >
                                <Icon className="w-5 h-5 mb-1.5" />
                                <span className="text-xs font-semibold line-clamp-1">
                                  {cat.name}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-[#f25c05]" />
                      </div>
                    )}
                    <FieldError message={errors.category_id?.message} />
                  </div>
                </div>

                {/* Condition */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Estado del producto{" "}
                      <span className="text-[#f25c05]">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {Object.entries(conditionOptions).map(([key, opt]) => {
                        const Icon = opt.icon;
                        const isSelected = formData.condition === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setValue("condition", key, {
                                shouldValidate: true,
                              });
                            }}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-[#f25c05] bg-[#f25c05]/5 shadow-xs"
                                : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                backgroundColor: `${opt.color}15`,
                                color: opt.color,
                              }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#112237]">
                                {opt.label}
                              </p>
                              <p className="text-[10px] text-[#64748b] line-clamp-1">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={errors.condition?.message} />
                  </div>
                </div>

                {/* Stock */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Stock disponible <span className="text-[#f25c05]">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...register("stock")}
                      error={errors.stock?.message}
                    />
                    {!errors.stock && (
                      <p className="text-[11px] text-[#64748b]">
                        Indica la cantidad de unidades disponibles para la
                        venta.
                      </p>
                    )}
                  </div>
                </div>

                {/* Description (optional) */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Descripción
                      <span className="text-[#94a3b8] font-normal ml-1.5">
                        (opcional)
                      </span>
                    </Label>
                    <RichTextEditor
                      content={formData.description || ""}
                      onChange={(val) => {
                        setValue("description", val, { shouldValidate: true });
                      }}
                      placeholder="Describe tu producto: estado, accesorios incluidos, razón de venta..."
                      maxLength={2000}
                    />
                    <FieldError message={errors.description?.message} />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                  </div>
                )}

                {/* Form Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 rounded-xl border-[#e2e8f0]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold rounded-xl shadow-lg shadow-[#f25c05]/20"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publicando...</span>
                      </div>
                    ) : (
                      "Publicar producto"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#f8fafc]">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
          </div>
          <Footer />
        </div>
      }
    >
      <PublishProductForm />
    </Suspense>
  );
}
