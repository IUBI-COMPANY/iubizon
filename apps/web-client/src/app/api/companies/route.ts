import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
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

    const companies = await getUserCompanies(user.id);
    return NextResponse.json({ companies });
  } catch (err) {
    console.error("Error al obtener empresas:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
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
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "El nombre de la empresa es obligatorio" },
        { status: 400 },
      );
    }

    const company = await createCompany(body, user.id);
    return NextResponse.json({ company });
  } catch (err) {
    console.error("Error al crear empresa:", err);
    return NextResponse.json(
      { error: "Error al crear la empresa" },
      { status: 500 },
    );
  }
}
