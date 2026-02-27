"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

export interface GridCardItem {
  title: string;
  description: string;
  frontImage: string;
  alt: string;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  delay?: number;
}

interface GridCardsProps {
  items: GridCardItem[];
  columns?: 1 | 2 | 3 | 4;
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl";
}

export default function GridCards({
  items,
  columns = 3,
  maxWidth = "6xl",
}: GridCardsProps) {
  const gridColsClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  const maxWidthClass = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  return (
    <div
      className={`grid grid-cols-1 ${gridColsClass[columns]} gap-8 ${maxWidthClass[maxWidth]} mx-auto`}
    >
      {items.map((item, index) => (
        <div
          key={item.title}
          className="flex flex-col opacity-0 animate-fade-in-up"
          style={{
            animationDelay: `${item.delay || index * 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          {/* Card con imagen */}
          <div className="relative w-full h-64 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
            <Image
              src={item.frontImage}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {item.subtitle && (
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="text-sm text-white/90 mb-1">
                  {item.subtitle}
                </div>
              </div>
            )}
          </div>

          {/* Contenido debajo del card */}
          <div className="mt-6 text-center px-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                <item.icon
                  className={`w-8 h-8 ${item.iconColor || "text-blue-600"}`}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
