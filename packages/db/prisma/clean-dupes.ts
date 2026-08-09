import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Encontrar emails con mas de 1 perfil
  const dupes = await prisma.$queryRawUnsafe<{ email: string; count: string }[]>(
    `SELECT email, COUNT(*)::text as count FROM profiles GROUP BY email HAVING COUNT(*) > 1`
  );

  console.log(`Encontrados ${dupes.length} emails duplicados:`);

  for (const { email, count } of dupes) {
    console.log(`\n📧 ${email} - ${count} perfiles:`);

    const profiles = await prisma.profile.findMany({
      where: { email },
      orderBy: { created_at: "asc" },
      include: {
        _count: { select: { orders: true, createdProducts: true, reviews: true, favorites: true, companyMembers: true } },
      },
    });

    for (const p of profiles) {
      console.log(`  ID: ${p.id} | Orders: ${p._count.orders} | Prod: ${p._count.createdProducts} | Reviews: ${p._count.reviews} | Favs: ${p._count.favorites} | Members: ${p._count.companyMembers}`);
    }

    // Mantener el perfil con mas ordenes (o el mas reciente si no hay ordenes)
    const keeper = profiles.reduce((best, p) => {
      const score = p._count.orders * 10 + p._count.reviews * 3 + p._count.favorites;
      const bestScore = best._count.orders * 10 + best._count.reviews * 3 + best._count.favorites;
      if (score > bestScore) return p;
      if (score === bestScore && p.created_at && best.created_at && p.created_at > best.created_at) return p;
      return best;
    });

    const toDelete = profiles.filter(p => p.id !== keeper.id);

    for (const del of toDelete) {
      try {
        await prisma.$transaction([
          prisma.order.updateMany({ where: { buyer_id: del.id }, data: { buyer_id: keeper.id } }),
          prisma.product.updateMany({ where: { created_by: del.id }, data: { created_by: keeper.id } }),
          prisma.review.updateMany({ where: { buyer_id: del.id }, data: { buyer_id: keeper.id } }),
          prisma.favorite.updateMany({ where: { user_id: del.id }, data: { user_id: keeper.id } }),
          prisma.companyMember.updateMany({ where: { user_id: del.id }, data: { user_id: keeper.id } }),
          prisma.profile.delete({ where: { id: del.id } }),
        ]);
        console.log(`  ✅ Eliminado ${del.id}`);
      } catch (err: any) {
        console.error(`  ❌ Error eliminando ${del.id}:`, err.message);
      }
    }
  }

  console.log("\n✅ Limpieza completada");
  await prisma.$disconnect();
}

main();
