'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth, useCategories } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { PRODUCT_CONDITIONS } from '@/lib/config';
import { Upload, X, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

function PublishProductContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories } = useCategories();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    condition: '',
    isBundle: false,
    bundleQuantity: '',
    bundlePricePerUnit: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    router.push('/auth/login?redirect=/products/new');
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'El precio es requerido';
    if (!formData.categoryId) newErrors.categoryId = 'Selecciona una categoría';
    if (!formData.condition) newErrors.condition = 'Selecciona la condición';

    if (formData.isBundle) {
      if (!formData.bundleQuantity || parseInt(formData.bundleQuantity) < 2) {
        newErrors.bundleQuantity = 'Mínimo 2 unidades para un lote';
      }
      if (!formData.bundlePricePerUnit) newErrors.bundlePricePerUnit = 'Precio por unidad requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          category_id: formData.categoryId,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
          is_bundle: formData.isBundle,
          status: 'active',
          stock: formData.isBundle ? parseInt(formData.bundleQuantity) : 1,
        })
        .select()
        .single();

      if (error) throw error;

      if (formData.isBundle) {
        await supabase.from('product_bundles').insert({
          product_id: product.id,
          quantity: parseInt(formData.bundleQuantity),
          price_per_unit: parseFloat(formData.bundlePricePerUnit),
          total_price: parseFloat(formData.bundlePricePerUnit) * parseInt(formData.bundleQuantity),
        });
      }

      for (let i = 0; i < images.length; i++) {
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: images[i],
          position: i,
        });
      }

      router.push(`/products/${product.id}`);
    } catch (err) {
      console.error('Error publishing product:', err);
      setErrors({ submit: 'Error al publicar el producto. Intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-2xl font-bold text-[#112237] mb-2">Publicar producto</h1>
          <p className="text-[#64748b] mb-8">
            Completa los detalles de tu producto para publicarlo en Iubizon
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-4 bg-[#ef4444]/10 text-[#ef4444] rounded-lg">
                {errors.submit}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
                <CardDescription>
                  Añade hasta 10 fotos de tu producto. La primera será la principal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-8 text-center">
                  <Upload className="w-10 h-10 text-[#94a3b8] mx-auto mb-4" />
                  <p className="text-[#64748b] mb-2">
                    Arrastra las imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    PNG, JPG hasta 5MB cada una
                  </p>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 shrink-0">
                        <img
                          src={img}
                          alt={`Imagen ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-[#ef4444] text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del producto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ej: Proyector Epson PowerLite 980W"
                    error={errors.title}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <TextArea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe tu producto: características, estado, incluye..."
                    rows={5}
                    error={errors.description}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => updateField('categoryId', value)}
                    >
                      <SelectTrigger error={errors.categoryId}>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condición *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => updateField('condition', value)}
                    >
                      <SelectTrigger error={errors.condition}>
                        <SelectValue placeholder="Selecciona la condición" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CONDITIONS.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Precio (S/) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      error={errors.price}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBundle}
                      onChange={(e) => updateField('isBundle', e.target.checked)}
                      className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
                    />
                    <div>
                      <span className="font-medium text-[#112237]">Venta por lotes</span>
                      <p className="text-xs text-[#64748b]">
                        Activa esta opción si vendes múltiples unidades del mismo producto
                      </p>
                    </div>
                  </label>
                </div>

                {formData.isBundle && (
                  <div className="mt-4 p-4 bg-[#f8fafc] rounded-lg space-y-4">
                    <p className="text-sm font-medium text-[#112237]">
                      Configuración del lote
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cantidad de unidades *</Label>
                        <Input
                          type="number"
                          min="2"
                          value={formData.bundleQuantity}
                          onChange={(e) => updateField('bundleQuantity', e.target.value)}
                          placeholder="Ej: 5"
                          error={errors.bundleQuantity}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio por unidad (S/) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.bundlePricePerUnit}
                          onChange={(e) => updateField('bundlePricePerUnit', e.target.value)}
                          placeholder="Ej: 100"
                          error={errors.bundlePricePerUnit}
                        />
                      </div>
                    </div>
                    {formData.bundleQuantity && formData.bundlePricePerUnit && (
                      <div className="text-sm text-[#64748b]">
                        Precio total del lote: <span className="font-bold text-[#f25c05]">
                          S/ {(parseInt(formData.bundleQuantity) * parseFloat(formData.bundlePricePerUnit)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Publicando...' : 'Publicar producto'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PublishProductPage() {
  return (
    <AuthProvider>
      <PublishProductContent />
    </AuthProvider>
  );
}