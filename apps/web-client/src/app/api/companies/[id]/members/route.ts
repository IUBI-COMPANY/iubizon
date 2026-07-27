import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  addCompanyMember,
  removeCompanyMember,
} from "@/lib/services/companies";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id: companyId } = await params;
    const { email, role } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "El correo del colaborador es obligatorio" },
        { status: 400 },
      );
    }

    const member = await addCompanyMember(companyId, email, role || "member");
    return NextResponse.json({ member });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al agregar miembro" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id: companyId } = await params;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    await removeCompanyMember(companyId, targetUserId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al eliminar miembro" },
      { status: 400 },
    );
  }
}
