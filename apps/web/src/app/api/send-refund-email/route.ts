import { NextResponse } from "next/server";
import {
  sendRefundStatusNotification,
  sendRefundCompletedNotification,
} from "@/lib/email";

export async function POST(req: Request) {
  const { refundId, approved, type } = await req.json();
  if (!refundId)
    return NextResponse.json({ error: "refundId requerido" }, { status: 400 });

  if (type === "completed") {
    sendRefundCompletedNotification(refundId).catch((err) =>
      console.error("[Refund Notification] Error:", err),
    );
  } else {
    sendRefundStatusNotification(refundId, approved ?? true).catch((err) =>
      console.error("[Refund Notification] Error:", err),
    );
  }

  return NextResponse.json({ success: true });
}
