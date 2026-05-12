import {
  Laptop,
  Projector,
  Smartphone,
  Gamepad2,
  Tv,
  Cpu,
  LayoutGrid,
  MoreHorizontal,
  Headphones,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  laptops: Laptop,
  proyectores: Projector,
  moviles: Smartphone,
  consolas: Gamepad2,
  'tv-audio': Tv,
  electronica: Cpu,
  accesorios: Headphones,
  otros: MoreHorizontal,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return iconMap[slug] ?? LayoutGrid;
}