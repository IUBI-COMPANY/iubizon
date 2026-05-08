'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/Label';
import Link from 'next/link';
import { ImageUploader } from '@/components/features/products/ImageUploader';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'f17e5a31-6c47-462b-bfe8-5d7c40a27fde', name: 'Electrónica y Tecnología' },
  { id: 'f405fbd0-46a8-4f18-a7c3-06e7970f0271', name: 'Proyectores' },
  { id: '0bf474fb-d2ec-43a7-bf4c-5da9a4d6d008', name: 'Laptops y Computadoras' },
  { id: '980013ea-226d-4233-9205-1a7d5be784b4', name: 'Móviles y Tablets' },
  { id: 'b703445a-5933-4a0c-8175-a9ae2c3f7ea3', name: 'Consolas y Videojuegos' },
  { id: 'c4072527-1d13-467e-926f-007be9a915fd', name: 'TVs y Audio' },
  { id: '493ce5ab-5ee2-479f-b8ff-b30107ac4f9b', name: 'Hogar y Electrodomésticos' },
  { id: 'd328587f-2257-4397-9aa5-4984bc77673e', name: 'Herramientas y Construcción' },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    category_id: '',
    status: 'active',
  });
  const [images, setImages] = useState<Array<{ id: string; url: string; position: number }>>([]);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        const { id } = await params;
        if (!mounted) return;
        
        setProductId(id);

        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('seller_id', user.id)
          .single();

        if (!mounted) return;

        if (error || !data) {
          setError('Producto no encontrado');
          setLoading(false);
          return;
        }

        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          condition: data.condition,
          category_id: data.category_id,
          status: data.status,
        });

        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('position', { ascending: true });
        
        if (mounted && imagesData) {
          setImages(imagesData);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        if (mounted) {
          setError('Error al cargar producto');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
          category_id: formData.category_id,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al guardar');
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/user/dashboard/products');
      }, 1500);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-4">{error}</h2>
            <Link href="/user/dashboard/products" className="text-[#f25c05] hover:underline">
              Volver a mis productos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/user/dashboard/products" className="text-[#64748b] hover:text-[#112237]">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold text-[#112237]">Editar producto</h1>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Producto actualizado exitosamente. Redirigiendo...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Título del producto *</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <TextArea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="condition">Condición *</Label>
                <select 
                  id="condition" 
                  name="condition" 
                  className="flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="new">Nuevo</option>
                  <option value="like_new">Como nuevo</option>
                  <option value="good">Buen estado</option>
                  <option value="fair">Aceptable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id">Categoría *</Label>
                <select 
                  id="category_id" 
                  name="category_id" 
                  className="flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <select 
                  id="status" 
                  name="status" 
                  className="flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Imágenes del producto</Label>
              <ImageUploader 
                productId={productId} 
                images={images}
                onImagesChange={setImages}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Link 
                href="/user/dashboard/products"
                className="px-6 py-2 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}