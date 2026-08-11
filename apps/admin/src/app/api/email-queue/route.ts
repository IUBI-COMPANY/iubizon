import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "failed";

    const emails = await db.emailQueue.findMany({
      where: { status },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({ emails });
  } catch (err: unknown) {
    console.error(
      "[EmailQueue API] Error:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ emails: [] });
  }
}
