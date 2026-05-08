'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#f8fafc] rounded-xl flex items-center justify-center text-6xl">
        📦
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div className="space-y-4">
      {/* Main Gallery */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          pagination={{
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} bg-[#f25c05] opacity-50 hover:opacity-100"></span>`;
            },
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="aspect-square rounded-xl overflow-hidden"
        >
          {sortedImages.map((img, idx) => (
            <SwiperSlide key={img.id || idx}>
              <div className="relative w-full h-full bg-[#f8fafc]">
                <Image
                  src={img.url}
                  alt={`${title} - Imagen ${idx + 1}`}
                  fill
                  className="object-contain cursor-zoom-in"
                  priority={idx === 0}
                  onClick={() => setIsZoomed(true)}
                />
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
                  <ZoomIn className="w-3 h-3" />
                  Click para zoom
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5 text-[#112237]" />
            </button>
            <button className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-[#112237]" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Expand className="w-4 h-4 text-[#112237]" />
        </button>

        {/* Pagination Dots */}
        {sortedImages.length > 1 && (
          <div className="swiper-pagination absolute bottom-3 left-1/2 -translate-x-1/2 z-10" />
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          watchSlidesProgress={true}
          slidesPerView={6}
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
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-[#f25c05] text-white text-[10px] px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-50"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={sortedImages[activeIndex].url}
                alt={`${title} - Zoom`}
                fill
                className="object-contain"
              />
            </motion.div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              Imagen {activeIndex + 1} de {sortedImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-50"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination
              initialSlide={activeIndex}
              className="w-full h-full"
            >
              {sortedImages.map((img, idx) => (
                <SwiperSlide key={img.id || idx}>
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <Image
                      src={img.url}
                      alt={`${title} - Imagen ${idx + 1}`}
                      fill
                      className="object-contain max-h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}