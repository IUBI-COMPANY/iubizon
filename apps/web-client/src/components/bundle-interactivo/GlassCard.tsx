import React from "react";
import { LucideIcon } from "lucide-react";

interface GlassCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  icon: Icon,
  title,
  description,
  image,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(242,95,12,0.15)] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon or Image */}
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        )}

        {image && (
          <div className="mb-6 -mx-8 -mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
    </div>
  );
};
