-- Crear segundo usuario de prueba para testing de chat
-- Ejecutar en Supabase SQL Editor

-- 1. Crear usuario en auth.users (esto se hace desde el Dashboard de Supabase)
-- El usuario debe tener email como: test2@iubizon.com

-- 2. Luego ejecutar este script para crear el profile y productos

-- Obtener el ID del nuevo usuario (reemplazar con el ID real del usuario creado)
-- Por ahora we'll create with a fixed UUID
DO $$
DECLARE
  test_user_id UUID := '22222222-2222-2222-2222-222222222222';
  cat_proyectores UUID;
  cat_laptops UUID;
  cat_electronica UUID;
  cat_moviles UUID;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO cat_proyectores FROM categories WHERE slug = 'proyectores';
  SELECT id INTO cat_laptops FROM categories WHERE slug = 'laptops';
  SELECT id INTO cat_electronica FROM categories WHERE slug = 'electronica';
  SELECT id INTO cat_moviles FROM categories WHERE slug = 'moviles';

  -- Crear profile para el segundo usuario
  INSERT INTO profiles (id, email, name, phone, avatar_url, created_at)
  VALUES (test_user_id, 'test2@iubizon.com', 'Carlos Test', '+51987654321', NULL, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Crear productos de prueba para el segundo usuario
  INSERT INTO products (seller_id, category_id, title, description, price, condition, status, created_at)
  VALUES
    -- Proyectores
    (test_user_id, cat_proyectores, 'Proyector Sony VPL-PHZ10', 'Proyector laser 4K, 5000 lúmenes, perfecto para presentaciones profesionales. Incluye control remoto y cable HDMI.', 1899.00, 'new', 'active', NOW() - INTERVAL '2 days'),
    (test_user_id, cat_proyectores, 'Proyector Portátil Philips PicoPix', 'Mini proyector LED, batería integrada, ideal para viajes. Resolución 720p, hasta 2 horas de autonomía.', 449.00, 'like_new', 'active', NOW() - INTERVAL '5 days'),
    
    -- Laptops
    (test_user_id, cat_laptops, 'MacBook Air M2 15"', 'Apple MacBook Air 15" chip M2, 256GB SSD, 8GB RAM. Estado impecable, apenas usado.', 1299.00, 'like_new', 'active', NOW() - INTERVAL '1 day'),
    (test_user_id, cat_laptops, 'HP Pavilion Gaming 15', 'Laptop gaming HP Pavilion, Intel i7, 16GB RAM, GTX 1650, 512GB SSD. Perfecta para gaming y trabajo.', 899.00, 'good', 'active', NOW() - INTERVAL '3 days'),
    
    -- Electrónica
    (test_user_id, cat_electronica, 'Apple AirPods Pro 2', 'AirPods Pro segunda generación, cancelación de ruido activa, modo transparencia. Incluye estuche de carga.', 249.00, 'new', 'active', NOW() - INTERVAL '1 day'),
    (test_user_id, cat_electronica, 'Nintendo Switch OLED', 'Nintendo Switch con pantalla OLED, incluye Joy-Con Neon Red/Blue. Más de 30 juegos incluidos.', 399.00, 'new', 'active', NOW() - INTERVAL '4 days'),
    
    -- Móviles
    (test_user_id, cat_moviles, 'iPhone 14 Pro Max 256GB', 'iPhone 14 Pro Max, color Deep Purple, batería 92%. Incluye caja original y accesorios.', 1099.00, 'like_new', 'active', NOW() - INTERVAL '2 days'),
    (test_user_id, cat_moviles, 'Samsung Galaxy S23 Ultra', 'Samsung S23 Ultra, 512GB, color Phantom Black.Estado nuevo, garantía hasta 2025.', 999.00, 'new', 'active', NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Usuario de prueba y productos creados exitosamente';
END $$;

-- Nota: Para el chat funcione, también necesitas crear una conversación y mensaje de ejemplo
-- Esto lo puedes hacer después de que el segundo usuario inicie sesión