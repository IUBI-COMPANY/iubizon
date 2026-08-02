import { prisma } from "../lib/prisma";

async function main() {
  const p = await prisma.product.findUnique({
    where: { id: "ff06c0ba-aa80-46a7-9653-352b747583c8" }
  });
  console.log("PROYECTOR EPSON STOCK ACTUAL EN PRISMA:", p?.stock);
}

main();
