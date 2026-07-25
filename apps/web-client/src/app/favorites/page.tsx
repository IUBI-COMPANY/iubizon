import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getFavorites(userId: string) {
  try {
    return await prisma.favorite.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { position: 'asc' } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export default async function FavoritesPage() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-4">Inicia sesión para ver tus favoritos</h2>
            <Link href="/auth/login?redirect=/favorites" className="bg-[#f25c05] text-white px-6 py-3 rounded-lg hover:bg-[#d94d04]">
              Iniciar sesión
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const favorites = await getFavorites(user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-[#112237] mb-6">Mis favoritos</h1>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map(fav => (
                <Link key={fav.id} href={`/products/${fav.product?.id}`} className="block">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center text-4xl">
                      📦
                    </div>
                    <h3 className="font-medium text-[#112237] truncate">{fav.product?.title}</h3>
                    <p className="text-[#f25c05] font-bold">S/ {Number(fav.product?.price || 0).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#64748b] mb-4">No tienes productos en favoritos</p>
              <Link href="/products" className="text-[#f25c05] hover:underline">
                Ver productos
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}