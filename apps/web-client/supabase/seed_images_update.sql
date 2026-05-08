-- Agregar imágenes a los productos existentes
-- Ejecutar en Supabase SQL Editor

-- Primero verificar qué productos existen
DO $$
DECLARE
  proj_uuid UUID;
  laptop_uuid UUID;
  electronica_uuid UUID;
BEGIN
  -- Obtener IDs de productos
  SELECT id INTO proj_uuid FROM products WHERE title ILIKE '%proyector%' LIMIT 1;
  SELECT id INTO laptop_uuid FROM products WHERE title ILIKE '%laptop%' OR title ILIKE '%macbook%' LIMIT 1;
  SELECT id INTO electronica_uuid FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'electronica') AND id != proj_uuid AND id != laptop_uuid LIMIT 1;

  -- Proyectores - imágenes de ejemplo
  INSERT INTO product_images (product_id, url, position)
  VALUES 
    (proj_uuid, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400', 0),
    (proj_uuid, 'https://images.unsplash.com/photo-1597673030062-0c58f5a61526?w=400', 1)
  ON CONFLICT DO NOTHING;

  -- Laptops
  INSERT INTO product_images (product_id, url, position)
  VALUES 
    (laptop_uuid, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 0),
    (laptop_uuid, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 1)
  ON CONFLICT DO NOTHING;

  -- Electrónica
  INSERT INTO product_images (product_id, url, position)
  VALUES 
    (electronica_uuid, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 0),
    (electronica_uuid, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', 1)
  ON CONFLICT DO NOTHING;

  -- Agregar más imágenes a otros productos
  FOR electronica_uuid IN SELECT id FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('electronica', 'consolas', 'tv-audio'))
  LOOP
    INSERT INTO product_images (product_id, url, position)
    VALUES (electronica_uuid, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 0)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Imágenes agregadas a los productos';
END $$;