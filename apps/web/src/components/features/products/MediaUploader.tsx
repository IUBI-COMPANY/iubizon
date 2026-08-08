"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ImagePlus,
  Video,
  Trash2,
  GripVertical,
  Star,
  Film,
  Play,
  Maximize2,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/context/ToastContext";

export interface UploadedImage {
  id: string;
  url: string;
  position: number;
  file?: File;
  preview?: string;
  uploading?: boolean;
}

interface SortableImageProps {
  image: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
  isMain: boolean;
}

function SortableImageItem({
  image,
  index,
  onRemove,
  isMain,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-xl overflow-hidden border bg-[#f8fafc] group select-none ${
        isDragging
          ? "opacity-50 ring-2 ring-[#f25c05] shadow-lg scale-105"
          : "border-[#e2e8f0]"
      }`}
    >
      <Image
        src={image.preview || image.url}
        alt={`Foto ${index + 1}`}
        fill
        className="object-cover"
        sizes="150px"
        unoptimized={Boolean(image.preview)}
      />

      {/* Badges */}
      {isMain && (
        <span className="absolute top-1.5 left-1.5 bg-[#f25c05] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-current" />
          Portada
        </span>
      )}

      {/* Actions & Drag Handle */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1.5 rounded-lg bg-white/80 text-[#112237] hover:bg-white transition-colors cursor-grab active:cursor-grabbing"
          title="Reordenar foto"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors shadow-xs"
          title="Eliminar foto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface VideoTileItemProps {
  preview: string;
  onRemove: () => void;
  onOpenModal: () => void;
}

function VideoTileItem({ preview, onRemove, onOpenModal }: VideoTileItemProps) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-[#e2e8f0] bg-black group select-none shadow-xs">
      <video
        src={preview}
        muted
        playsInline
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />

      {/* Badge Video */}
      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
        <Film className="w-2.5 h-2.5 text-[#f25c05]" />
        Video
      </span>

      {/* Center Play Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center border border-white/20">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Hover Actions Bar */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
        <button
          type="button"
          onClick={onOpenModal}
          className="p-2 rounded-lg bg-white/90 text-[#112237] hover:bg-white hover:scale-105 transition-all shadow-md flex items-center gap-1 text-xs font-semibold"
          title="Reproducir / Maximizar"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#f25c05]" />
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 hover:scale-105 transition-all shadow-md"
          title="Eliminar video"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export interface MediaUploaderProps {
  mode?: "images-only" | "video-only" | "both";
  title?: string;
  subtitle?: string;
  maxImages?: number;
  maxVideoSizeMB?: number;
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  videoPreview?: string | null;
  onVideoChange?: (file: File | null, preview: string | null) => void;
}

export function MediaUploader({
  mode = "both",
  title,
  subtitle,
  maxImages = 10,
  maxVideoSizeMB = 25,
  images,
  onImagesChange,
  videoPreview,
  onVideoChange,
}: MediaUploaderProps) {
  const toast = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const acceptTypes = React.useMemo(() => {
    if (mode === "images-only") return "image/jpeg,image/png,image/webp";
    if (mode === "video-only") return "video/mp4,video/webm,video/quicktime";
    return "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";
  }, [mode]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileList = Array.from(files);
      const newImages: UploadedImage[] = [];
      let newVideoFile: File | null = null;
      let newVideoPreview: string | null = null;

      fileList.forEach((file) => {
        if (file.type.startsWith("image/")) {
          if (mode === "video-only") {
            toast.error(
              "Este campo solo admite videos.",
              "Formato no permitido",
            );
            return;
          }
          if (images.length + newImages.length >= maxImages) {
            toast.error(
              `Solo puedes subir hasta ${maxImages} imágenes.`,
              "Límite alcanzado",
            );
            return;
          }
          newImages.push({
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: "",
            position: images.length + newImages.length,
            file,
            preview: URL.createObjectURL(file),
            uploading: false,
          });
        } else if (file.type.startsWith("video/")) {
          if (mode === "images-only") {
            toast.error(
              "Este campo solo admite imágenes.",
              "Formato no permitido",
            );
            return;
          }
          if (file.size > maxVideoSizeMB * 1024 * 1024) {
            toast.error(
              `El video no debe superar los ${maxVideoSizeMB} MB.`,
              "Video pesado",
            );
            return;
          }
          newVideoFile = file;
          newVideoPreview = URL.createObjectURL(file);
        }
      });

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
      if (newVideoFile && onVideoChange) {
        onVideoChange(newVideoFile, newVideoPreview);
        toast.success("Video cargado correctamente.", "¡Video listo!");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [images, maxImages, maxVideoSizeMB, mode, onImagesChange, onVideoChange],
  );

  const removeImage = (id: string) => {
    const updated = images.filter((img) => {
      if (img.id === id && img.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return img.id !== id;
    });
    onImagesChange(updated);
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    if (onVideoChange) onVideoChange(null, null);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);
      onImagesChange(arrayMove(images, oldIndex, newIndex));
    },
    [images, onImagesChange],
  );

  const defaultTitle =
    title ||
    (mode === "both"
      ? "Fotos y Video del Producto"
      : mode === "images-only"
        ? "Fotos del Producto"
        : "Video del Producto");

  const defaultSubtitle =
    subtitle ||
    (mode === "both"
      ? "Arrastra fotos y video aquí. La primera foto será la imagen principal."
      : mode === "images-only"
        ? "Arrastra fotos para reordenar. La primera foto será la portada principal."
        : "Sube un video corto (15-30s) para mostrar tu producto en funcionamiento.");

  const hasMedia = images.length > 0 || Boolean(videoPreview);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#112237]">
              {defaultTitle}
            </h2>
            {mode === "both" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f25c05]/10 text-[#f25c05]">
                Fotos + Video
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">{defaultSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          {mode !== "video-only" && (
            <span>
              Fotos:{" "}
              <strong className="text-[#112237]">
                {images.length}/{maxImages}
              </strong>
            </span>
          )}
          {mode !== "images-only" && Boolean(videoPreview) && (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold text-[10px]">
              ✓ Video incluido
            </span>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        multiple={mode !== "video-only"}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Full Dropzone Area when no media uploaded */}
      {!hasMedia ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${
            isDragOver
              ? "border-[#f25c05] bg-[#f25c05]/10 scale-[1.01]"
              : "border-[#e2e8f0] hover:border-[#f25c05] hover:bg-[#f8fafc]"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mb-3 shadow-xs">
            {mode === "video-only" ? (
              <Video className="w-6 h-6 text-[#f25c05]" />
            ) : (
              <ImagePlus className="w-6 h-6 text-[#f25c05]" />
            )}
          </div>
          <p className="text-sm font-semibold text-[#112237] mb-1">
            Arrastra tus archivos aquí o{" "}
            <span className="text-[#f25c05] underline">
              haz clic para buscar
            </span>
          </p>
          <p className="text-xs text-[#94a3b8]">
            {mode === "both"
              ? "Admite imágenes (PNG, JPG, WEBP) y video corto (MP4, WEBM, MOV hasta 25MB)"
              : mode === "images-only"
                ? `Sube hasta ${maxImages} fotos`
                : `Sube 1 video corto de hasta ${maxVideoSizeMB} MB`}
          </p>
        </div>
      ) : (
        /* Media Items Grid & Video Preview */
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-4 gap-2.5">
                {/* 1. Imagenes cargadas */}
                {images.map((img, index) => (
                  <SortableImageItem
                    key={img.id}
                    image={img}
                    index={index}
                    onRemove={removeImage}
                    isMain={index === 0}
                  />
                ))}

                {/* 2. Video en la misma grilla con exactamente el mismo diseño */}
                {videoPreview && (
                  <VideoTileItem
                    preview={videoPreview}
                    onRemove={removeVideo}
                    onOpenModal={() => setIsVideoModalOpen(true)}
                  />
                )}

                {/* 3. Casilla para agregar mas archivos */}
                {images.length < maxImages && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(false);
                      if (
                        e.dataTransfer.files &&
                        e.dataTransfer.files.length > 0
                      ) {
                        handleFiles(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                      isDragOver
                        ? "border-[#f25c05] bg-[#f25c05]/10"
                        : "border-[#e2e8f0] hover:border-[#f25c05] hover:bg-[#f25c05]/5"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] group-hover:bg-[#f25c05]/10 flex items-center justify-center transition-colors">
                      <ImagePlus className="w-5 h-5 text-[#94a3b8] group-hover:text-[#f25c05] transition-colors" />
                    </div>
                    <span className="text-[10px] text-[#94a3b8] mt-1 group-hover:text-[#f25c05] transition-colors">
                      Agregar
                    </span>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Modal de Reproduccion de Video Completo */}
      {isVideoModalOpen && videoPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 text-white">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Film className="w-4 h-4 text-[#f25c05]" />
                Vista previa del video
              </span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <video
              src={videoPreview}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
