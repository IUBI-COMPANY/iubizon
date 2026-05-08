-- Seed de productos de prueba para el marketplace
-- Ejecutar en Supabase SQL Editor

-- Insertar el profile para el usuario existente
INSERT INTO profiles (id, email, name, avatar_url, created_at)
VALUES ('10432af3-9d11-4bda-9e3e-8d86921e734b', 'mariano260996@gmail.com', 'Mariano', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- Obtener categorías y crear productos
DO $$
DECLARE
  cat_proyectores UUID;
  cat_laptops UUID;
  cat_electronica UUID;
  demo_user UUID := '10432af3-9d11-4bda-9e3e-8d86921e734b';
BEGIN
  SELECT id INTO cat_proyectores FROM categories WHERE slug = 'proyectores';
  SELECT id INTO cat_laptops FROM categories WHERE slug = 'laptops';
  SELECT id INTO cat_electronica FROM categories WHERE slug = 'electronica';

  -- Insertar productos de prueba
  INSERT INTO products (seller_id, category_id, title, description, price, condition, status, created_at)
  VALUES
    (demo_user, cat_proyectores, 'Proyector EPSON Home Cinema 2350', 'Proyector Full HD 2800 lúmenes, ideal para cine en casa. Incluye mando a distancia.', 1299.00, 'new', 'active', NOW() - INTERVAL '1 day'),
    (demo_user, cat_proyectores, 'Proyector BenQ MH550', 'Proyector Full HD 1080p, 3500 lúmenes, HDMI, VGA. Perfecto para presentaciones y películas.', 899.00, 'like_new', 'active', NOW() - INTERVAL '2 days'),
    (demo_user, cat_proyectores, 'Proyector ViewSonic PA503S', 'Proyector SVGA 3600 lúmenes, ideal para aulas y oficinas. Económico y duradero.', 450.00, 'good', 'active', NOW() - INTERVAL '3 days'),
    (demo_user, cat_laptops, 'MacBook Pro 14" M3 Pro', 'Apple MacBook Pro 14 pulgadas, chip M3 Pro, 18GB RAM, 512GB SSD. Potencia profesional.', 2499.00, 'new', 'active', NOW() - INTERVAL '1 day'),
    (demo_user, cat_laptops, 'Dell XPS 15 Intel Core i7', 'Dell XPS 15 9530, Intel Core i7-13700H, 16GB RAM, 512GB SSD, RTX 4050. Potencia y diseño.', 1899.00, 'like_new', 'active', NOW() - INTERVAL '2 days'),
    (demo_user, cat_laptops, 'Lenovo ThinkPad T480', 'Lenovo ThinkPad T480, Intel Core i5-8250U, 8GB RAM, 256GB SSD. Laptop empresarial en buen estado.', 650.00, 'good', 'active', NOW() - INTERVAL '5 days'),
    (demo_user, cat_electronica, 'Sony WH-1000XM5', 'Auriculares wireless noise cancelling, autonomía 30h, multipunto. Los mejores del mercado.', 299.00, 'new', 'active', NOW() - INTERVAL '1 day'),
    (demo_user, cat_electronica, 'Samsung Galaxy Tab S9', 'Tablet Samsung Galaxy Tab S9, 11", 128GB, WiFi. Pantalla AMOLED 120Hz.', 799.00, 'like_new', 'active', NOW() - INTERVAL '3 days'),
    (demo_user, cat_proyectores, 'Proyector LG HF80JS', 'Proyector laser Full HD, smart TV integrado, 2000 lúmenes. Cine en casa sin consola.', 1100.00, 'new', 'active', NOW() - INTERVAL '4 days'),
    (demo_user, cat_laptops, 'ASUS ROG Zephyrus G14', 'Gaming laptop AMD Ryzen 9, RTX 4060, 16GB RAM, 1TB SSD. Potencia gaming en formato compacto.', 1599.00, 'new', 'active', NOW() - INTERVAL '2 days');

  RAISE NOTICE 'Productos de prueba insertados correctamente';
END $$;