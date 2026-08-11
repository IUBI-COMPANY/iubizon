import { NextResponse } from "next/server";
import { sendSellerPayoutNotification } from "@/lib/email/send-payout-email";

export async function POST(req: Request) {
  try {
    const { payoutId } = await req.json();

    if (!payoutId) {
      return NextResponse.json({ error: "payoutId es requerido" }, { status: 400 });
    }

    sendSellerPayoutNotification(payoutId).catch((err) =>
      console.error("[Payout Email Route] Error:", err),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Payout Email Route] Error:", err);
    return NextResponse.json({ error: "Error enviando email" }, { status: 500 });
  }
}
