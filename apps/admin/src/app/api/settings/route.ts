import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET() {
  const settings = await db.platformSetting.findMany({
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const { key, value } = await req.json();
  await db.platformSetting.update({
    where: { key },
    data: { value, updated_at: new Date() },
  });
  return NextResponse.json({ success: true });
}
