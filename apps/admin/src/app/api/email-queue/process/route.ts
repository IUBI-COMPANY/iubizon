import { NextResponse } from "next/server";
import { processPendingEmails } from "@iubizon/email";

export async function POST() {
  try {
    const result = await processPendingEmails(50);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error(
      "[EmailQueue Process] Error:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Error al procesar la cola de emails" },
      { status: 500 },
    );
  }
}
