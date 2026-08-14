import { NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/services/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("keywords") || undefined;
    const categoryId = searchParams.get("category_id") || undefined;
    const minPrice = searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : undefined;
    const maxPrice = searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : undefined;
    const condition = searchParams.get("condition")?.split(",").filter(Boolean);
    const sortBy = searchParams.get("order_by") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const offset = (page - 1) * limit;

    const result = await getProducts({
      limit,
      offset,
      filters: {
        query,
        categoryId,
        minPrice,
        maxPrice,
        condition: condition as any,
        sortBy: sortBy as any,
      },
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[API /api/products/search] Error:", error);
    return NextResponse.json(
      { products: [], total: 0, hasMore: false },
      { status: 500 },
    );
  }
}
