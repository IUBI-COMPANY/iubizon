import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = null;

    if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
      try {
        profile = await prisma.profile.findUnique({
          where: { id: supabaseUser.id },
        });

        const googleAvatar =
          supabaseUser.user_metadata?.avatar_url ??
          supabaseUser.user_metadata?.picture ??
          (
            supabaseUser.identities?.[0]?.identity_data as
              Record<string, string> | undefined
          )?.avatar_url ??
          (
            supabaseUser.identities?.[0]?.identity_data as
              Record<string, string> | undefined
          )?.picture ??
          null;

        if (!profile) {
          profile = await prisma.profile.create({
            data: {
              id: supabaseUser.id,
              email: supabaseUser.email ?? "",
              name:
                supabaseUser.user_metadata?.name ??
                supabaseUser.email?.split("@")[0] ??
                "Usuario",
              avatar_url: googleAvatar,
            },
          });
        } else if (!profile.avatar_url && googleAvatar) {
          profile = await prisma.profile.update({
            where: { id: supabaseUser.id },
            data: { avatar_url: googleAvatar },
          });
        }
      } catch (prismaErr) {
        console.warn(
          "[API /api/user/profile] Prisma fetch failed, fallback to Supabase:",
          prismaErr,
        );
      }
    }

    if (!profile) {
      const { data: supaProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();
      profile = supaProfile;
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[API /api/user/profile] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
