import React, { useState } from "react";
import Image from "next/image";

interface MediaCarouselInCardProps {
  media: string[];
}

export default function MediaCarouselInCard({
  media,
}: MediaCarouselInCardProps) {
  const [current, setCurrent] = useState(0);
  const isVideo = (src: string) =>
    src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".mov");

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        {isVideo(media[current]) ? (
          <video
            src={media[current]}
            controls
            className="w-full h-full object-cover rounded-2xl"
            style={{ background: "#222f40" }}
          />
        ) : (
          <Image
            src={media[current]}
            width={500}
            height={500}
            alt="Imagen del producto"
            className="w-full h-full object-cover rounded-2xl"
            style={{ background: "#222f40" }}
          />
        )}
      </div>
      {media.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full border-2 ${current === i ? "border-[#f25c05] bg-[#f25c05]" : "border-white bg-white/60"} transition`}
              aria-label={`Ver media ${i + 1}`}
            />
          ))}
        </div>
      )}
      {media.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((current - 1 + media.length) % media.length)
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#222f40] text-white rounded-full p-1 shadow hover:bg-[#f25c05] transition"
            aria-label="Anterior"
          >
            ◀
          </button>
          <button
            onClick={() => setCurrent((current + 1) % media.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#222f40] text-white rounded-full p-1 shadow hover:bg-[#f25c05] transition"
            aria-label="Siguiente"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
}
