import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function migrateGuestOrders(supabaseUserId: string, userEmail: string) {
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { id: supabaseUserId },
    });
    if (existingProfile) return;

    const guestProfile = await prisma.profile.findFirst({
      where: { email: userEmail, id: { not: supabaseUserId } },
    });
    if (!guestProfile) return;

    await prisma.$transaction([
      prisma.order.updateMany({
        where: { buyer_id: guestProfile.id },
        data: { buyer_id: supabaseUserId },
      }),
      prisma.product.updateMany({
        where: { created_by: guestProfile.id },
        data: { created_by: supabaseUserId },
      }),
      prisma.review.updateMany({
        where: { buyer_id: guestProfile.id },
        data: { buyer_id: supabaseUserId },
      }),
      prisma.favorite.updateMany({
        where: { user_id: guestProfile.id },
        data: { user_id: supabaseUserId },
      }),
      prisma.companyMember.updateMany({
        where: { user_id: guestProfile.id },
        data: { user_id: supabaseUserId },
      }),
      prisma.profile.delete({ where: { id: guestProfile.id } }),
    ]);

    console.log(
      `[Auth Callback] Migradas órdenes de guest (${guestProfile.id}) → usuario (${supabaseUserId})`,
    );
  } catch (err) {
    console.error("[Auth Callback] Error migrando guest orders:", err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    "signup" | "recovery" | "invite" | "magiclink" | "email_change" | null;
  const next = searchParams.get("next") ?? "/";

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        await migrateGuestOrders(userData.user.id, userData.user.email);
      }

      const redirectResponse = NextResponse.redirect(`${origin}${next}`);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        await migrateGuestOrders(userData.user.id, userData.user.email);
      }

      const redirectTo = type === "recovery" ? "/auth/reset-password" : next;
      const redirectUrl = next.startsWith("http")
        ? next
        : `${origin}${redirectTo}`;
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
