import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface MediaItem {
  type: string;
  src: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  colors: {
    primary: string;
    primary2: string;
    secondary: string;
    tertiary: string;
    text: string;
  };
}

export default function MediaCarousel({ media, colors }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
    loop: true,
  });

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-full max-w-2xl h-80 md:h-[34rem] flex items-center justify-center rounded-2xl overflow-hidden shadow-lg relative"
        style={{ background: colors.tertiary }}
      >
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {media.map((m, i) => (
            <div
              className="keen-slider__slide flex items-center justify-center w-full h-full"
              key={i}
            >
              {m.type === "image" ? (
                <img
                  src={m.src}
                  alt="Imagen del producto"
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ background: colors.tertiary }}
                />
              ) : (
                <video
                  src={m.src}
                  controls
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ background: colors.tertiary }}
                />
              )}
            </div>
          ))}
        </div>
        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => slider.current?.prev()}
              className="absolute w-[3em] h-[3em] left-4 top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow hover:bg-[#f25c05] transition z-10 cursor-pointer"
              aria-label="Anterior"
              style={{ border: `2px solid ${colors.primary}` }}
            >
              ◀
            </button>
            <button
              onClick={() => slider.current?.next()}
              className="absolute w-[3em] h-[3em] right-4 top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow hover:bg-[#f25c05] transition z-10 cursor-pointer"
              aria-label="Siguiente"
              style={{ border: `2px solid ${colors.primary}` }}
            >
              ▶
            </button>
          </>
        )}
      </div>
      {/* Dots navigation */}
      {media.length > 1 && (
        <div className="mt-4 flex gap-2 justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => slider.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                current === idx
                  ? "border-[#f25c05] bg-[#f25c05]"
                  : "border-gray-800 bg-white"
              } transition`}
              aria-label={`Ver media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
