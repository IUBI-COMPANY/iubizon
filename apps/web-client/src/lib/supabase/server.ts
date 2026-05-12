import { createServerClient as createServerClientSSR, type CookieOptions } from '@supabase/ssr';

interface CookieStore {
  getAll(): Array<{ name: string; value: string }>;
  setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>): void;
}

export const createServerClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
};

export async function getActiveProducts() {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*), bundle:product_bundles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  const productsWithOrderedImages = data?.map(product => ({
    ...product,
    images: product.images?.sort((a: any, b: any) => a.position - b.position) || [],
  })) || [];

  return productsWithOrderedImages;
}