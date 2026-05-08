-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Product images upload" ON storage.objects;
CREATE POLICY "Product images upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Product images public read" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product images owner delete" ON storage.objects;
CREATE POLICY "Product images owner delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND 
  auth.uid() IN (SELECT seller_id FROM products WHERE id::text = (storage.foldername(name))[1])
);