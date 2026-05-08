import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { Plus, Edit, Package, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUserProducts(userId: string) {
  const supabase = await createServerClient();
  
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  const productsWithSortedImages = data?.map(product => ({
    ...product,
    images: product.images?.sort((a: any, b: any) => a.position - b.position) || [],
  })) || [];

  return productsWithSortedImages;
}

export default async function ProductsManagementPage() {
  const cookieStore = cookies();
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-4">Inicia sesión</h2>
            <Link href="/auth/login?redirect=/user/dashboard/products" className="bg-[#f25c05] text-white px-6 py-3 rounded-lg hover:bg-[#d94d04]">
              Iniciar sesión
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const products = await getUserProducts(user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/user/dashboard" className="text-[#64748b] hover:text-[#112237]">
                ← Volver
              </Link>
              <h1 className="text-2xl font-bold text-[#112237]">Mis Productos</h1>
            </div>
            <Link href="/products/new" className="flex items-center gap-2 bg-[#f25c05] text-white px-4 py-2 rounded-lg hover:bg-[#d94d04]">
              <Plus className="w-4 h-4" />
              Nuevo producto
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#e2e8f0] text-sm font-medium text-[#64748b]">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2">Precio</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-3">Acciones</div>
              </div>
              
              <div className="divide-y divide-[#e2e8f0]">
                {products.map(product => {
                  const mainImage = product.images?.[0]?.url;
                  
                  return (
                    <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f8fafc]">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-[#f8fafc] rounded-lg overflow-hidden shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <>
                              <Image
                                src={product.images[0].url}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                              {product.images.length > 1 && (
                                <div className="absolute bottom-1 right-1 bg-[#f25c05] text-white text-xs px-1.5 py-0.5 rounded">
                                  +{product.images.length - 1}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#112237] line-clamp-1">{product.title}</p>
                          <p className="text-xs text-[#64748b]">
                            {product.condition === 'new' ? 'Nuevo' : 
                             product.condition === 'like_new' ? 'Como nuevo' :
                             product.condition === 'good' ? 'Buen estado' : 'Aceptable'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="font-semibold text-[#112237]">S/ {product.price}</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                          product.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {product.status === 'active' ? 'Activo' : 
                           product.status === 'sold' ? 'Vendido' :
                           product.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="col-span-3 flex items-center gap-2">
                        <Link 
                          href={`/products/edit/${product.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#64748b] hover:text-[#112237] hover:bg-[#f8fafc] rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                        <Link 
                          href={`/products/${product.id}`}
                          target="_blank"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#64748b] hover:text-[#112237] hover:bg-[#f8fafc] rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-[#64748b] mb-4" />
              <h2 className="text-xl font-semibold text-[#112237] mb-2">No tienes productos</h2>
              <p className="text-[#64748b] mb-4">Comienza a vender publicando tu primer producto</p>
              <Link href="/products/new" className="inline-flex items-center gap-2 bg-[#f25c05] text-white px-4 py-2 rounded-lg hover:bg-[#d94d04]">
                <Plus className="w-4 h-4" />
                Publicar producto
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}