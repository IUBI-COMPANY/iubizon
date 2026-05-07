import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/quienes-somos",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/productos",
        permanent: true,
      },
      {
        source: "/repairs",
        destination: "/servicios/tecnico",
        permanent: true,
      },
      {
        source: "/reparaciones",
        destination: "/servicios/tecnico",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/contacto",
        permanent: true,
      },
      {
        source: "/contact/success",
        destination: "/contacto/exitoso",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "paperlux.cl" },
      { protocol: "https", hostname: "mediaserver.goepson.com" },
    ],
  },
};

export default nextConfig;
