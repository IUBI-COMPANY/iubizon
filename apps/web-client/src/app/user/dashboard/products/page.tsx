'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Eye, ArrowLeft, Package } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  isBundle: boolean;
  images: { url: string }[];
  views: number;
  favorites: number;
  createdAt: string;
}

function ProductsManagementContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard/products');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, condition, status, is_bundle, images:product_images(*), views, favorites, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }

      setIsLoading(false);
    };

    fetchProducts();
  }, [user, supabase]);

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleMarkAsSold = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'sold' })
      .eq('id', productId);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: 'sold' } : p))
      );
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    pending: 'Pendiente',
    sold: 'Vendido',
    reported: 'Reportado',
  };

  const statusVariants: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    sold: 'default',
    reported: 'destructive',
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/user/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-[#112237]">Mis productos</h1>
            </div>
            <Link href="/products/new">
              <Button>
                <Plus className="w-4 h-4" />
                Publicar producto
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="sold">Vendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const mainImage = product.images?.[0]?.url;
                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-[#f8fafc] rounded-lg overflow-hidden shrink-0">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={product.title}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-3xl">
                              📦
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                href={`/products/${product.id}`}
                                className="font-medium text-[#112237] hover:text-[#f25c05]"
                              >
                                {product.title}
                              </Link>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-lg font-bold text-[#f25c05]">
                                  {formatPrice(product.price)}
                                </span>
                                {product.isBundle && (
                                  <Badge variant="default">LOTE</Badge>
                                )}
                                <Badge variant={statusVariants[product.status] as any}>
                                  {statusLabels[product.status]}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-sm text-[#64748b]">
                              <span>{product.views} vistas</span>
                              <span>{product.favorites} favoritos</span>
                              <span>{formatRelativeTime(product.createdAt)}</span>
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/products/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link href={`/products/edit/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              {product.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsSold(product.id)}
                                >
                                  ✓ Marcar vendido
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-[#ef4444] hover:text-[#ef4444]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#112237] mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'No se encontraron productos'
                  : 'No tienes productos publicados'}
              </h2>
              <p className="text-[#64748b] mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Publica tu primer producto para empezar a vender'}
              </p>
              <Link href="/products/new">
                <Button>Publicar producto</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    }>
      <AuthProvider>
        <ProductsManagementContent />
      </AuthProvider>
    </Suspense>
  );
}