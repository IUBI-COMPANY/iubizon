"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Clock,
  Check,
  Ban,
  Home,
} from "lucide-react";

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
  sellerName: string;
  shippingStatus?: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "Pendiente", variant: "warning", Icon: Clock },
  paid: { label: "Pagado", variant: "success", Icon: Check },
  shipped: { label: "Enviado", variant: "default", Icon: Truck },
  delivered: { label: "Entregado", variant: "success", Icon: Home },
  completed: { label: "Completado", variant: "success", Icon: CheckCircle },
  cancelled: { label: "Cancelado", variant: "destructive", Icon: Ban },
};

function OrdersContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialTab = searchParams.get("tab") || "sales"; // Priorizar "Mis ventas" por defecto

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState<string>(initialTab);
  const [statusTab, setStatusTab] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/dashboard/orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return;

      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
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
          const [productRes, buyerRes, sellerRes, imagesRes] =
            await Promise.all([
              supabase
                .from("products")
                .select("title")
                .eq("id", order.product_id)
                .maybeSingle(),
              supabase
                .from("profiles")
                .select("name")
                .eq("id", order.buyer_id)
                .maybeSingle(),
              supabase
                .from("profiles")
                .select("name")
                .eq("id", order.seller_id)
                .maybeSingle(),
              supabase
                .from("product_images")
                .select("url")
                .eq("product_id", order.product_id)
                .order("position", { ascending: true })
                .limit(1),
            ]);

          const productImage =
            imagesRes.data && imagesRes.data.length > 0
              ? imagesRes.data[0].url
              : "";
          return {
            id: order.id,
            productId: order.product_id,
            productTitle: productRes?.data?.title || "Producto",
            productImage: productImage,
            amount: Number(order.amount),
            status: order.status,
            createdAt: order.created_at,
            buyerName: buyerRes?.data?.name || "Comprador",
            buyerId: order.buyer_id,
            sellerId: order.seller_id,
            sellerName: sellerRes?.data?.name || "Vendedor",
          };
        }),
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
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.error("Error updating order:", err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const isSale = order.sellerId === user!.id;
    const isPurchase = order.buyerId === user!.id;

    if (orderType === "sales" && !isSale) return false;
    if (orderType === "purchases" && !isPurchase) return false;

    if (statusTab === "all") return true;
    if (statusTab === "pending") return order.status === "pending";
    if (statusTab === "in_progress")
      return ["paid", "shipped"].includes(order.status);
    if (statusTab === "completed")
      return ["delivered", "completed", "cancelled"].includes(order.status);
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#112237]">
            Gestión de Pedidos & Ventas
          </h1>
        </div>

        <Tabs value={orderType} onValueChange={setOrderType}>
          <TabsList className="mb-4">
            <TabsTrigger value="sales">Mis ventas</TabsTrigger>
            <TabsTrigger value="purchases">Mis compras</TabsTrigger>
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
                      const status =
                        statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = status.Icon;

                      return (
                        <Card key={order.id} className="rounded-2xl border-[#e2e8f0]">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center relative">
                                {order.productImage ? (
                                  <Image
                                    src={order.productImage}
                                    alt={order.productTitle}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <Package className="w-8 h-8 text-[#cbd5e1]" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                  <div>
                                    <Link
                                      href={`/products/${order.productId}`}
                                      className="font-bold text-base text-[#112237] hover:text-[#f25c05] line-clamp-1"
                                    >
                                      {order.productTitle}
                                    </Link>
                                    <p className="text-xs text-[#64748b] mt-0.5 font-medium">
                                      {order.sellerId === user!.id
                                        ? `Venta a: ${order.buyerName}`
                                        : `Compra a: ${order.sellerName || "Vendedor"}`}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={status.variant as any}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full"
                                  >
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span>{status.label}</span>
                                  </Badge>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-[#f1f5f9]">
                                  <div>
                                    <p className="text-lg font-black text-[#f25c05]">
                                      {formatPrice(order.amount)}
                                    </p>
                                    <p className="text-xs text-[#64748b]">
                                      {formatDate(order.createdAt)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Link
                                      href={`/products/${order.productId}`}
                                      className="w-full sm:w-auto"
                                    >
                                      <Button variant="outline" size="sm" className="w-full">
                                        Ver producto
                                      </Button>
                                    </Link>

                                    {/* Acciones de Vendedor */}
                                    {order.sellerId === user.id && (
                                      <>
                                        {order.status === "pending" && (
                                          <>
                                            <Button
                                              size="sm"
                                              onClick={() =>
                                                updateOrderStatus(order.id, "paid")
                                              }
                                              disabled={updatingOrder === order.id}
                                              className="bg-[#f25c05] hover:bg-[#d94d04] text-white"
                                            >
                                              {updatingOrder === order.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                              ) : (
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                              )}
                                              Confirmar
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                updateOrderStatus(order.id, "cancelled")
                                              }
                                              disabled={updatingOrder === order.id}
                                            >
                                              <XCircle className="w-4 h-4 mr-1" />
                                              Cancelar
                                            </Button>
                                          </>
                                        )}
                                        {order.status === "paid" && (
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              updateOrderStatus(order.id, "shipped")
                                            }
                                            disabled={updatingOrder === order.id}
                                            className="bg-[#f25c05] hover:bg-[#d94d04] text-white"
                                          >
                                            {updatingOrder === order.id ? (
                                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                            ) : (
                                              <Truck className="w-4 h-4 mr-1" />
                                            )}
                                            Marcar enviado
                                          </Button>
                                        )}
                                        {order.status === "shipped" && (
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              updateOrderStatus(order.id, "delivered")
                                            }
                                            disabled={updatingOrder === order.id}
                                            className="bg-[#f25c05] hover:bg-[#d94d04] text-white"
                                          >
                                            {updatingOrder === order.id ? (
                                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                            ) : (
                                              <Package className="w-4 h-4 mr-1" />
                                            )}
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
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#e2e8f0]">
                    <ShoppingCart className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
                    <h2 className="text-base font-bold text-[#112237] mb-1">
                      No tienes registros en esta sección
                    </h2>
                    <p className="text-xs text-[#64748b] mb-6">
                      {orderType === "sales"
                        ? "Las ventas de tus productos aparecerán aquí."
                        : "Tus compras aparecerán aquí."}
                    </p>
                    <Link href="/search">
                      <Button className="bg-[#f25c05] hover:bg-[#d94d04] text-white">
                        Explorar catálogo
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}