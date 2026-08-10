import { NextResponse } from "next/server";
import { sendRefundStatusNotification } from "@/lib/email";

export async function POST(req: Request) {
  const { refundId, approved } = await req.json();
  if (!refundId) return NextResponse.json({ error: "refundId requerido" }, { status: 400 });

  sendRefundStatusNotification(refundId, approved).catch((err) =>
    console.error("[Refund Notification] Error:", err),
  );

  return NextResponse.json({ success: true });
}
