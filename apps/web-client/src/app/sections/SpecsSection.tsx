import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Projector,
  Hand,
  Wifi,
  Lightbulb,
  Zap,
  Clock,
  Cable,
  Target,
  Radio,
  Laptop,
  Smartphone,
  Globe,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { BUNDLE_PRODUCTS_SPECS } from "@/data-list/bundleSpecs";
import { useScrollAnimation, fadeIn } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/Button";

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Zap,
  Clock,
  Cable,
  Target,
  Hand,
  Radio,
  Laptop,
  Wifi,
  Smartphone,
  Globe,
  Bot,
  Projector,
};

export const SpecsSection: React.FC = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({
    threshold: 0.1,
  });

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060e1e] via-black to-[#060e1e] opacity-80"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div
          ref={titleRef}
          style={fadeIn(titleVisible)}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-sfpro font-bold text-white mb-6 tracking-tight">
            Especificaciones
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 font-sfpro font-light max-w-3xl mx-auto">
            Tecnología de vanguardia en cada componente
          </p>
        </div>

        {/* Main Content - 3 Cards Verticales */}
        <div
          ref={contentRef}
          style={fadeIn(contentVisible)}
          className="space-y-8"
        >
          {BUNDLE_PRODUCTS_SPECS.map((product, index) => {
            return (
              <div
                key={product.id}
                className="transform transition-all duration-500"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: contentVisible
                    ? "translateY(0)"
                    : "translateY(30px)",
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                {/* Card Container - Specs a la izquierda, Imagen a la derecha */}
                <div className="w-full rounded-3xl overflow-hidden border-2 border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex flex-col lg:flex-row min-h-[500px]">
                    {/* Left Side - Especificaciones (50%) */}
                    <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                      {/* Header */}
                      <div className="mb-8">
                        <h3 className="text-2xl lg:text-3xl font-sfpro font-bold text-white">
                          {product.name}
                        </h3>
                      </div>

                      {/* Specs List */}
                      <div className="space-y-4">
                        {product.specs.map((spec, i) => {
                          const SpecIcon = spec.iconName
                            ? iconMap[spec.iconName]
                            : null;

                          return (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/5 transition-all"
                            >
                              {SpecIcon && (
                                <div className="shrink-0">
                                  <SpecIcon className="w-5 h-5 text-primary mt-0.5" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-sfpro font-semibold text-gray-400 mb-1">
                                  {spec.label}
                                </p>
                                <p className="text-base font-sfpro font-medium text-white transition-colors">
                                  {spec.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Side - Imagen Grande (50%) */}
                    <div className="relative flex-1 bg-gradient-to-br from-black/50 to-transparent flex items-center justify-center p-8">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl"></div>

                      {/* Product Image */}
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={600}
                          height={450}
                          className="w-full h-full max-h-[450px] object-contain drop-shadow-[0_0_40px_rgba(242,95,12,0.3)]"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Ver Ficha Técnica */}
        <div className="flex justify-center mt-12">
          <Link href="/fichas-tecnicas">
            <Button
              variant="secondary"
              size="lg"
              styleVariant="solid"
              className="font-sfpro font-semibold"
            >
              Ver ficha técnica
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
