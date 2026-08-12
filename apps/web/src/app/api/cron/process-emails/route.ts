import { NextResponse } from "next/server";
import { processPendingEmails } from "@iubizon/email";

export async function GET() {
  try {
    const result = await processPendingEmails(20);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[Cron] Error procesando emails:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
