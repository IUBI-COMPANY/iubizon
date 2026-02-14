import React from "react";
import {
  Cable,
  MousePointerClick,
  Rocket,
  Hand,
  Cast,
  Menu,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Wifi,
  type LucideIcon,
} from "lucide-react";

// Mapeo de iconos de Material Symbols a Lucide React
const iconMap: Record<string, LucideIcon> = {
  cable: Cable,
  ads_click: MousePointerClick,
  rocket_launch: Rocket,
  touch_app: Hand,
  cast: Cast,
  menu: Menu,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  download: Download,
  settings: Settings,
  wifi: Wifi,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", size }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <IconComponent className={className} size={size} />;
};
