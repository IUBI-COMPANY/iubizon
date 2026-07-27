import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET: Obtener lista de miembros de la empresa y rol del usuario actual
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: companyId } = await params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        companyMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 },
      );
    }

    const currentUserMember = company.companyMembers.find(
      (m) => m.user_id === user.id,
    );

    if (!currentUserMember) {
      return NextResponse.json(
        { error: "No perteneces a esta empresa" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo_url: company.logo_url,
      },
      members: company.companyMembers,
      currentUserRole: currentUserMember.role,
      currentUserId: user.id,
    });
  } catch (err) {
    console.error("Error al consultar miembros:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// POST: Invitar / Agregar nuevo colaborador por correo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await request.json();
    const { email, role } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio" },
        { status: 400 },
      );
    }

    // Verificar que el usuario actual sea owner o admin
    const currentUserMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!currentUserMember) {
      return NextResponse.json(
        { error: "No tienes permisos para agregar miembros" },
        { status: 403 },
      );
    }

    // Buscar perfil registrado por email
    const targetUser = await prisma.profile.findFirst({
      where: { email: email.trim().toLowerCase() },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "No se encontró ningún usuario registrado en iubizon con ese correo.",
        },
        { status: 404 },
      );
    }

    // Verificar si ya es miembro
    const existingMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: targetUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "El usuario ya es colaborador de esta empresa" },
        { status: 400 },
      );
    }

    const assignedRole = role === "admin" ? "admin" : "member";

    const newMember = await prisma.companyMember.create({
      data: {
        company_id: companyId,
        user_id: targetUser.id,
        role: assignedRole,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar_url: true },
        },
      },
    });

    return NextResponse.json({ member: newMember, success: true });
  } catch (err) {
    console.error("Error al agregar miembro:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al agregar miembro" },
      { status: 500 },
    );
  }
}

// PATCH: Cambiar rol de un colaborador o transferir ownership
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await request.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 },
      );
    }

    // Verificar permisos del usuario actual
    const currentUserMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
      },
    });

    if (
      !currentUserMember ||
      (currentUserMember.role !== "owner" && currentUserMember.role !== "admin")
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para cambiar roles" },
        { status: 403 },
      );
    }

    // Si se intenta asignar 'owner': solo el owner actual puede transferir propiedad
    if (newRole === "owner") {
      if (currentUserMember.role !== "owner") {
        return NextResponse.json(
          { error: "Solo el dueño actual puede transferir la propiedad de la empresa" },
          { status: 403 },
        );
      }

      // Transferencia atómica de ownership
      await prisma.$transaction([
        // Cambiar nuevo dueño a owner
        prisma.companyMember.update({
          where: {
            company_id_user_id: {
              company_id: companyId,
              user_id: targetUserId,
            },
          },
          data: { role: "owner" },
        }),
        // Cambiar antiguo dueño a admin
        prisma.companyMember.update({
          where: {
            company_id_user_id: {
              company_id: companyId,
              user_id: user.id,
            },
          },
          data: { role: "admin" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Propiedad de la empresa transferida con éxito",
      });
    }

    // Para cambiar entre 'admin' y 'member'
    const targetMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: targetUserId,
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "El miembro objetivo no pertenece a la empresa" },
        { status: 404 },
      );
    }

    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "No puedes degradar al dueño directamente. Transfiere la propiedad primero." },
        { status: 400 },
      );
    }

    const updated = await prisma.companyMember.update({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: targetUserId,
        },
      },
      data: { role: newRole === "admin" ? "admin" : "member" },
    });

    return NextResponse.json({ member: updated, success: true });
  } catch (err) {
    console.error("Error al actualizar rol de miembro:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar rol" },
      { status: 500 },
    );
  }
}

// DELETE: Desvincular / Eliminar miembro
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    // Verificar permisos
    const currentUserMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
      },
    });

    if (
      !currentUserMember ||
      (currentUserMember.role !== "owner" && currentUserMember.role !== "admin")
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para desvincular colaboradores" },
        { status: 403 },
      );
    }

    const targetMember = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: targetUserId,
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "El colaborador no pertenece a la empresa" },
        { status: 404 },
      );
    }

    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "No se puede eliminar al dueño de la empresa" },
        { status: 400 },
      );
    }

    await prisma.companyMember.delete({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: targetUserId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al desvincular miembro:", err);
    return NextResponse.json(
      { error: "Error interno al desvincular miembro" },
      { status: 500 },
    );
  }
}
