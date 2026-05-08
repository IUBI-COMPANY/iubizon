'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/Label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'f17e5a31-6c47-462b-bfe8-5d7c40a27fde', name: 'Electrónica y Tecnología' },
  { id: 'f405fbd0-46a8-4f18-a7c3-06e7970f0271', name: 'Proyectores' },
  { id: '0bf474fb-d2ec-43a7-bf4c-5da9a4d6d008', name: 'Laptops y Computadoras' },
  { id: '980013ea-226d-4233-9205-1a7d5be784b4', name: 'Móviles y Tablets' },
  { id: 'b703445a-5933-4a0c-8175-a9ae2c3f7ea3', name: 'Consolas y Videojuegos' },
  { id: 'c4072527-1d13-467e-926f-007be9a915fd', name: 'TVs y Audio' },
];

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  condition: string;
  category_id: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirect=/products/new');
        return;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: new FormData(Object.entries({ ...data, price: parseFloat(data.price) }).reduce((acc, [key, value]) => {
          acc.append(key, String(value));
          return acc;
        }, new FormData())),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al crear el producto');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/products/edit/${result.product.id}`);
      }, 1500);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
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

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
              >
                Producto publicado exitosamente. Redirigiendo...
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Título del producto *</Label>
              <Input 
                id="title" 
                placeholder="Ej: iPhone 14 Pro Max 256GB"
                {...register('title', { required: 'El título es requerido' })}
              />
              {errors.title && (
                <span className="text-red-500 text-sm">{errors.title.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <TextArea 
                id="description" 
                placeholder="Describe tu producto en detalle..."
                rows={4}
                {...register('description', { required: 'La descripción es requerida' })}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">{errors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('price', { required: 'El precio es requerido', min: 0 })}
                />
                {errors.price && (
                  <span className="text-red-500 text-sm">{errors.price.message}</span>
                )}
              </div>
              <div>
                <Label htmlFor="condition">Condición *</Label>
                <select 
                  id="condition" 
                  className="flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                  {...register('condition', { required: 'La condición es requerida' })}
                >
                  <option value="">Selecciona...</option>
                  <option value="new">Nuevo</option>
                  <option value="like_new">Como nuevo</option>
                  <option value="good">Buen estado</option>
                  <option value="fair">Aceptable</option>
                </select>
                {errors.condition && (
                  <span className="text-red-500 text-sm">{errors.condition.message}</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="category_id">Categoría *</Label>
              <select 
                id="category_id" 
                className="flex h-10 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                {...register('category_id', { required: 'La categoría es requerida' })}
              >
                <option value="">Selecciona una categoría...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <span className="text-red-500 text-sm">{errors.category_id.message}</span>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </span>
              ) : 'Publicar producto'}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}