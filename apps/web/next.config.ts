import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 1. Permite a Next.js transpilar el paquete local de la base de datos
  transpilePackages: ["@iubizon/db"],

  // 2. Define la raíz del monorepo para el rastreo de archivos y dependencias elevadas
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
};

export default nextConfig;
