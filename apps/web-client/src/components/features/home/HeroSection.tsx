"use client";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#112237] via-[#1a3a5c] to-[#f25c05] py-12 md:py-20 overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 translate-y-32" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-[#f25c05]/20 rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Encuentra lo que necesitas en iubizon.com
          </h1>
          <p className="text-lg text-white/90">
            La plataforma de productos multimedia para empresas y colegios.
          </p>
        </div>
      </div>
    </section>
  );
};
