import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.error("[Admin Callback] No code, all params:", Object.fromEntries(searchParams));
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Admin Callback] Exchange error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("[Admin Callback] Unexpected error:", err);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }
}
