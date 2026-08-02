"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useToast } from "@/context/ToastContext";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("1");
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyOption, setWarrantyOption] = useState("6_months");
  const [customWarranty, setCustomWarranty] = useState("");
  const [warrantyConditions, setWarrantyConditions] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const getWarrantyText = () =>
    getFormattedWarrantyText(
      hasWarranty,
      warrantyOption,
      customWarranty,
      "product",
    );

  useEffect(() => {
    const loadCategories = async () => {
      const sb = createClient();
      const { data } = await sb.from("categories").select("*").order("name");
      if (data) setCategories(data as Category[]);
      setCategoriesLoaded(true);
    };
    loadCategories();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Agrega un título para tu producto";
    if (!price || parseFloat(price) <= 0)
      errors.price = "Ingresa un precio válido";
    if (!categoryId) errors.category_id = "Selecciona una categoría";
    if (!condition) errors.condition = "Selecciona el estado de tu producto";
    if (!stock || parseInt(stock) < 1)
      errors.stock = "Ingresa una cantidad de stock válida (mínimo 1)";
    if (images.length === 0)
      errors.images = "Sube al menos una imagen del producto";

    if (description.trim()) {
      const contactCheck = detectForbiddenContactInfo(description);
      if (contactCheck.hasViolation) {
        const reason =
          contactCheck.reason || "Información de contacto no permitida";
        errors.description = reason;
        toast.error(reason, "Datos de contacto detectados");
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(
        "Por favor completa todos los campos obligatorios.",
        "Datos incompletos",
      );
      return;
    }

    if (!user) {
      router.push("/auth/login?redirect=/products/new");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedStock = parseInt(stock) || 1;
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          condition,
          category_id: categoryId,
          brand: brand.trim() || null,
          availability_type: parsedStock > 1 ? "available" : "unique",
          stock: parsedStock,
          location: activeCompany?.location || "Lima, Perú",
          latitude: null,
          longitude: null,
          company_id: activeCompany?.id || null,
          warranty: getWarrantyText(),
          warranty_conditions:
            hasWarranty && warrantyConditions.trim()
              ? warrantyConditions.trim()
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Error al crear el producto";
        setError(errorMsg);
        toast.error(errorMsg, "Error al guardar");
        setLoading(false);
        return;
      }

      await syncProductMedia({
        productId: result.product.id,
        images,
        videoFile,
        videoPreview,
      });

      toast.success("Producto publicado exitosamente.", "¡Guardado!");

      if (from === "dashboard") {
        router.push("/user/dashboard/products");
      } else {
        router.push(`/products/${result.product.id}`);
      }
    } catch {
      const connErr = "Error de conexión. Intenta de nuevo.";
      setError(connErr);
      toast.error(connErr, "Error de red");
      setLoading(false);
    }
  };

  const hasNoCompanies = !isLoadingCompanies && companies.length === 0;
  const currentStep = hasNoCompanies && wizardStep === 1 ? 1 : 2;

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
                  1. Registrar Empresa
                </span>
              </div>

              <div className="w-12 h-0.5 bg-[#e2e8f0]" />

              <div
                className={`flex items-center gap-2 ${
                  currentStep === 2 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                    currentStep === 2
                      ? "bg-[#f25c05] text-white shadow-md"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-bold ${
                    currentStep === 2 ? "text-[#f25c05]" : "text-[#64748b]"
                  }`}
                >
                  2. Publicar Producto
                </span>
              </div>
            </div>
          )}

          {currentStep === 1 ? (
            <CreateCompanyStep
              onCompanyCreated={async () => {
                await refreshCompanies();
                setWizardStep(2);
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Componente Unificado MediaUploader (Fotos + Video) */}
                <MediaUploader
                  mode="both"
                  maxImages={10}
                  images={images}
                  onImagesChange={setImages}
                  videoPreview={videoPreview}
                  onVideoChange={(file, prev) => {
                    setVideoFile(file);
                    setVideoPreview(prev);
                  }}
                />

                {/* Title */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#112237]">
                      Título <span className="text-[#f25c05]">*</span>
                    </Label>
                    <Input
                      placeholder="Ej: iPhone 14 Pro Max 256GB"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, title: "" }));
                      }}
                      error={fieldErrors.title}
                      maxLength={100}
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-[#94a3b8]">
                        {title.length}/100
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
                      value={price}
                      onChange={(val) => {
                        setPrice(val);
                        setFieldErrors((prev) => ({ ...prev, price: "" }));
                      }}
                      error={fieldErrors.price}
                    />
                    {price && parseFloat(price) > 0 && (
                      <p className="text-sm font-medium text-[#10b981]">
                        {formatPrice(parseFloat(price))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Garantía del Proveedor */}
                <WarrantyField
                  itemType="product"
                  hasWarranty={hasWarranty}
                  onHasWarrantyChange={(checked) => setHasWarranty(checked)}
                  warrantyOption={warrantyOption}
                  onWarrantyOptionChange={(opt) => setWarrantyOption(opt)}
                  customWarranty={customWarranty}
                  onCustomWarrantyChange={(val) => setCustomWarranty(val)}
                  warrantyConditions={warrantyConditions}
                  onWarrantyConditionsChange={(val) =>
                    setWarrantyConditions(val)
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
                            const isSelected = categoryId === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setCategoryId(cat.id);
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    category_id: "",
                                  }));
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
                    {fieldErrors.category_id && (
                      <p className="text-xs text-[#ef4444]">
                        {fieldErrors.category_id}
                      </p>
                    )}
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
                        const isSelected = condition === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setCondition(key);
                              setFieldErrors((prev) => ({
                                ...prev,
                                condition: "",
                              }));
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
                    {fieldErrors.condition && (
                      <p className="text-xs text-[#ef4444]">
                        {fieldErrors.condition}
                      </p>
                    )}
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
                      value={stock}
                      onChange={(e) => {
                        setStock(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, stock: "" }));
                      }}
                      error={fieldErrors.stock}
                    />
                    <p className="text-[11px] text-[#64748b]">
                      Indica la cantidad de unidades disponibles para la venta.
                    </p>
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
                      content={description}
                      onChange={setDescription}
                      placeholder="Describe tu producto: estado, accesorios incluidos, razón de venta..."
                      maxLength={2000}
                    />
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
