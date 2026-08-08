import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Package } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProfileData(profileId: string) {
  try {
    const [profile, products] = await Promise.all([
      prisma.profile.findUnique({ where: { id: profileId } }),
      prisma.product.findMany({
        where: { created_by: profileId, status: "active", stock: { gt: 0 } },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { created_at: "desc" },
        take: 20,
      }),
    ]);
    return { profile, products };
  } catch (error) {
    console.error("Error fetching profile data with Prisma:", error);
    return { profile: null, products: [] };
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const { profile, products } = await getProfileData(id);

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-2">
              Usuario no encontrado
            </h2>
            <Link href="/" className="text-[#f25c05] hover:underline">
              Volver al inicio
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
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-[#f8fafc] overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name || "Usuario"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#64748b]">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#112237]">
                    {profile.name || "Usuario"}
                  </h1>
                  {profile.is_pro && (
                    <span className="bg-[#f25c05] text-white text-xs px-2 py-0.5 rounded-full">
                      Verificado
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-[#64748b] mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-[#64748b]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Unido en{" "}
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "es-PE",
                            { month: "long", year: "numeric" },
                          )
                        : "2026"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{products.length} productos</span>
                  </div>
                  {(Number(profile.rating) || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>
                        {Number(profile.rating).toFixed(1)} (
                        {profile.positive_reviews} reseñas)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <h2 className="text-xl font-bold text-[#112237] mb-6">
              Productos publicados
            </h2>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => {
                  const firstImage = product.images?.[0]?.url;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block"
                    >
                      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square relative bg-[#f8fafc]">
                          {firstImage ? (
                            <Image
                              src={firstImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-[#112237] truncate text-sm">
                            {product.title}
                          </h3>
                          <p className="text-[#f25c05] font-bold">
                            S/ {Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
                <p className="text-[#64748b]">
                  Este usuario no tiene productos publicados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
