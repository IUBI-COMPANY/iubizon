import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getRoleByEmail } from "@/lib/services/roles";

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

    let profile = await prisma.profile.findUnique({
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
      // ¿Existe un perfil guest (compra sin cuenta) con el mismo email?
      // Si es así, migrar sus órdenes al nuevo perfil autenticado.
      const guestProfile = await prisma.profile.findFirst({
        where: {
          email: supabaseUser.email ?? "",
          id: { not: supabaseUser.id },
        },
      });

      if (guestProfile) {
        await prisma.$transaction([
          // Migrar órdenes de compra del guest al perfil autenticado
          prisma.order.updateMany({
            where: { buyer_id: guestProfile.id },
            data: { buyer_id: supabaseUser.id },
          }),
          // Migrar productos creados (si aplica)
          prisma.product.updateMany({
            where: { created_by: guestProfile.id },
            data: { created_by: supabaseUser.id },
          }),
          // Migrar reseñas
          prisma.review.updateMany({
            where: { buyer_id: guestProfile.id },
            data: { buyer_id: supabaseUser.id },
          }),
          // Migrar favoritos
          prisma.favorite.updateMany({
            where: { user_id: guestProfile.id },
            data: { user_id: supabaseUser.id },
          }),
          // Migrar membresías de empresa (si aplica)
          prisma.companyMember.updateMany({
            where: { user_id: guestProfile.id },
            data: { user_id: supabaseUser.id },
          }),
          // Eliminar perfil guest
          prisma.profile.delete({
            where: { id: guestProfile.id },
          }),
        ]);
      }

      profile = await prisma.profile.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          name:
            supabaseUser.user_metadata?.name ??
            supabaseUser.email?.split("@")[0] ??
            "Usuario",
          avatar_url: googleAvatar,
          role: getRoleByEmail(supabaseUser.email ?? ""),
        },
      });
    } else if (!profile.avatar_url && googleAvatar) {
      profile = await prisma.profile.update({
        where: { id: supabaseUser.id },
        data: { avatar_url: googleAvatar },
      });
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

export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, bio, avatar_url } = body;

    const data: Record<string, unknown> = { updated_at: new Date() };
    if (name !== undefined) data.name = name.trim() || null;
    if (phone !== undefined) data.phone = phone.trim() || null;
    if (bio !== undefined) data.bio = bio.trim() || null;
    if (avatar_url !== undefined) data.avatar_url = avatar_url || null;

    const profile = await prisma.profile.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ profile, success: true });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 },
    );
  }
}
