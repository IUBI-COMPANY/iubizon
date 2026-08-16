import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { recordCompanyStorefrontView } from "@/lib/services/metrics";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: companyId } = await params;
    if (!companyId) {
      return NextResponse.json(
        { error: "Missing company ID" },
        { status: 400 },
      );
    }

    let currentUserId: string | null = null;
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentUserId = user?.id || null;
    } catch {
      // Visitante anónimo
    }

    await recordCompanyStorefrontView(companyId, currentUserId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[API Company View POST] Error:", err);
    return NextResponse.json(
      { error: "Error recording view" },
      { status: 500 },
    );
  }
}
