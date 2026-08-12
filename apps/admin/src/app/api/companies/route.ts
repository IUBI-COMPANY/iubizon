import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { legal_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [companies, total] = await Promise.all([
    db.company.findMany({
      where,
      include: {
        _count: { select: { products: true, companyMembers: true } },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    db.company.count({ where }),
  ]);

  return NextResponse.json({ companies, total });
}

export async function PATCH(req: Request) {
  const { id, is_verified } = await req.json();

  const result = await db.$transaction(async (tx) => {
    // 1. Obtener primero el estado previo y la fecha de última actualización
    const currentCompany = await tx.company.findUnique({
      where: { id },
      select: { is_verified: true, updated_at: true },
    });

    let activatedCount = 0;
    let wasSuspendedLongTime = false;

    // Si la empresa ha sido verificada/aprobada
    if (is_verified) {
      const lastUpdated = currentCompany?.updated_at ? new Date(currentCompany.updated_at) : new Date();
      const diffTime = Math.abs(new Date().getTime() - lastUpdated.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Caso A: Re-aprobación tardía (Más de 30 días de inactividad / suspensión)
      if (currentCompany && currentCompany.is_verified === false && diffDays > 30) {
        wasSuspendedLongTime = true;
        // Poner todos los productos en inactivo y stock a 0 para obligar a revisión de inventario
        await tx.product.updateMany({
          where: {
            company_id: id,
          },
          data: {
            status: "inactive",
            stock: 0,
          },
        });
      } else {
        // Caso B: Aprobación por primera vez o re-aprobación rápida (menos de 30 días)
        const activeProductsCount = await tx.product.count({
          where: {
            company_id: id,
            status: "active",
          },
        });

        // Solo activar por lote en primera aprobación (cuando no tiene ningún activo previo)
        if (activeProductsCount === 0) {
          const inactiveProducts = await tx.product.findMany({
            where: {
              company_id: id,
              status: "inactive",
            },
            include: {
              images: {
                take: 1,
              },
            },
          });

          // Filtrar productos válidos
          const validProductIds = inactiveProducts
            .filter((prod) => {
              const hasImages = prod.images.length > 0;
              const hasStock = prod.stock !== null && prod.stock > 0;
              const hasPrice = prod.price !== null && Number(prod.price) > 0;
              const hasTitle = prod.title && prod.title.trim() !== "";
              return hasImages && hasStock && hasPrice && hasTitle;
            })
            .map((p) => p.id);

          if (validProductIds.length > 0) {
            const updateResult = await tx.product.updateMany({
              where: {
                id: { in: validProductIds },
              },
              data: {
                status: "active",
              },
            });
            activatedCount = updateResult.count;
          }
        }
      }
    }

    // 2. Realizar la actualización física de la empresa
    const updatedCompany = await tx.company.update({
      where: { id },
      data: { is_verified },
    });

    return { updatedCompany, activatedCount, wasSuspendedLongTime };
  });

  return NextResponse.json({ 
    success: true, 
    activatedCount: result.activatedCount,
    wasSuspendedLongTime: result.wasSuspendedLongTime 
  });
}
