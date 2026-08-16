import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("company_id");

    if (
      !companyIdParam ||
      companyIdParam === "personal" ||
      companyIdParam === "none"
    ) {
      return NextResponse.json({ count: 0 });
    }

    // Verificar que el usuario sea miembro de la empresa
    const membership = await prisma.companyMember.findFirst({
      where: {
        company_id: companyIdParam,
        user_id: user.id,
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json({ count: 0 });
    }

    // Contar pedidos en estado "pending" (ventas nuevas pendientes de despacho)
    const count = await prisma.orderPackage.count({
      where: {
        company_id: companyIdParam,
        status: "pending",
      },
    });

    return NextResponse.json({ count });
  } catch (err: unknown) {
    console.error("[API pending-orders-count GET] Error:", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
