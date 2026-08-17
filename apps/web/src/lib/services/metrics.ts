import { prisma } from "@/lib/prisma";

/**
 * Verifica si un usuario es propietario o miembro de una empresa determinada.
 */
export async function isCompanyMemberOrOwner(
  companyId: string | null | undefined,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!companyId || !userId) return false;
  try {
    const member = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      select: { id: true },
    });
    return !!member;
  } catch (err) {
    console.error("Error al verificar membresía de empresa:", err);
    return false;
  }
}

/**
 * Incrementa de forma segura las vistas de un producto (+1) solo si el visitante
 * NO es un miembro o dueño de la empresa vendedora (excluye vistas internas).
 */
export async function recordProductView(
  productId: string,
  currentUserId?: string | null,
): Promise<void> {
  if (!productId) return;
  try {
    // 1. Obtener la empresa del producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { company_id: true },
    });
    if (!product || !product.company_id) return;

    // 2. Si el usuario actual es miembro/dueño de la empresa vendedora, NO sumar vista propia
    if (currentUserId) {
      const isInternalUser = await isCompanyMemberOrOwner(
        product.company_id,
        currentUserId,
      );
      if (isInternalUser) {
        return; // Ignorar vistas propias de miembros de la empresa
      }
    }

    // 3. Incrementar vistas (+1) para compradores externos o usuarios anónimos
    await prisma.product.update({
      where: { id: productId },
      data: {
        views: { increment: 1 },
      },
    });
  } catch (err) {
    console.error(`Error al registrar vista de producto (${productId}):`, err);
  }
}

/**
 * Incrementa exactamente +1 el alcance total de la empresa cuando un comprador o visitante
 * externo ingresa al perfil (/companies/[slug]).
 *
 * Reglas:
 * 1. Si el usuario es propietario o miembro de la empresa, NO suma (+0).
 * 2. Si es un visitante/comprador externo, suma EXACTAMENTE +1, tenga o no productos creados.
 */
export async function recordCompanyStorefrontView(
  companyId: string,
  currentUserId?: string | null,
): Promise<void> {
  if (!companyId) return;
  try {
    // 1. EXCLUSIÓN DE MIEMBROS/DUEÑOS: Si el usuario es propietario o miembro, no incrementar
    if (currentUserId) {
      const isInternalUser = await isCompanyMemberOrOwner(
        companyId,
        currentUserId,
      );
      if (isInternalUser) {
        return; // Omitir vistas internas de la propia empresa
      }
    }

    // 2. Buscar cualquier producto de la empresa para asignarle +1 vista
    let targetProduct = await prisma.product.findFirst({
      where: { company_id: companyId },
      select: { id: true },
      orderBy: { created_at: "desc" },
    });

    // 3. Si la empresa aún no tiene productos, crear un contenedor métrico borrador
    if (!targetProduct) {
      const firstCategory = await prisma.category.findFirst({
        select: { id: true },
      });
      if (firstCategory) {
        targetProduct = await prisma.product.create({
          data: {
            company_id: companyId,
            category_id: firstCategory.id,
            title: "Métricas de Alcance de Tienda",
            description: "Contador interno de vistas de la empresa",
            price: 0,
            status: "draft",
            condition: "new",
            views: 1,
          },
          select: { id: true },
        });
        return;
      }
    }

    // 4. Incrementar exactamente +1 las vistas en el producto objetivo de la empresa
    if (targetProduct) {
      await prisma.product.update({
        where: { id: targetProduct.id },
        data: {
          views: { increment: 1 },
        },
      });
    }
  } catch (err) {
    console.error(
      `Error al registrar vista de tienda oficial para empresa (${companyId}):`,
      err,
    );
  }
}

/**
 * Obtiene de forma agregada las métricas de alcance (vistas) e interacciones (favoritos)
 * para cualquier empresa o catálogo de vendedor.
 */
export async function getCompanyReachMetrics(companyId: string) {
  try {
    const aggregate = await prisma.product.aggregate({
      where: { company_id: companyId },
      _sum: {
        views: true,
        favorites_count: true,
      },
    });

    const activeProductsCount = await prisma.product.count({
      where: { company_id: companyId, status: { not: "draft" } },
    });

    return {
      totalViews: aggregate._sum.views || 0,
      totalFavorites: aggregate._sum.favorites_count || 0,
      totalProductsCount: activeProductsCount,
    };
  } catch (err) {
    console.error(
      `Error al calcular métricas de alcance para empresa (${companyId}):`,
      err,
    );
    return {
      totalViews: 0,
      totalFavorites: 0,
      totalProductsCount: 0,
    };
  }
}
