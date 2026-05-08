-- Crear bucket de almacenamiento para avatares
-- Ejecutar en Supabase SQL Editor

-- 1. Crear bucket público para avatares (solo campos básicos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear política de acceso público para avatares
CREATE POLICY "Public access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Política para que usuarios autenticados puedan subir
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Política para que usuarios puedan actualizar sus propios avatares
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Política para que usuarios puedan eliminar sus propios avatares
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);