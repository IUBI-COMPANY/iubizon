import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * SUPABASE SSR PROXY (Next.js 16 equivalent of middleware)
 *
 * This proxy is REQUIRED by @supabase/ssr to:
 *  1. Refresh the session token on every request (prevents session loss on refresh)
 *  2. Write updated cookies back to the browser response
 *  3. Protect authenticated routes by redirecting unauthenticated users
 */
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
          // Write cookies to the request so downstream server components can read them
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Rebuild response with updated request so cookies propagate correctly
          supabaseResponse = NextResponse.next({ request });
          // Write refreshed cookies to the response so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() validates the JWT with Supabase Auth AND triggers a refresh if needed.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If Supabase is unreachable, allow request through
  if (error && error.message !== 'Auth session missing!') {
    return supabaseResponse;
  }

  const isAuthenticated = !!user;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register');

  const isProtectedPage =
    pathname.startsWith('/user/dashboard') ||
    pathname.startsWith('/user/profile') ||
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/products/new') ||
    pathname.startsWith('/products/edit') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout');

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!isAuthenticated && isProtectedPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user trying to access login/register → redirect to dashboard
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
     * - favicon.ico, favicon.png (favicon files)
     * - manifest.json, robots.txt, sitemap.xml (SEO files)
     * - Static assets: svg, png, jpg, jpeg, gif, webp, ico, otf, ttf, woff
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|otf|ttf|woff2?)$).*)',
  ],
};
