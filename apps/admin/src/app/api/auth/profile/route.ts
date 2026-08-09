import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db } from "@iubizon/db";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return NextResponse.json({ role: profile?.role || "user" });
}
