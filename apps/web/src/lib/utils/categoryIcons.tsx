import {
  Laptop,
  Projector,
  Smartphone,
  Cpu,
  LayoutGrid,
  MoreHorizontal,
  Headphones,
  Monitor,
  Volume2,
  Armchair,
  Wifi,
  Pencil,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  proyectores: Projector,
  laptops: Laptop,
  "pantallas-interactivas": Monitor,
  moviles: Smartphone,
  audio: Volume2,
  mobiliario: Armchair,
  redes: Wifi,
  electronica: Cpu,
  accesorios: Headphones,
  "utiles-suministros": Pencil,
  otros: MoreHorizontal,
};

const categoryIconImages: Record<string, string> = {
  proyectores: "/icons/categories/proyectores.webp",
  laptops: "/icons/categories/laptops.webp",
  "pantallas-interactivas": "/icons/categories/pantallas-interactivas.webp",
  moviles: "/icons/categories/moviles.webp",
  audio: "/icons/categories/audio.webp",
  mobiliario: "/icons/categories/mobiliario.webp",
  robot: "/icons/categories/robot.webp",
};

export function getCategoryIcon(slug: string): LucideIcon {
  return iconMap[slug] ?? LayoutGrid;
}

export function getCategoryIconImage(slug: string): string | null {
  return categoryIconImages[slug] ?? null;
}
