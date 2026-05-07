'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import { ProductGrid } from '@/components/features/products/ProductGrid';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';
import { MapPin, Calendar, MessageCircle, Shield, Package } from 'lucide-react';

function ProfileContent() {
  const params = useParams();
  const profileId = params.id as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    isPro: boolean;
    rating: number;
    totalSales: number;
    positiveReviews: number;
    createdAt: string;
  } | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);

      const [profileRes, productsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, avatar_url, bio, is_pro, rating, total_sales, positive_reviews, created_at')
          .eq('id', profileId)
          .single(),
        supabase
          .from('products')
          .select('*, seller:profiles(*), images:product_images(*), bundle:product_bundles(*)')
          .eq('sellerId', profileId)
          .eq('status', 'active')
          .order('createdAt', { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile({
          id: profileRes.data.id,
          name: profileRes.data.name,
          avatarUrl: profileRes.data.avatar_url,
          bio: profileRes.data.bio,
          isPro: profileRes.data.is_pro,
          rating: profileRes.data.rating,
          totalSales: profileRes.data.total_sales,
          positiveReviews: profileRes.data.positive_reviews,
          createdAt: profileRes.data.created_at,
        });
      }

      if (productsRes.data) {
        setProducts(productsRes.data);
      }

      setIsLoading(false);
    };

    fetchProfileData();
  }, [profileId, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-2">Usuario no encontrado</h2>
            <Link href="/products">
              <Button>Ver productos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.name || 'Usuario'}
                  size="xl"
                  showProBadge={profile.isPro}
                />

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-[#112237]">
                      {profile.name || 'Usuario'}
                    </h1>
                    {profile.isPro && (
                      <Badge variant="pro">PRO</Badge>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-[#64748b] mb-4">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <RatingStars
                        rating={profile.rating}
                        showValue
                        reviewCount={profile.totalSales}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <Package className="w-4 h-4" />
                      <span>{profile.totalSales} ventas</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {memberSince}</span>
                    </div>
                  </div>
                </div>

                {user && user.id !== profileId && (
                  <Link href={`/user/messages?user=${profileId}`}>
                    <Button>
                      <MessageCircle className="w-4 h-4" />
                      Contactar
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold text-[#112237] mb-6">
              Productos de {profile.name}
            </h2>

            {products.length > 0 ? (
              <ProductGrid
                products={products}
                showSeller={false}
              />
            ) : (
              <div className="text-center py-16">
                <p className="text-[#64748b]">Este usuario no tiene productos publicados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    }>
      <AuthProvider>
        <ProfileContent />
      </AuthProvider>
    </Suspense>
  );
}