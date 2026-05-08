-- Crear productos para el usuario pepito@gmail.com
-- Primero obten el ID del usuario ejecutando: 
-- SELECT id, email FROM auth.users WHERE email = 'pepito@gmail.com';

DO $$
DECLARE
  test_user_id UUID;
  cat_proyectores UUID;
  cat_laptops UUID;
  cat_electronica UUID;
  cat_moviles UUID;
BEGIN
  -- Obtener el ID del usuario por email
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'pepito@gmail.com';
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No se encontró el usuario con email pepito@gmail.com';
    RETURN;
  END IF;

  -- Obtener IDs de categorías
  SELECT id INTO cat_proyectores FROM categories WHERE slug = 'proyectores';
  SELECT id INTO cat_laptops FROM categories WHERE slug = 'laptops';
  SELECT id INTO cat_electronica FROM categories WHERE slug = 'electronica';
  SELECT id INTO cat_moviles FROM categories WHERE slug = 'moviles';

  -- Crear profile si no existe
  INSERT INTO profiles (id, email, name, phone, avatar_url, created_at)
  VALUES (test_user_id, 'pepito@gmail.com', 'Pepito', '+51987654321', NULL, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Crear productos de prueba
  INSERT INTO products (seller_id, category_id, title, description, price, condition, status, created_at)
  VALUES
    -- Proyectores
    (test_user_id, cat_proyectores, 'Proyector Sony VPL-PHZ10', 'Proyector laser 4K, 5000 lúmenes, perfecto para presentaciones profesionales.', 1899.00, 'new', 'active', NOW() - INTERVAL '2 days'),
    (test_user_id, cat_proyectores, 'Proyector Portátil Philips PicoPix', 'Mini proyector LED, batería integrada, ideal para viajes.', 449.00, 'like_new', 'active', NOW() - INTERVAL '5 days'),
    
    -- Laptops
    (test_user_id, cat_laptops, 'MacBook Air M2 15"', 'Apple MacBook Air 15" chip M2, 256GB SSD, 8GB RAM.', 1299.00, 'like_new', 'active', NOW() - INTERVAL '1 day'),
    (test_user_id, cat_laptops, 'HP Pavilion Gaming 15', 'Laptop gaming HP Pavilion, Intel i7, 16GB RAM, GTX 1650.', 899.00, 'good', 'active', NOW() - INTERVAL '3 days'),
    
    -- Electrónica
    (test_user_id, cat_electronica, 'Apple AirPods Pro 2', 'AirPods Pro segunda generación, cancelación de ruido activa.', 249.00, 'new', 'active', NOW() - INTERVAL '1 day'),
    (test_user_id, cat_electronica, 'Nintendo Switch OLED', 'Nintendo Switch con pantalla OLED, incluye Joy-Con.', 399.00, 'new', 'active', NOW() - INTERVAL '4 days'),
    
    -- Móviles
    (test_user_id, cat_moviles, 'iPhone 14 Pro Max 256GB', 'iPhone 14 Pro Max, color Deep Purple, batería 92%.', 1099.00, 'like_new', 'active', NOW() - INTERVAL '2 days'),
    (test_user_id, cat_moviles, 'Samsung Galaxy S23 Ultra', 'Samsung S23 Ultra, 512GB, color Phantom Black.', 999.00, 'new', 'active', NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Productos creados para pepito@gmail.com';
END $$;