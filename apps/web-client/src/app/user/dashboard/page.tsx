'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, MessageCircle, DollarSign, TrendingUp, Eye, Heart } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalSales: number;
  totalOrders: number;
  unreadMessages: number;
  totalViews: number;
  totalFavorites: number;
}

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    unreadMessages: 0,
    totalViews: 0,
    totalFavorites: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    views: number;
    favorites: number;
    createdAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);

      const [productsRes, ordersRes, messagesRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, title, price, status, views, favorites, created_at')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select('id, status, amount')
          .eq('seller_id', user.id),
        supabase
          .from('messages')
          .select('id, conversation_id')
          .eq('sender_id', user.id)
          .eq('read_at', null),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
      const totalFavorites = products.reduce((acc, p) => acc + (p.favorites || 0), 0);
      const totalSales = orders
    .filter((o) => o.status === 'completed')
    .reduce((acc, o) => acc + (o.amount || 0), 0);

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.status === 'active').length,
        totalSales,
        totalOrders: orders.length,
        unreadMessages: messagesRes.data?.length || 0,
        totalViews,
        totalFavorites,
      });

      setRecentProducts(products);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [user, supabase]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { label: 'Resumen', href: '/user/dashboard', icon: TrendingUp },
    { label: 'Mis productos', href: '/user/dashboard/products', icon: Package },
    { label: 'Pedidos', href: '/user/dashboard/orders', icon: ShoppingCart },
    { label: 'Mensajes', href: '/user/dashboard/messages', icon: MessageCircle, badge: stats.unreadMessages },
    { label: 'Configuración', href: '/user/dashboard/settings', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name || 'Usuario'}
                      size="xl"
                      showProBadge={user.isPro}
                    />
                    <div>
                      <h3 className="font-semibold text-[#112237]">{user.name}</h3>
                      <p className="text-sm text-[#64748b]">{user.email}</p>
                    </div>
                  </div>

                  <Link href="/products/new">
                    <Button className="w-full mb-6">
                      <Package className="w-4 h-4" />
                      Publicar producto
                    </Button>
                  </Link>

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-[#f25c05]/10 text-[#f25c05]'
                              : 'text-[#64748b] hover:bg-[#f8fafc]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-[#ef4444] text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            <main className="flex-1 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f25c05]/10 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#f25c05]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#112237]">{stats.totalProducts}</p>
                        <p className="text-sm text-[#64748b]">Productos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#10b981]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#112237]">{formatPrice(stats.totalSales)}</p>
                        <p className="text-sm text-[#64748b]">Ventas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#112237]">{stats.totalViews}</p>
                        <p className="text-sm text-[#64748b]">Vistas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[#f59e0b]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#112237]">{stats.totalFavorites}</p>
                        <p className="text-sm text-[#64748b]">Favoritos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Productos recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProducts.length > 0 ? (
                    <div className="space-y-4">
                      {recentProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg"
                        >
                          <div className="flex-1">
                            <Link
                              href={`/products/${product.id}`}
                              className="font-medium text-[#112237] hover:text-[#f25c05]"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-1 text-sm text-[#64748b]">
                              <span>{formatPrice(product.price)}</span>
                              <span>{product.views} vistas</span>
                              <span>{product.favorites} favoritos</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              product.status === 'active'
                                ? 'success'
                                : product.status === 'sold'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {product.status === 'active'
                              ? 'Activo'
                              : product.status === 'sold'
                              ? 'Vendido'
                              : product.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                      <p className="text-[#64748b] mb-4">Aún no tienes productos publicados</p>
                      <Link href="/products/new">
                        <Button>Publicar tu primer producto</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    }>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </Suspense>
  );
}