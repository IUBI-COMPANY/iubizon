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

export function getCategoryIcon(slug: string): LucideIcon {
  return iconMap[slug] ?? LayoutGrid;
}
