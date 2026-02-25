import React, { forwardRef } from "react";

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onLoadedData?: () => void;
}

export const Video = forwardRef<HTMLVideoElement, VideoProps>(
  (
    {
      src,
      poster,
      className = "",
      autoPlay = true,
      muted = true,
      loop = true,
      controls = false,
      playsInline = true,
      preload = "metadata",
      objectFit = "cover",
      onLoadedData,
      ...rest
    },
    ref,
  ) => {
    const objectFitClass = `object-${objectFit}`;

    return (
      <video
        ref={ref}
        className={`${objectFitClass} ${className}`}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        onLoadedData={onLoadedData}
        {...rest}
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
    );
  },
);

Video.displayName = "Video";
