'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from 'lucide-react';

import 'swiper/swiper-bundle.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';

interface ProductImage {
  id: string;
  url: string;
  position?: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#f8fafc] rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e2e8f0] rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Expand className="w-6 h-6 text-[#94a3b8]" />
          </div>
          <p className="text-sm text-[#94a3b8]">Sin imágenes</p>
        </div>
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div className="space-y-3">
      {/* Main Gallery */}
      <div className="relative group/main">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation={{
            prevEl: '.gallery-prev',
            nextEl: '.gallery-next',
          }}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="aspect-square rounded-xl overflow-hidden bg-[#f8fafc]"
        >
          {sortedImages.map((img, idx) => (
            <SwiperSlide key={img.id || idx}>
              <div className="relative w-full h-full bg-[#f8fafc]">
                <Image
                  src={img.url}
                  alt={`${title} - Imagen ${idx + 1}`}
                  fill
                  className="object-contain"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button className="gallery-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full p-2 hover:bg-white transition-all opacity-0 group-hover/main:opacity-100">
              <ChevronLeft className="w-5 h-5 text-[#112237]" />
            </button>
            <button className="gallery-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full p-2 hover:bg-white transition-all opacity-0 group-hover/main:opacity-100">
              <ChevronRight className="w-5 h-5 text-[#112237]" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full p-2 hover:bg-white transition-all opacity-0 group-hover/main:opacity-100"
        >
          <Expand className="w-4 h-4 text-[#112237]" />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
          <ZoomIn className="w-3 h-3" />
          {activeIndex + 1} / {sortedImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          watchSlidesProgress={true}
          slidesPerView={Math.min(sortedImages.length, 6)}
          spaceBetween={8}
          className="h-20"
        >
          {sortedImages.map((img, idx) => (
            <SwiperSlide key={img.id || idx}>
              <button
                className={`relative w-full h-full rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex
                    ? 'border-[#f25c05] ring-2 ring-[#f25c05]/30'
                    : 'border-[#e2e8f0] hover:border-[#f25c05]/50'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${title} - Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
                {idx === 0 && (
                  <span className="absolute top-0.5 left-0.5 bg-[#f25c05] text-white text-[9px] font-medium px-1 py-0 leading-4 rounded">
                    Principal
                  </span>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full z-50 transition-colors"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              initialSlide={activeIndex}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full h-full"
            >
              {sortedImages.map((img, idx) => (
                <SwiperSlide key={img.id || idx}>
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="relative w-full h-full max-w-4xl">
                      <Image
                        src={img.url}
                        alt={`${title} - Imagen ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={idx === activeIndex}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              Imagen {activeIndex + 1} de {sortedImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}