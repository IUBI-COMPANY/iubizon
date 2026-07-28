import { createClient } from '@/lib/supabase/client';
import type { UploadedImage } from '@/components/features/products/MediaUploader';

/**
 * Sube un archivo de video directamente a Supabase Storage desde el cliente.
 * Evita límites de tamaño de cuerpo de petición (body payload) en API Routes de Next.js.
 */
export async function uploadProductVideoClient(file: File, productId?: string): Promise<string> {
  const supabase = createClient();

  if (file.size > 25 * 1024 * 1024) {
    throw new Error('El video excede el límite de 25 MB.');
  }

  const ext = file.name.split('.').pop() || 'mp4';
  const folder = productId || 'temp';
  const fileName = `videos/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type || 'video/mp4',
      upsert: true,
    });

  if (error) {
    console.error('Error al subir video a Supabase Storage:', error);
    throw new Error(error.message || 'Error al subir el video al almacenamiento.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export interface SyncMediaParams {
  productId: string;
  images: UploadedImage[];
  initialImageIds?: string[];
  videoFile?: File | null;
  videoPreview?: string | null;
}

/**
 * Servicio unificado para sincronizar imágenes (subidas, eliminadas) y videos de un producto.
 * Utilizado de forma idéntica en la creación (/products/new) y edición (/products/edit/[id]).
 */
export async function syncProductMedia({
  productId,
  images,
  initialImageIds = [],
  videoFile,
  videoPreview,
}: SyncMediaParams): Promise<{ videoUrl: string | null; uploadedImagesCount: number }> {
  // 1. Eliminar de la BD las imágenes que el usuario quitó de la interfaz
  if (initialImageIds.length > 0) {
    const currentIds = new Set(images.map((i) => i.id));
    const toDelete = initialImageIds.filter((id) => !currentIds.has(id));
    for (const deleteId of toDelete) {
      try {
        await fetch(`/api/products/images?id=${deleteId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Error al eliminar foto:', deleteId, err);
      }
    }
  }

  // 2. Subir imágenes nuevas (archivos File locales)
  let uploadedImagesCount = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img.file) {
      const formDataImg = new FormData();
      formDataImg.append('file', img.file);
      formDataImg.append('product_id', productId);
      formDataImg.append('position', String(i));
      const res = await fetch('/api/products/images', {
        method: 'POST',
        body: formDataImg,
      });
      if (res.ok) {
        uploadedImagesCount++;
      } else {
        console.warn(`Advertencia al subir foto en posición ${i}`);
      }
    }
  }

  // 3. Subir video si el usuario seleccionó un archivo nuevo
  let finalVideoUrl: string | null = videoPreview || null;
  if (videoFile) {
    try {
      finalVideoUrl = await uploadProductVideoClient(videoFile, productId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir el video demostrativo';
      throw new Error(msg);
    }
  }

  return { videoUrl: finalVideoUrl, uploadedImagesCount };
}
