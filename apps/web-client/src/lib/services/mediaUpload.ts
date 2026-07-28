import { createClient } from '@/lib/supabase/client';

/**
 * Sube un archivo de video directamente a Supabase Storage desde el cliente.
 * Evita límites de tamaño de cuerpo de petición (body payload) en las API Routes de Next.js.
 */
export async function uploadProductVideoClient(file: File, productId?: string): Promise<string> {
  const supabase = createClient();

  // Validar tamaño máximo (25MB)
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('El video excede el límite de 25 MB.');
  }

  const ext = file.name.split('.').pop() || 'mp4';
  const folder = productId || 'temp';
  const fileName = `videos/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const { data, error } = await supabase.storage
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
