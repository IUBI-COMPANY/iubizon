import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Package, ShoppingCart, MessageCircle, Eye, Heart, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardStats(userId: string) {
  const supabase = await createServerClient();
  
  const [productsRes, ordersRes, favoritesRes, viewsRes] = await Promise.all([
    supabase.from('products').select('id, status, views, favorites', { count: 'exact' }).eq('seller_id', userId),
    supabase.from('orders').select('id, status', { count: 'exact' }).eq('seller_id', userId),
    supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('products').select('views').eq('seller_id', userId),
  ]);

  const products = productsRes.data || [];
  const orders = ordersRes.data || [];

  return {
    totalProducts: productsRes.count || 0,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalOrders: ordersRes.count || 0,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    favoritesCount: favoritesRes.count || 0,
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
  };
}

async function getRecentProducts(userId: string) {
  const supabase = await createServerClient();
  
  const { data } = await supabase
    .from('products')
    .select('id, title, price, status, views, created_at')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-4">Inicia sesión para ver tu dashboard</h2>
            <Link href="/auth/login?redirect=/user/dashboard" className="bg-[#f25c05] text-white px-6 py-3 rounded-lg hover:bg-[#d94d04]">
              Iniciar sesión
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const [stats, recentProducts] = await Promise.all([
    getDashboardStats(user.id),
    getRecentProducts(user.id),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#112237]">Mi Dashboard</h1>
              <p className="text-[#64748b]">Bienvenido de nuevo</p>
            </div>
            <Link href="/products/new" className="flex items-center gap-2 bg-[#f25c05] text-white px-4 py-2 rounded-lg hover:bg-[#d94d04]">
              <Plus className="w-4 h-4" />
              Publicar producto
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#f25c05]/10 rounded-lg">
                  <Package className="w-5 h-5 text-[#f25c05]" />
                </div>
                <span className="text-sm text-[#64748b]">Productos</span>
              </div>
              <p className="text-2xl font-bold text-[#112237]">{stats.totalProducts}</p>
              <p className="text-xs text-[#64748b]">{stats.activeProducts} activos</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-[#64748b]">Pedidos</span>
              </div>
              <p className="text-2xl font-bold text-[#112237]">{stats.totalOrders}</p>
              <p className="text-xs text-[#64748b]">{stats.pendingOrders} pendientes</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-[#64748b]">Vistas</span>
              </div>
              <p className="text-2xl font-bold text-[#112237]">{stats.totalViews}</p>
              <p className="text-xs text-[#64748b]">total</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm text-[#64748b]">Favoritos</span>
              </div>
              <p className="text-2xl font-bold text-[#112237]">{stats.favoritesCount}</p>
              <p className="text-xs text-[#64748b]">recibidos</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/user/dashboard/products" className="bg-white rounded-xl p-6 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-[#112237] mb-2">Mis Productos</h3>
              <p className="text-sm text-[#64748b]">Gestiona tus publicaciones</p>
            </Link>
            <Link href="/user/dashboard/orders" className="bg-white rounded-xl p-6 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-[#112237] mb-2">Mis Pedidos</h3>
              <p className="text-sm text-[#64748b]">Ver estado de ventas</p>
            </Link>
            <Link href="/user/dashboard/messages" className="bg-white rounded-xl p-6 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-[#112237] mb-2">Mensajes</h3>
              <p className="text-sm text-[#64748b]">Chats con compradores</p>
            </Link>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl border border-[#e2e8f0]">
            <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
              <h2 className="font-semibold text-[#112237]">Productos recientes</h2>
              <Link href="/user/dashboard/products" className="text-sm text-[#f25c05] hover:underline">
                Ver todos
              </Link>
            </div>
            
            {recentProducts.length > 0 ? (
              <div className="divide-y divide-[#e2e8f0]">
                {recentProducts.map(product => (
                  <Link key={product.id} href={`/products/edit/${product.id}`} className="flex items-center justify-between p-4 hover:bg-[#f8fafc]">
                    <div>
                      <p className="font-medium text-[#112237]">{product.title}</p>
                      <p className="text-sm text-[#64748b]">S/ {product.price}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status === 'active' ? 'Activo' : product.status === 'sold' ? 'Vendido' : 'Pendiente'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[#64748b]">
                <p>No tienes productos publicados</p>
                <Link href="/products/new" className="text-[#f25c05] hover:underline mt-2 inline-block">
                  Publicar tu primer producto
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}