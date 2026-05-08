'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  amount: number;
  status: string;
  createdAt: string;
  buyerName: string;
  buyerId: string;
  sellerId: string;
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
  const [orderType, setOrderType] = useState<'purchases' | 'sales'>('purchases');
  const [statusTab, setStatusTab] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard/orders');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) {
        console.log('Auth loading, waiting...');
        return;
      }
      
      if (!user) {
        console.log('No user found in orders page');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Get orders where user is buyer OR seller
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setIsLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const [productRes, buyerRes, sellerRes, imagesRes] = await Promise.all([
            supabase.from('products').select('title').eq('id', order.product_id).maybeSingle(),
            supabase.from('profiles').select('name').eq('id', order.buyer_id).maybeSingle(),
            supabase.from('profiles').select('name').eq('id', order.seller_id).maybeSingle(),
            supabase
              .from('product_images')
              .select('url')
              .eq('product_id', order.product_id)
              .order('position', { ascending: true })
              .limit(1),
          ]);

          const productImage = imagesRes.data && imagesRes.data.length > 0 ? imagesRes.data[0].url : '';
          return {
            id: order.id,
            productId: order.product_id,
            productTitle: productRes?.data?.title || 'Producto',
            productImage: productImage,
            amount: order.amount,
            status: order.status,
            createdAt: order.created_at,
            buyerName: buyerRes?.data?.name || 'Comprador',
            buyerId: order.buyer_id,
            sellerId: order.seller_id,
            sellerName: sellerRes?.data?.name || 'Vendedor',
          };
        })
      );

      setOrders(ordersWithDetails);
      setIsLoading(false);
    };

    fetchOrders();
  }, [user, supabase, authLoading]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      const statusMessages: Record<string, string> = {
        paid: 'Pedido confirmado',
        cancelled: 'Pedido cancelado',
        shipped: 'Pedido marcado como enviado',
        delivered: 'Pedido marcado como entregado',
      };
      alert(statusMessages[newStatus] || 'Estado actualizado');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el pedido: ' + (err as any)?.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const isSale = order.sellerId === user.id;
    const isPurchase = order.buyerId === user.id;
    
    if (orderType === 'sales' && !isSale) return false;
    if (orderType === 'purchases' && !isPurchase) return false;
    
    if (statusTab === 'all') return true;
    if (statusTab === 'pending') return order.status === 'pending';
    if (statusTab === 'in_progress') return ['paid', 'shipped'].includes(order.status);
    if (statusTab === 'completed') return ['delivered', 'completed', 'cancelled'].includes(order.status);
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

          <Tabs value={orderType} onValueChange={setOrderType}>
            <TabsList className="mb-4">
              <TabsTrigger value="purchases">Mis compras</TabsTrigger>
              <TabsTrigger value="sales">Mis ventas</TabsTrigger>
            </TabsList>

            <TabsContent value={orderType}>
              <Tabs value={statusTab} onValueChange={setStatusTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="in_progress">En proceso</TabsTrigger>
                  <TabsTrigger value="completed">Completados</TabsTrigger>
                </TabsList>

                <TabsContent value={statusTab}>
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
                                    {order.sellerId === user.id 
                                      ? `Venta a: ${order.buyerName}` 
                                      : `Compra a: ${order.sellerName || 'Vendedor'}`}
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
                                  
                                  {/* Seller Actions */}
                                  {order.sellerId === user.id && (
                                    <>
                                      {order.status === 'pending' && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            onClick={() => updateOrderStatus(order.id, 'paid')}
                                            disabled={updatingOrder === order.id}
                                          >
                                            {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                            Confirmar
                                          </Button>
                                          <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                            disabled={updatingOrder === order.id}
                                          >
                                            <XCircle className="w-4 h-4" />
                                            Cancelar
                                          </Button>
                                        </>
                                      )}
                                      {order.status === 'paid' && (
                                        <Button 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                                          disabled={updatingOrder === order.id}
                                        >
                                          {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Truck className="w-4 h-4 mr-1" />}
                                          Marcar enviado
                                        </Button>
                                      )}
                                      {order.status === 'shipped' && (
                                        <Button 
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                                          disabled={updatingOrder === order.id}
                                        >
                                          {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Package className="w-4 h-4 mr-1" />}
                                          Marcar entregado
                                        </Button>
                                      )}
                                    </>
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