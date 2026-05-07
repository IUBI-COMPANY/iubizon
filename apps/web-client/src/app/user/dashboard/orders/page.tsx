'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  amount: number;
  status: string;
  createdAt: string;
  buyerName: string;
  shippingStatus?: string;
}

const statusConfig: Record<string, { label: string; variant: string; icon: string }> = {
  pending: { label: 'Pendiente', variant: 'warning', icon: '⏳' },
  paid: { label: 'Pagado', variant: 'success', icon: '✅' },
  shipped: { label: 'Enviado', variant: 'default', icon: '📦' },
  delivered: { label: 'Entregado', variant: 'success', icon: '🏠' },
  completed: { label: 'Completado', variant: 'success', icon: '✅' },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: '❌' },
};

function OrdersContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard/orders');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setIsLoading(true);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .or(`seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const [productRes, buyerRes] = await Promise.all([
            supabase.from('products').select('title, images').eq('id', order.product_id).single(),
            supabase.from('profiles').select('name').eq('id', order.buyer_id).single(),
          ]);

          const productImages = productRes.data?.images || [];
          return {
            id: order.id,
            productId: order.product_id,
            productTitle: productRes.data?.title || 'Producto',
            productImage: productImages[0]?.url || '',
            amount: order.amount,
            status: order.status,
            createdAt: order.created_at,
            buyerName: buyerRes.data?.name || 'Comprador',
          };
        })
      );

      setOrders(ordersWithDetails);
      setIsLoading(false);
    };

    fetchOrders();
  }, [user, supabase]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending' || order.status === 'paid';
    if (activeTab === 'active') return ['shipped', 'delivered'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

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
          <div className="flex items-center gap-4 mb-6">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#112237]">Mis pedidos</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="active">En proceso</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-[#f8fafc] rounded-lg overflow-hidden shrink-0">
                              {order.productImage ? (
                                <Image
                                  src={order.productImage}
                                  alt={order.productTitle}
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

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <Link
                                    href={`/products/${order.productId}`}
                                    className="font-medium text-[#112237] hover:text-[#f25c05]"
                                  >
                                    {order.productTitle}
                                  </Link>
                                  <p className="text-sm text-[#64748b] mt-1">
                                    {order.buyerName !== user.name ? `Vendido por: ${order.buyerName}` : `Comprado a: ${order.buyerName}`}
                                  </p>
                                </div>
                                <Badge variant={status.variant as any}>
                                  {status.icon} {status.label}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                <div>
                                  <p className="text-lg font-bold text-[#f25c05]">
                                    {formatPrice(order.amount)}
                                  </p>
                                  <p className="text-sm text-[#64748b]">
                                    {formatDate(order.createdAt)}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Link href={`/products/${order.productId}`}>
                                    <Button variant="outline" size="sm">
                                      Ver producto
                                    </Button>
                                  </Link>
                                  {order.status === 'paid' && (
                                    <Button size="sm">
                                      <Truck className="w-4 h-4" />
                                      Rastrear
                                    </Button>
                                  )}
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
                  <ShoppingCart className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-[#112237] mb-2">
                    No tienes pedidos
                  </h2>
                  <p className="text-[#64748b] mb-6">
                    Cuando compres un producto, aparecerá aquí
                  </p>
                  <Link href="/products">
                    <Button>Explorar productos</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    }>
      <AuthProvider>
        <OrdersContent />
      </AuthProvider>
    </Suspense>
  );
}