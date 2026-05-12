import {
  Laptop,
  Projector,
  Smartphone,
  Gamepad2,
  Tv,
  Cpu,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  laptops: Laptop,
  proyectores: Projector,
  moviles: Smartphone,
  consolas: Gamepad2,
  'tv-audio': Tv,
  electronica: Cpu,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return iconMap[slug] ?? LayoutGrid;
}