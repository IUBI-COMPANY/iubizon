import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { recordProductView } from "@/lib/services/metrics";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json(
        { error: "Missing product ID" },
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

    await recordProductView(productId, currentUserId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[API Product View POST] Error:", err);
    return NextResponse.json(
      { error: "Error recording view" },
      { status: 500 },
    );
  }
}
