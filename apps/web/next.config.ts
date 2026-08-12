import type { NextConfig } from "next";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  transpilePackages: ["@iubizon/db", "@iubizon/email"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/search",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname || "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
