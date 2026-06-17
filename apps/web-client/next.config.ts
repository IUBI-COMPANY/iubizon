import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  trailingSlash: false,
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
      {
        source: "/garantia",
        destination: "/legal/garantia",
        permanent: true,
      },
      {
        source: "/politica-de-devoluciones-y-cambios",
        destination: "/legal/politica-de-devoluciones-y-cambios",
        permanent: true,
      },
      {
        source: "/codigo-de-etica",
        destination: "/legal/codigo-de-etica",
        permanent: true,
      },
      {
        source: "/politica-antisoborno-anticorrupcion",
        destination: "/legal/politica-antisoborno-anticorrupcion",
        permanent: true,
      },
      {
        source: "/manual-prevencion-soborno",
        destination: "/legal/manual-prevencion-soborno",
        permanent: true,
      },
      {
        source: "/procedimiento-denuncias",
        destination: "/legal/procedimiento-denuncias",
        permanent: true,
      },
      {
        source: "/acta-designacion-oficial-cumplimiento",
        destination: "/legal/acta-designacion-oficial-cumplimiento",
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
