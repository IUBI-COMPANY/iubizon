"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  MediaUploader,
  UploadedImage,
} from "@/components/features/products/MediaUploader";
import { detectForbiddenContactInfo } from "@/lib/utils/contactDetector";
import { syncProductMedia } from "@/lib/services/mediaUpload";
import { useToast } from "@/context/ToastContext";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Layers,
  Loader2,
  Package,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "",
    category_id: "",
    status: "active",
    stock: "1",
    warranty: "6 meses por falla de fábrica (Garantía del vendedor)",
    warranty_conditions: "",
  });

  const [hasWarranty, setHasWarranty] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [initialImageIds, setInitialImageIds] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProductAndCategories = async () => {
      try {
        const { id } = await params;
        if (!mounted) return;

        setProductId(id);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          router.push("/auth/login?redirect=/products/edit/" + id);
          return;
        }

        // Cargar Categorías
        const { data: catsData } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");
        if (mounted && catsData) {
          setCategories(catsData);
        }

        // Cargar Producto via API interna
        const prodRes = await fetch(`/api/products/${id}`);
        const prodResult = await prodRes.json();

        if (!mounted) return;

        if (!prodRes.ok || !prodResult.product) {
          setError(prodResult.error || "Producto no encontrado");
          setLoading(false);
          return;
        }

        const data = prodResult.product;

        const fetchedWarranty =
          data.specifications &&
          typeof data.specifications === "object" &&
          "warranty" in data.specifications
            ? String(data.specifications.warranty)
            : "";

        const fetchedConditions =
          data.specifications &&
          typeof data.specifications === "object" &&
          "warranty_conditions" in data.specifications
            ? String(data.specifications.warranty_conditions || "")
            : "";

        const initialHasWarranty =
          !!fetchedWarranty &&
          !fetchedWarranty.toLowerCase().includes("sin garantía");

        setHasWarranty(initialHasWarranty);

        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price ? data.price.toString() : "0",
          condition: data.condition || "good",
          category_id: data.category_id || "",
          status: data.status || "active",
          stock:
            data.stock !== undefined && data.stock !== null
              ? data.stock.toString()
              : "1",
          warranty:
            fetchedWarranty ||
            "6 meses por falla de fábrica (Garantía del vendedor)",
          warranty_conditions: fetchedConditions,
        });

        if (Array.isArray(data.images)) {
          const loadedImages = data.images.map(
            (img: { id: string; url: string; position: number }) => ({
              id: img.id,
              url: img.url,
              position: img.position,
            }),
          );
          setImages(loadedImages);
          setInitialImageIds(loadedImages.map((img: { id: string }) => img.id));
        }

        if (data.video_url) {
          setVideoPreview(data.video_url);
        }
      } catch (err) {
        console.error("Error al cargar producto:", err);
        if (mounted) {
          setError("Error de conexión al cargar la publicación");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProductAndCategories();

    return () => {
      mounted = false;
    };
  }, [params, supabase]);

  const parseResponseJson = async (res: Response) => {
    try {
      const text = await res.text();
      return text && text.trim() ? JSON.parse(text) : {};
    } catch {
      return { error: `Respuesta no válida del servidor (${res.status})` };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar restricción de datos de contacto
    if (formData.description.trim()) {
      const contactCheck = detectForbiddenContactInfo(formData.description);
      if (contactCheck.hasViolation) {
        const reason =
          contactCheck.reason || "Información de contacto no permitida";
        setError(reason);
        toast.error(reason, "Revisa la descripción");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Sincronizar imágenes y video de forma unificada
      const { videoUrl } = await syncProductMedia({
        productId,
        images,
        initialImageIds,
        videoFile,
        videoPreview,
      });

      const parsedStock = parseInt(formData.stock) || 1;
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
          category_id: formData.category_id,
          status: formData.status,
          stock: parsedStock,
          availability_type: parsedStock > 1 ? "available" : "unique",
          video_url: videoUrl,
          warranty: formData.warranty,
          warranty_conditions:
            hasWarranty && formData.warranty_conditions
              ? formData.warranty_conditions.trim()
              : null,
        }),
      });

      const result = await parseResponseJson(response);

      if (!response.ok) {
        setError(result.error || "Error al guardar los cambios");
        setSaving(false);
        return;
      }

      setSuccess(true);
      toast.success("Publicación actualizada correctamente", "¡Éxito!");
      setTimeout(() => {
        router.push("/user/dashboard/products");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "Error de conexión al guardar los cambios";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center bg-white border border-[#e2e8f0] p-8 rounded-3xl max-w-md shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#112237] mb-2">{error}</h2>
            <p className="text-xs text-[#64748b] mb-6">
              Verifica tus permisos o regresa a la lista de publicaciones.
            </p>
            <Link
              href="/user/dashboard/products"
              className="inline-flex items-center gap-2 bg-[#f25c05] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Mis Productos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Cabecera */}
        <div className="mb-6">
          <Link
            href="/user/dashboard/products"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#112237] font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Productos
          </Link>
          <h1 className="text-2xl font-bold text-[#112237]">
            Editar publicación
          </h1>
          <p className="text-xs text-[#64748b]">
            Modifica los detalles, precio, fotos y video de tu producto
          </p>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3 text-xs font-semibold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Publicación actualizada exitosamente. Redirigiendo a tu
              catálogo...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3 text-xs font-semibold shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CARD MULTIMEDIA: Fotos + Video unificados */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
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
          </div>

          {/* CARD 1: Información Básica */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#112237] uppercase tracking-wider text-xs border-b border-[#f1f5f9] pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#f25c05]" />
              Información del Producto
            </h2>

            <div>
              <Label
                htmlFor="title"
                className="text-xs font-semibold text-[#112237]"
              >
                Título de la publicación{" "}
                <span className="text-[#f25c05]">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Proyector Epson PowerLite 97H"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category_id"
                  className="text-xs font-semibold text-[#112237]"
                >
                  Categoría <span className="text-[#f25c05]">*</span>
                </Label>
                <select
                  id="category_id"
                  name="category_id"
                  className="flex h-11 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]/20 focus:border-[#f25c05] mt-1"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="condition"
                  className="text-xs font-semibold text-[#112237]"
                >
                  Condición del producto{" "}
                  <span className="text-[#f25c05]">*</span>
                </Label>
                <select
                  id="condition"
                  name="condition"
                  className="flex h-11 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]/20 focus:border-[#f25c05] mt-1"
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona la condición...</option>
                  <option value="new">Nuevo (Sin uso, empaque original)</option>
                  <option value="like_new">
                    Como nuevo (Excelente estado)
                  </option>
                  <option value="good">Buen estado (Uso normal)</option>
                  <option value="fair">Aceptable (Funcional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 2: Precio y Stock */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#112237] uppercase tracking-wider text-xs border-b border-[#f1f5f9] pb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#f25c05]" />
              Precio, Stock y Visibilidad
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="price"
                  className="text-xs font-semibold text-[#112237] mb-1 block"
                >
                  Precio de venta <span className="text-[#f25c05]">*</span>
                </Label>
                <CurrencyInput
                  id="price"
                  name="price"
                  currency="PEN"
                  value={formData.price}
                  onChange={(val) => setFormData({ ...formData, price: val })}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="stock"
                  className="text-xs font-semibold text-[#112237]"
                >
                  Stock disponible <span className="text-[#f25c05]">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="Ej: 10"
                  icon={<Package className="w-4 h-4 text-[#64748b]" />}
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="status"
                  className="text-xs font-semibold text-[#112237]"
                >
                  Estado de publicación
                </Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-11 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]/20 focus:border-[#f25c05] mt-1"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Activo (Visible)</option>
                  <option value="inactive">Inactivo (Pausado)</option>
                  <option value="sold">Vendido / Agotado</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9] space-y-3">
              <Checkbox
                name="hasWarranty"
                checked={hasWarranty}
                onChange={(checked) => {
                  setHasWarranty(checked);
                  if (!checked) {
                    setFormData((prev) => ({
                      ...prev,
                      warranty: "Sin garantía del vendedor",
                    }));
                  }
                }}
              >
                <span className="font-semibold text-xs text-[#112237]">
                  ¿Este producto incluye garantía del vendedor o fabricante?
                </span>
              </Checkbox>

              {hasWarranty && (
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="warranty"
                      className="text-xs font-semibold text-[#112237] block mb-1"
                    >
                      Detalle o tiempo de garantía del Vendedor
                    </Label>
                    <Input
                      id="warranty"
                      name="warranty"
                      placeholder="Ej: 6 meses por falla de fábrica (Garantía del vendedor)"
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>

                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] space-y-2 text-xs text-[#64748b]">
                    <p className="font-semibold text-[#112237]">
                      ℹ️ Cobertura estándar:{" "}
                      <span className="font-normal text-[#475569]">
                        Fallas de fabricación y componentes defectuosos de
                        origen.
                      </span>
                    </p>
                    <div>
                      <Label
                        htmlFor="warranty_conditions"
                        className="text-[11px] font-semibold text-[#112237] block mb-1"
                      >
                        Condiciones especiales o requisitos (opcional)
                      </Label>
                      <Input
                        id="warranty_conditions"
                        name="warranty_conditions"
                        placeholder="Ej: Conservar empaque original y comprobante."
                        value={formData.warranty_conditions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            warranty_conditions: e.target.value,
                          })
                        }
                        className="bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD 3: Descripción Detallada */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#112237] uppercase tracking-wider text-xs border-b border-[#f1f5f9] pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f25c05]" />
              Descripción del Producto
            </h2>
            <Label className="text-xs font-semibold text-[#112237]">
              Detalles, especificaciones y accesorios incluidos
            </Label>
            <RichTextEditor
              content={formData.description}
              onChange={(newDesc) =>
                setFormData({ ...formData, description: newDesc })
              }
              placeholder="Describe las características principales, garantía, qué incluye el paquete..."
              maxLength={2000}
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/user/dashboard/products">
              <Button
                type="button"
                variant="outline"
                className="px-6 h-12 rounded-xl"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold px-8 h-12 rounded-xl shadow-md transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando cambios...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
