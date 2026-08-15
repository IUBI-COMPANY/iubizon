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
  Printer,
  Usb,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "proyectores": Projector,
  "laptops": Laptop,
  "pantallas-interactivas": Monitor,
  "moviles": Smartphone,
  "audio": Volume2,
  "mobiliario": Armchair,
  "redes": Wifi,
  "electronica": Cpu,
  "accesorios": Headphones,
  "utiles-suministros": Pencil,
  "otros": MoreHorizontal,
  "impresoras": Printer,
  "conectividad": Wifi,
};

const categoryIconImages: Record<string, string> = {
  "proyectores": "/icons/categories/projector.webp",
  "laptops": "/icons/categories/laptop.webp",
  "pantallas-interactivas": "/icons/categories/screens.webp",
  "moviles": "/icons/categories/mobile.webp",
  "audio": "/icons/categories/audio.webp",
  "mobiliario": "/icons/categories/furniture.webp",
  "redes": "/icons/categories/network.webp",
  "electronica": "/icons/categories/printer.webp",
  "accesorios": "/icons/categories/usb.webp",
  "utiles-suministros": "/icons/categories/supplies.webp",
  "otros": "/icons/categories/others.webp",
  "impresoras": "/icons/categories/printer.webp",
  "conectividad": "/icons/categories/network.webp",
  "robot": "/icons/categories/robot.webp",
};

export function getCategoryIcon(slug: string): LucideIcon {
  return iconMap[slug] ?? LayoutGrid;
}

export function getCategoryIconImage(slug: string): string | null {
  return categoryIconImages[slug] ?? null;
}
