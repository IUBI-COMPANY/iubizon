"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import BundleTitle from "@/components/bundle-interactivo/BundleTitle";
import { Button } from "@/components/ui/Button";

/**
 * HERO PRO (Apple-like)
 * - Background: vignette + soft auroras + noise
 * - Parallax: mouse (desktop) + scroll depth
 * - Product float: subtle y loop
 * - CTA: premium shine + gradient stroke
 * - Decorative "signal arcs" around left/right items
 * - Keeps your title component as-is
 *
 * Notes:
 * - Requires framer-motion
 * - Uses ONLY local images you already have
 */
export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement | null>(null);

  const scrollToPrices = () => {
    const tutorialSection = document.getElementById("transform-section");
    tutorialSection?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll depth (subtle)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Mouse parallax (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 80, damping: 18, mass: 0.4 });
  const smy = useSpring(my, { stiffness: 80, damping: 18, mass: 0.4 });

  const onMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // Parallax transforms (mouse + scroll)
  const touchX = useTransform(smx, [-0.5, 0.5], [-14, 14]);
  const touchYMouse = useTransform(smy, [-0.5, 0.5], [-10, 10]);
  const touchYScroll = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const touchY = useTransform(
    [touchYMouse, touchYScroll],
    (values: number[]) => (values[0] ?? 0) + (values[1] ?? 0),
  );

  const projX = useTransform(smx, [-0.5, 0.5], [-18, 18]);
  const projYMouse = useTransform(smy, [-0.5, 0.5], [-12, 12]);
  const projYScroll = useTransform(scrollYProgress, [0, 1], [0, 26]);
  const projY = useTransform(
    [projYMouse, projYScroll],
    (values: number[]) => (values[0] ?? 0) + (values[1] ?? 0),
  );

  const wifiX = useTransform(smx, [-0.5, 0.5], [-12, 12]);
  const wifiYMouse = useTransform(smy, [-0.5, 0.5], [-9, 9]);
  const wifiYScroll = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const wifiY = useTransform(
    [wifiYMouse, wifiYScroll],
    (values: number[]) => (values[0] ?? 0) + (values[1] ?? 0),
  );

  // Background aurora follows mouse slightly
  const auroraX = useTransform(smx, [-0.5, 0.5], [-40, 40]);
  const auroraY = useTransform(smy, [-0.5, 0.5], [-30, 30]);
  const auroraTransform = useMotionTemplate`translate3d(${auroraX}px, ${auroraY}px, 0)`;

  return (
    <section
      ref={heroRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative w-full min-h-screen flex flex-col justify-center bg-bg-dark overflow-hidden pt-16 md:pt-0"
    >
      {/* ===== Background PRO ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette */}
        <div className="absolute inset-0" />

        {/* Soft aurora layer (moves with mouse) */}
        <motion.div
          style={{ transform: auroraTransform }}
          className="absolute inset-[-20%] opacity-80"
        >
          <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[980px] h-[540px] rounded-full bg-primary/18 blur-[100px]" />
          <div className="absolute left-[12%] top-[18%] w-[360px] h-[360px] rounded-full bg-white/7 blur-[90px]" />
          <div className="absolute right-[10%] bottom-[10%] w-[420px] h-[420px] rounded-full bg-primary/12 blur-[110px]" />
        </motion.div>

        {/* Super subtle grid/noise */}
        <div className="absolute inset-0 opacity-[0.035] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(242,95,12,0.10),transparent_40%),radial-gradient(circle_at_55%_90%,rgba(255,255,255,0.06),transparent_42%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center py-8 sm:py-12 md:py-16 lg:py-20">
        {/* ===== Title + CTA ===== */}
        <div className="text-center mt-8 sm:mt-6 md:mt-4 mb-6 sm:mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <BundleTitle />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="mt-8 flex justify-center gap-4"
          >
            {/* Realizar mi pedido button */}
            <Link href="/productos/bundle-interactivo" className="inline-block">
              {/* Premium button wrapper with gradient stroke */}
              <div className="relative rounded-full p-[1px] bg-[linear-gradient(90deg,rgba(242,95,12,0.65),rgba(255,255,255,0.16),rgba(242,95,12,0.55))] shadow-[0_0_60px_rgba(242,95,12,0.25)]">
                <Button
                  variant="primary"
                  size="lg"
                  styleVariant="solid"
                  className="group relative overflow-hidden bg-primary hover:bg-primary-hover text-white font-sfpro font-bold text-lg px-8 py-4 rounded-full
                  shadow-[0_0_40px_rgba(242,95,12,0.5)] hover:shadow-[0_0_85px_rgba(242,95,12,0.7)]
                  transition-all duration-300 hover:scale-[1.03]"
                >
                  {/* Shine sweep */}
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 bg-white/25 blur-md rotate-12 translate-x-[-120%] group-hover:translate-x-[260%] transition-transform duration-700" />
                  {/* Inner glow */}
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_55%)] opacity-80" />
                  <span className="relative">Realizar mi pedido</span>
                </Button>
              </div>
            </Link>

            {/* Solicitar Demo button - Brand colors style */}
            <Link href="/demo" className="inline-block">
              <div className="relative rounded-full p-px bg-[linear-gradient(135deg,rgba(242,95,12,0.8),rgba(255,255,255,0.25),rgba(242,95,12,0.6))] shadow-[0_0_60px_rgba(242,95,12,0.4)]">
                <Button
                  variant="secondary"
                  size="lg"
                  styleVariant="outline"
                  className="group relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-orange-700/5 hover:from-primary/30 hover:via-primary/20 hover:to-orange-700/10 text-white font-sfpro font-bold text-lg px-8 py-4 rounded-full
                  border border-primary/50 hover:border-primary/70 backdrop-blur-md
                  shadow-[0_0_50px_rgba(242,95,12,0.25)] hover:shadow-[0_0_100px_rgba(242,95,12,0.5)]
                  transition-all duration-300 hover:scale-[1.05]"
                >
                  {/* Shine sweep diagonal */}
                  <span className="pointer-events-none absolute -top-1 -right-1 h-full w-1/2 bg-gradient-to-l from-white/35 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Bottom orange glow */}
                  <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 bg-primary/30 blur-2xl rounded-full" />
                  <span className="relative flex items-center gap-2">
                    Solicitar Demo
                  </span>
                </Button>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ===== Products / Packshot ===== */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-6 sm:gap-8 md:gap-3 lg:gap-4 max-w-6xl mx-auto px-2 sm:px-4">
            {/* “Stage” glow under pack */}
            <div className="pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 w-[min(980px,98%)] h-[180px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,95,12,0.22),rgba(242,95,12,0)_62%)] blur-2xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_58%)] blur-3xl opacity-40" />
            </div>

            {/* Touch (left) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.18,
              }}
              style={{ x: touchX, y: touchY }}
              className="relative flex items-center justify-center w-full md:w-auto mb-0 md:mb-8 lg:mb-12"
            >
              {/* Signal arc */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-8 -bottom-8 hidden md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="h-24 w-24 rounded-full border border-primary/40 blur-[0.2px]" />
                <div className="absolute left-4 top-4 h-16 w-16 rounded-full border border-primary/30" />
                <div className="absolute left-8 top-8 h-8 w-8 rounded-full border border-primary/25" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="opacity-[0.94]"
              >
                <Image
                  src="/productos/bundle/touch.png"
                  alt="Touch Interactivo"
                  width={200}
                  height={200}
                  className="w-full max-w-[160px] sm:max-w-[180px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[200px] h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Projector (center / hero) */}
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.98, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.08,
              }}
              style={{ x: projX, y: projY }}
              className="relative flex items-center justify-center w-full md:w-auto"
            >
              {/* Rim light behind projector */}
              <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                <div className="w-[520px] h-[260px] rounded-full bg-primary/10 blur-[70px]" />
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/productos/bundle/upside109W.png"
                  alt="Proyector Epson 109W"
                  width={550}
                  height={400}
                  className="w-[32em] max-w-[280px] sm:max-w-[350px] md:max-w-[380px] lg:max-w-[480px] xl:max-w-[550px] h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* WiFi (right) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
              style={{ x: wifiX, y: wifiY }}
              className="relative flex items-center justify-center w-full md:w-auto mb-0 md:mb-8 lg:mb-12"
            >
              {/* WiFi waves */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-10 hidden md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.52, duration: 0.6 }}
              >
                <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full border border-sky-300/35" />
                <div className="absolute right-4 bottom-4 h-16 w-16 rounded-full border border-sky-300/25" />
                <div className="absolute right-8 bottom-8 h-8 w-8 rounded-full border border-sky-300/20" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="opacity-[0.94]"
              >
                <Image
                  src="/productos/bundle/adaptador-wifi.png"
                  alt="Adaptador Inalámbrico WiFi"
                  width={150}
                  height={150}
                  className="w-full max-w-[110px] sm:max-w-[130px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[150px] h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
          className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white font-sfpro font-light leading-relaxed px-4">
            Descubre lo que puedes hacer
          </p>
        </motion.div>

        {/* Scroll Down Button */}
        <div className="flex justify-center mb-6 sm:mb-8 md:mb-0">
          <button
            onClick={scrollToPrices}
            className="group relative flex flex-col items-center gap-2 md:gap-3 cursor-pointer hover:scale-110 transition-transform duration-300"
            aria-label="Scroll to prices"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/20 to-transparent blur-xl animate-pulse" />
              <ChevronDown className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary animate-bounce relative z-10" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
