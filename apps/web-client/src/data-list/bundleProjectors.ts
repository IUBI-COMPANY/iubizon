import { ProjectorOption } from "@/types/bundleTypes";

export const PROJECTORS: ProjectorOption[] = [
  {
    id: "epson-109w",
    name: "Epson PowerLite 109W",
    tier: "Gama Media",
    description:
      "Proyector de alta luminosidad ideal para presentaciones profesionales y educativas",
    image: "/images/upside109W.png",
    price: 1800,
    specs: [
      "4000 lúmenes de luminosidad",
      "Resolución WXGA (1280x800)",
      "Tecnología 3LCD",
      "Conectividad HDMI, VGA, USB",
    ],
  },
  {
    id: "epson-fh06",
    name: "Epson PowerLite FH06",
    tier: "Gama Alta",
    description:
      "Proyector de alta definición con tecnología láser para instalaciones premium",
    image: "/images/upside109W.png",
    price: 2500,
    specs: [
      "7000 lúmenes de luminosidad",
      "Resolución Full HD (1920x1080)",
      "Tecnología láser de larga duración",
      "Conectividad avanzada inalámbrica",
    ],
  },
  {
    id: "epson-l200w",
    name: "Epson PowerLite L200W",
    tier: "Gama Baja",
    description:
      "Proyector compacto y económico para aulas y oficinas pequeñas",
    image: "/images/upside109W.png",
    price: 1200,
    specs: [
      "3200 lúmenes de luminosidad",
      "Resolución WXGA (1280x800)",
      "Tecnología 3LCD",
      "Portátil y fácil de instalar",
    ],
  },
];

// Precio base del bundle (Touch + MiraCast)
export const BASE_BUNDLE_PRICE = 350;

// Función helper para calcular precio total
export const calculateBundlePrice = (projectorId: string): number => {
  const projector = PROJECTORS.find((p) => p.id === projectorId);
  return projector ? projector.price + BASE_BUNDLE_PRICE : BASE_BUNDLE_PRICE;
};
