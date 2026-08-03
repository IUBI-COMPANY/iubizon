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
      // Verificar membresía de empresa
      const membership = await prisma.companyMember.findFirst({
        where: {
          company_id: companyId,
          user_id: user.id,
        },
        include: { company: true },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permiso para acceder a esta empresa" },
          { status: 403 }
        );
      }

      // Extraer datos bancarios almacenados en company.description o JSON
      let bankAccount = null;
      if (membership.company.description) {
        try {
          const parsed = JSON.parse(membership.company.description);
          if (parsed && typeof parsed === "object" && parsed.bank_name) {
            bankAccount = parsed;
          }
        } catch {
          // Si description no era JSON, es solo un texto normal
        }
      }

      return NextResponse.json({
        type: "company",
        companyId,
        bankAccount,
      });
    }

    // Datos bancarios personales en el perfil de usuario
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    let bankAccount = null;
    if (profile?.bio) {
      try {
        const parsed = JSON.parse(profile.bio);
        if (parsed && typeof parsed === "object" && parsed.bank_name) {
          bankAccount = parsed;
        }
      } catch {
        // Ignorar si bio es texto plano
      }
    }

    return NextResponse.json({
      type: "personal",
      bankAccount,
    });
  } catch (err: unknown) {
    console.error("Error al obtener cuenta bancaria:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
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
    } = body;

    if (!bank_name || !account_number || !holder_name) {
      return NextResponse.json(
        { error: "Por favor completa el banco, número de cuenta y titular." },
        { status: 400 }
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
      // Verificar permiso
      const membership = await prisma.companyMember.findFirst({
        where: {
          company_id,
          user_id: user.id,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permiso para actualizar esta empresa" },
          { status: 403 }
        );
      }

      await prisma.company.update({
        where: { id: company_id },
        data: {
          description: JSON.stringify(bankAccountPayload),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cuenta bancaria de la empresa guardada con éxito.",
        bankAccount: bankAccountPayload,
      });
    }

    // Guardar para perfil personal
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        bio: JSON.stringify(bankAccountPayload),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta bancaria personal guardada con éxito.",
      bankAccount: bankAccountPayload,
    });
  } catch (err: unknown) {
    console.error("Error al guardar cuenta bancaria:", err);
    return NextResponse.json(
      { error: "Error al guardar los datos bancarios" },
      { status: 500 }
    );
  }
}
