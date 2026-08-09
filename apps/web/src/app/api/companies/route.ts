import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createCompany, getUserCompanies } from "@/lib/services/companies";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await getUserCompanies(user.id);
    return NextResponse.json({
      companies: result.companies,
      last_active_company_id: result.last_active_company_id,
    });
  } catch (err) {
    console.error("Error al obtener empresas:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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

    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 },
      );
    }

    const { updateUserActiveCompany } =
      await import("@/lib/services/companies");
    await updateUserActiveCompany(user.id, companyId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al actualizar empresa activa:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    console.log(
      "[POST /api/companies] Body:",
      JSON.stringify({ ...body, logo_url: body.logo_url ? "[present]" : null }),
    );
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "El nombre de la empresa es obligatorio" },
        { status: 400 },
      );
    }
    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: "El email de la empresa es obligatorio" },
        { status: 400 },
      );
    }
    if (!body.legal_name?.trim()) {
      return NextResponse.json(
        { error: "La razón social de la empresa es obligatoria" },
        { status: 400 },
      );
    }

    // Verificar si el RUC ya está registrado
    if (body.tax_id?.trim()) {
      const existingRuc = await prisma.company.findFirst({
        where: { tax_id: body.tax_id.trim() },
      });
      if (existingRuc) {
        return NextResponse.json(
          { error: `El RUC ${body.tax_id.trim()} ya está registrado en iubizon.` },
          { status: 400 },
        );
      }
    }

    const company = await createCompany(body, user.id);
    return NextResponse.json({ company });
  } catch (err) {
    console.error(
      "[POST /api/companies] Error:",
      err instanceof Error ? err.message : err,
      err instanceof Error ? err.stack : "",
    );
    const message =
      err instanceof Error ? err.message : "Error al crear la empresa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
