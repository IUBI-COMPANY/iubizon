import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Product } from "@/data-list/products";
import Image from "next/image";

interface Props {
  product: Product;
}

export default function MediaCarousel({ product }: Props) {
  const [current, setCurrent] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
    loop: true,
  });

  const { media } = product;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoPaused] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    media.forEach((m, i) => {
      if (m.type === "video" && videoRefs.current[i]) {
        if (i === current && !videoPaused[i]) {
          videoRefs.current[i]?.play();
        } else {
          videoRefs.current[i]?.pause();
        }
      }
    });
  }, [current, media, videoPaused]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl h-auto md:h-[40rem] flex items-center justify-center rounded-3xl overflow-hidden shadow-lg relative">
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {media.map((m, i) => (
            <div
              className="keen-slider__slide flex items-center justify-center w-full h-full"
              key={i}
            >
              {m.type === "image" ? (
                <Image
                  src={m.src}
                  width={1000}
                  height={1000}
                  alt="Imagen del producto"
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center relative">
                  <div
                    style={{
                      background: "url(./images/education-projectors.jpg)",
                      backgroundSize: "cover",
                      filter: "blur(8px)",
                    }}
                    className="absolute inset-0"
                  ></div>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={m.src}
                    width={1000}
                    height={1000}
                    controls
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {media.length > 1 && (
          <>
            <button
              onClick={() => slider.current?.prev()}
              className="absolute w-[3em] h-[3em] left-4 top-1/2 -translate-y-1/2 text-black/60 rounded-full p-2 shadow hover:bg-[#f25c05] transition z-10 cursor-pointer border-solid border-2 border-primary"
              aria-label="Anterior"
            >
              ◀
            </button>
            <button
              onClick={() => slider.current?.next()}
              className="absolute w-[3em] h-[3em] right-4 top-1/2 -translate-y-1/2 text-black/60 rounded-full p-2 shadow hover:bg-[#f25c05] transition z-10 cursor-pointer border-solid border-2 border-primary"
              aria-label="Siguiente"
            >
              ▶
            </button>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-4 flex gap-2 justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => slider.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                current === idx
                  ? "border-primary/100 bg-primary/80"
                  : "border-secondary bg-white"
              } transition`}
              aria-label={`Ver media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
