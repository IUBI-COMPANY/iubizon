"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface CTASectionProps {
  title: string | ReactNode;
  description: string | ReactNode;
  backgroundImage?: string;
  backgroundAlt?: string;
  primaryButton?: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  className?: string;
  theme?: "light" | "dark";
}

/**
 * Componente reutilizable para Call to Action final
 * Incluye fondo con gradiente oscuro y botones
 */
export default function CTASection({
  title,
  description,
  backgroundImage = "/images/education-projectors.jpg",
  backgroundAlt = "Call to action",
  primaryButton = {
    text: "Contáctanos Hoy",
    href: "/contacto",
  },
  secondaryButton,
  className = "",
  theme = "dark",
}: CTASectionProps) {
  const isDark = theme === "dark";

  return (
    <section
      className={`relative py-20 overflow-hidden ${className} ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-primary/5 via-gray-100 to-secondary/5"
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt={backgroundAlt}
            fill
            sizes="100vw"
            className={`object-cover ${isDark ? "opacity-20" : "opacity-10"}`}
          />
        )}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-gray-900/80 via-gray-800/85 to-gray-900/80"
              : "bg-gradient-to-br from-white/50 via-gray-50/50 to-white/50"
          }`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {typeof title === "string" ? (
          <h2
            className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h2>
        ) : (
          title
        )}

        {typeof description === "string" ? (
          <p
            className={`text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? "text-gray-200" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        ) : (
          description
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton && (
            <Link
              href={primaryButton.href}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 inline-block shadow-lg"
            >
              {primaryButton.text}
            </Link>
          )}

          {secondaryButton && (
            <Link
              href={secondaryButton.href}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-block ${
                isDark
                  ? "bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900"
                  : "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              {secondaryButton.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
