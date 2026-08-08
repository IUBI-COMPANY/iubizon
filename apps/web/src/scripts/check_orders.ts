import fs from "fs";
import path from "path";

// Cargar .env.local antes de importar @iubizon/db
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).replace(/['"]/g, "").trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

// Ahora importamos — el singleton Proxy leerá process.env al inicializarse
const { db } = await import("@iubizon/db");

async function main() {
  const companies = await db.company.findMany({
    select: { id: true, name: true },
  });
  console.log("TODAS LAS EMPRESAS:\n", JSON.stringify(companies, null, 2));
}

main().finally(() => db.$disconnect());
