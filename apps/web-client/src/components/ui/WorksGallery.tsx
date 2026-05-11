"use client";

import Image from "next/image";
import { Carousel } from "@/components/ui/Carousel";
import worksGalleryData from "@/data-list/worksGallery.json";

interface WorksGalleryProps {
  type: "individual" | "organization";
  title?: string;
  description?: string;
}

export default function WorksGallery({
  type,
  title,
  description,
}: WorksGalleryProps) {
  // Filtrar imágenes según el tipo
  const filteredGallery = worksGalleryData.filter((img) => img.type === type);

  // Títulos y descripciones por defecto según el tipo
  const defaultContent = {
    individual: {
      title: "Nuestros Trabajos Realizados",
      description:
        "Servicios de reparación, diagnóstico y mantenimiento a domicilio para clientes particulares.",
    },
    organization: {
      title: "Algunos de Nuestros Trabajos",
      description:
        "Hemos realizado servicios de instalación, reparación y mantenimiento de proyectores para empresas e instituciones educativas.",
    },
  };

  const displayTitle = title || defaultContent[type].title;
  const displayDescription = description || defaultContent[type].description;

  // Si no hay imágenes para este tipo, no renderizar nada
  if (filteredGallery.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16 bg-gray-50"
      aria-labelledby="works-gallery-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="works-gallery-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {displayTitle}
          </h2>
          <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-lg">
            {displayDescription}
          </p>
        </div>

        {/* Carrusel de imágenes y videos */}
        <Carousel
          itemsPerView={{ mobile: 1, tablet: 3, desktop: 5 }}
          autoPlay={true}
          autoPlayInterval={4000}
          infinite={true}
          className="px-8"
        >
          {filteredGallery.map((img) => (
            <div
              key={img.src}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              {/* Imagen o Video */}
              <div className="relative w-full aspect-[9/16]">
                {img.isVideo ? (
                  <video
                    src={img.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Información que aparece al hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs bg-primary px-2 py-1 rounded-full inline-block mb-2">
                  {img.category}
                </span>
                <p className="text-sm font-medium line-clamp-2">
                  {img.caption}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
