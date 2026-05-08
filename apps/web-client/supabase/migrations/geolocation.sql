-- ============================================
-- GEOLOCALIZACIÓN - IUBIZON MARKETPLACE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar campos de ubicación a PROFILES (usuarios)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN profiles.location IS 'Ciudad, distrito o zona del usuario';
COMMENT ON COLUMN profiles.latitude IS 'Latitud de la ubicación';
COMMENT ON COLUMN profiles.longitude IS 'Longitud de la ubicación';

-- 2. Agregar campos de ubicación a PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN products.location IS 'Ubicación donde se encuentra el producto';
COMMENT ON COLUMN products.latitude IS 'Latitud del producto';
COMMENT ON COLUMN products.longitude IS 'Longitud del producto';

-- 3. (Opcional) Crear índice para búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location) WHERE location IS NOT NULL;

-- 4. Habilitar Row Level Security para ubicación
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso a ubicación
-- Los usuarios pueden ver su propia ubicación
CREATE POLICY "Users can update own location" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- anyone can read profiles location
CREATE POLICY "Anyone can read profile location" ON profiles
  FOR SELECT USING (true);

-- anyone can read product location
CREATE POLICY "Anyone can read product location" ON products
  FOR SELECT USING (status = 'active');

-- sellers can update their own product location
CREATE POLICY "Sellers can update own product location" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

-- ============================================
-- Verificar que se crearon correctamente
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'products') 
AND column_name IN ('location', 'latitude', 'longitude');