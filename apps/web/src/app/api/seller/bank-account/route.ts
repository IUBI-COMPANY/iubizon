import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("company_id");

    if (companyId) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id: companyId, user_id: user.id },
        include: { company: true },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permiso para acceder a esta empresa" },
          { status: 403 },
        );
      }

      let bankAccount = null;
      if (membership.company.bank_account) {
        try {
          const parsed = JSON.parse(membership.company.bank_account);
          if (parsed && typeof parsed === "object" && parsed.bank_name) {
            bankAccount = parsed;
          }
        } catch {}
      }

      let payoutCard = null;
      if (membership.company.payout_card) {
        try {
          const parsed = typeof membership.company.payout_card === "string"
            ? JSON.parse(membership.company.payout_card)
            : membership.company.payout_card;
          if (parsed && typeof parsed === "object") {
            payoutCard = parsed;
          }
        } catch {}
      }

      return NextResponse.json({ type: "company", companyId, bankAccount, payoutCard });
    }

    return NextResponse.json({ type: "personal", bankAccount: null });
  } catch (err: unknown) {
    console.error("Error al obtener cuenta bancaria:", err);
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
    const {
      company_id,
      bank_name,
      account_type,
      account_number,
      cci,
      holder_name,
      holder_doc,
      payout_card,
    } = body;

    if (payout_card) {
      if (!company_id) {
        return NextResponse.json(
          { error: "ID de empresa requerido" },
          { status: 400 },
        );
      }

      const membership = await prisma.companyMember.findFirst({
        where: { company_id, user_id: user.id },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permiso para actualizar esta empresa" },
          { status: 403 },
        );
      }

      await prisma.company.update({
        where: { id: company_id },
        data: { payout_card: payout_card },
      });

      return NextResponse.json({
        success: true,
        message: "Tarjeta de pago guardada con éxito.",
        payoutCard: payout_card,
      });
    }

    if (!bank_name || !account_number || !holder_name) {
      return NextResponse.json(
        { error: "Por favor completa el banco, número de cuenta y titular." },
        { status: 400 },
      );
    }

    const bankAccountPayload = {
      bank_name,
      account_type: account_type || "ahorros",
      account_number,
      cci: cci || "",
      holder_name,
      holder_doc: holder_doc || "",
      updated_at: new Date().toISOString(),
    };

    if (company_id) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id, user_id: user.id },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permiso para actualizar esta empresa" },
          { status: 403 },
        );
      }

      await prisma.company.update({
        where: { id: company_id },
        data: { bank_account: JSON.stringify(bankAccountPayload) },
      });

      return NextResponse.json({
        success: true,
        message: "Cuenta bancaria de la empresa guardada con éxito.",
        bankAccount: bankAccountPayload,
      });
    }

    return NextResponse.json(
      { error: "ID de empresa requerido" },
      { status: 400 },
    );
  } catch (err: unknown) {
    console.error("Error al guardar cuenta bancaria:", err);
    return NextResponse.json(
      { error: "Error al guardar los datos bancarios" },
      { status: 500 },
    );
  }
}
