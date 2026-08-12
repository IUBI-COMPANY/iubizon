import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@iubizon/db", "@iubizon/email"],
};

export default nextConfig;
