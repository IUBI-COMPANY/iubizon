import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation, fadeIn } from "@/hooks/useScrollAnimation";
import { ChevronDown } from "lucide-react";
import BundleTitle from "@/components/bundle-interactivo/BundleTitle";
import { Button } from "@/components/ui/Button";

export const HeroSection: React.FC = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: productsRef, isVisible: productsVisible } = useScrollAnimation({
    threshold: 0.2,
  });

  const scrollToPrices = () => {
    const tutorialSection = document.getElementById("tutorial-section");
    tutorialSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center bg-bg-dark overflow-hidden pt-16 md:pt-0">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Bundle Logo - Componente de texto */}
        <div
          ref={titleRef}
          style={fadeIn(titleVisible)}
          className="text-center mt-8 sm:mt-6 md:mt-4 mb-6 sm:mb-8 md:mb-12"
        >
          <BundleTitle />

          {/* CTA Button */}
          <div className="mt-8 flex justify-center">
            <Link href="/productos/bundle-interactivo">
              <Button
                variant="primary"
                size="lg"
                styleVariant="solid"
                className="group relative overflow-hidden bg-primary hover:bg-primary-hover text-white font-sfpro font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_40px_rgba(242,95,12,0.5)] hover:shadow-[0_0_60px_rgba(242,95,12,0.7)] transition-all duration-300 hover:scale-105"
              >
                Realizar mi pedido
              </Button>
            </Link>
          </div>
        </div>

        {/* Bundle Pack Images - 3 productos por separado */}
        <div
          ref={productsRef}
          style={fadeIn(productsVisible, 0.2)}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 sm:gap-8 md:gap-3 lg:gap-4 max-w-6xl mx-auto px-2 sm:px-4">
            {/* Touch Interactivo */}
            <div className="flex items-center justify-center w-full md:w-auto mb-0 md:mb-8 lg:mb-12">
              <Image
                src="/productos/bundle/touch.png"
                alt="Touch Interactivo"
                width={200}
                height={200}
                className="w-full max-w-[160px] sm:max-w-[180px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[200px] h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* Proyector - Más grande */}
            <div className="flex items-center justify-center w-full md:w-auto">
              <Image
                src="/productos/bundle/upside109W.png"
                alt="Proyector Epson 109W"
                width={550}
                height={400}
                className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[380px] lg:max-w-[480px] xl:max-w-[550px] h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* MiraCast - Más pequeño */}
            <div className="flex items-center justify-center w-full md:w-auto mb-0 md:mb-8 lg:mb-12">
              <Image
                src="/productos/bundle/miracast.png"
                alt="MiraCast Dongle"
                width={150}
                height={150}
                className="w-full max-w-[110px] sm:max-w-[130px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[150px] h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white font-sfpro font-light leading-relaxed px-4">
            Descubre lo que puedes hacer
          </p>
        </div>

        {/* Scroll Down Button */}
        <div className="flex justify-center mb-6 sm:mb-8 md:mb-0">
          <button
            onClick={scrollToPrices}
            className="group relative flex flex-col items-center gap-2 md:gap-3 cursor-pointer hover:scale-110 transition-transform duration-300"
            aria-label="Scroll to prices"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent blur-xl animate-pulse"></div>
              <ChevronDown className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary animate-bounce relative z-10" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
