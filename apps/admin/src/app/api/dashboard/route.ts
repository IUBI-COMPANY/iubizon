import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET() {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalCompanies,
    totalRevenue,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "active" } }),
    db.order.count(),
    db.order.count({ where: { status: "pending" } }),
    db.company.count(),
    db.order.aggregate({ _sum: { total_amount: true } }),
  ]);

  return NextResponse.json({
    products: { total: totalProducts, active: activeProducts },
    orders: { total: totalOrders, pending: pendingOrders },
    companies: { total: totalCompanies },
    revenue: { total: Number(totalRevenue._sum.total_amount || 0) },
  });
}
