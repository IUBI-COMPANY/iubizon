"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Image as ImageIcon,
  X,
  Upload,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react";

interface ImageUploaderProps {
  productId?: string;
  images?: Array<{ id: string; url: string; position: number }>;
  onImagesChange?: (
    images: Array<{ id: string; url: string; position: number }>,
  ) => void;
}

export function ImageUploader({
  productId,
  images = [],
  onImagesChange,
}: ImageUploaderProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localImages, setLocalImages] = useState(images);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const savePositions = async (imgs: typeof localImages) => {
    if (!productId || imgs.length === 0) return;

    const imagesWithPositions = imgs.map((img, idx) => ({
      id: img.id,
      position: idx,
    }));

    try {
      await fetch("/api/products/images/positions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesWithPositions }),
      });
    } catch (error) {
      console.error("Error saving positions:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!productId) {
      alert("Primero guarda el producto para agregar imágenes");
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("product_id", productId);

        const response = await fetch("/api/products/images", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const newImages = [
            ...localImages,
            {
              id: result.image.id,
              url: result.url,
              position: localImages.length,
            },
          ];
          setLocalImages(newImages);
          onImagesChange?.(newImages);
        }
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/images?id=${imageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const newImages = localImages.filter((img) => img.id !== imageId);
        setLocalImages(newImages);
        onImagesChange?.(newImages);
        savePositions(newImages);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...localImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setLocalImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onImagesChange?.(localImages);
    savePositions(localImages);
  };

  const setAsMainImage = async (index: number) => {
    if (index === 0) return;

    const newImages = [...localImages];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);

    setLocalImages(newImages);
    onImagesChange?.(newImages);
    savePositions(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`flex items-center gap-2 px-4 py-2 bg-[#f25c05] text-white rounded-lg hover:bg-[#d94d04] cursor-pointer transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Subiendo..." : "Agregar imágenes"}
        </label>
        <span className="text-sm text-[#64748b]">Máx 10MB por imagen</span>
      </div>

      {localImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#64748b]">
            Arrastra para reordenar. La primera imagen será la principal.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {localImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square group cursor-move ${
                  draggedIndex === index ? "opacity-50" : ""
                } ${index === 0 ? "ring-2 ring-[#f25c05]" : ""}`}
              >
                <img
                  src={image.url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Main image indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#f25c05] text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Principal
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsMainImage(index)}
                      className="bg-white text-[#112237] px-2 py-1 rounded text-xs hover:bg-gray-100"
                      title="Establecer como principal"
                    >
                      ★ Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                    title="Eliminar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drag handle */}
                <div className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 cursor-grab">
                  <GripVertical className="w-5 h-5 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {localImages.length === 0 && (
        <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-[#64748b] mb-2" />
          <p className="text-[#64748b]">No hay imágenes</p>
        </div>
      )}
    </div>
  );
}
