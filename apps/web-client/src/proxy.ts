import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getClaims() cryptographically verifies the JWT and triggers session refresh
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && !!data;

  if (error) {
    // Supabase unreachable — allow the request through,
    // individual pages handle their own auth checks
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');
  const isProtectedPage =
    pathname.startsWith('/user/dashboard') ||
    pathname.startsWith('/user/profile') ||
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/products/new') ||
    pathname.startsWith('/products/edit') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout');

  if (!isAuthenticated && isProtectedPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets: svg, png, jpg, jpeg, gif, webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
