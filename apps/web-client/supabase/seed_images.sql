-- Add random placeholder images to products
-- Using picsum.photos for random images

-- iPhone 14 Pro Max 256GB
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'iPhone 14 Pro Max 256GB'), 'https://picsum.photos/seed/iphone14/800/800', 0),
((SELECT id FROM products WHERE title = 'iPhone 14 Pro Max 256GB'), 'https://picsum.photos/seed/iphone14b/800/800', 1),
((SELECT id FROM products WHERE title = 'iPhone 14 Pro Max 256GB'), 'https://picsum.photos/seed/iphone14c/800/800', 2);

-- MacBook Pro 14 M2 2023
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'MacBook Pro 14 M2 2023'), 'https://picsum.photos/seed/macbookm2/800/800', 0),
((SELECT id FROM products WHERE title = 'MacBook Pro 14 M2 2023'), 'https://picsum.photos/seed/macbookm2b/800/800', 1);

-- Proyector Epson PowerLite 109W
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Proyector Epson PowerLite 109W'), 'https://picsum.photos/seed/proyector/800/800', 0),
((SELECT id FROM products WHERE title = 'Proyector Epson PowerLite 109W'), 'https://picsum.photos/seed/proyectorb/800/800', 1),
((SELECT id FROM products WHERE title = 'Proyector Epson PowerLite 109W'), 'https://picsum.photos/seed/proyectorc/800/800', 2),
((SELECT id FROM products WHERE title = 'Proyector Epson PowerLite 109W'), 'https://picsum.photos/seed/proyectord/800/800', 3);

-- PlayStation 5 + FIFA 24
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'PlayStation 5 + FIFA 24'), 'https://picsum.photos/seed/ps5/800/800', 0),
((SELECT id FROM products WHERE title = 'PlayStation 5 + FIFA 24'), 'https://picsum.photos/seed/ps5b/800/800', 1),
((SELECT id FROM products WHERE title = 'PlayStation 5 + FIFA 24'), 'https://picsum.photos/seed/ps5c/800/800', 2);

-- Samsung Smart TV 55 Pulgadas 4K
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Samsung Smart TV 55 Pulgadas 4K'), 'https://picsum.photos/seed/tv55/800/800', 0),
((SELECT id FROM products WHERE title = 'Samsung Smart TV 55 Pulgadas 4K'), 'https://picsum.photos/seed/tv55b/800/800', 1);

-- Taladro Inalámbrico Bosch 18V
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Taladro Inalámbrico Bosch 18V'), 'https://picsum.photos/seed/taladro/800/800', 0),
((SELECT id FROM products WHERE title = 'Taladro Inalámbrico Bosch 18V'), 'https://picsum.photos/seed/taladrob/800/800', 1),
((SELECT id FROM products WHERE title = 'Taladro Inalámbrico Bosch 18V'), 'https://picsum.photos/seed/taladroc/800/800', 2);

-- Refrigeradora Samsung Inverter 300L
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Refrigeradora Samsung Inverter 300L'), 'https://picsum.photos/seed/fridge/800/800', 0),
((SELECT id FROM products WHERE title = 'Refrigeradora Samsung Inverter 300L'), 'https://picsum.photos/seed/fridgeb/800/800', 1),
((SELECT id FROM products WHERE title = 'Refrigeradora Samsung Inverter 300L'), 'https://picsum.photos/seed/fridgec/800/800', 2);

-- Samsung Galaxy S23 Ultra 512GB
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Samsung Galaxy S23 Ultra 512GB'), 'https://picsum.photos/seed/galaxy23/800/800', 0),
((SELECT id FROM products WHERE title = 'Samsung Galaxy S23 Ultra 512GB'), 'https://picsum.photos/seed/galaxy23b/800/800', 1),
((SELECT id FROM products WHERE title = 'Samsung Galaxy S23 Ultra 512GB'), 'https://picsum.photos/seed/galaxy23c/800/800', 2),
((SELECT id FROM products WHERE title = 'Samsung Galaxy S23 Ultra 512GB'), 'https://picsum.photos/seed/galaxy23d/800/800', 3);

-- Proyector epson powerlite 97H
INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE title = 'Proyector epson powerlite 97H'), 'https://picsum.photos/seed/epsonew/800/800', 0),
((SELECT id FROM products WHERE title = 'Proyector epson powerlite 97H'), 'https://picsum.photos/seed/epsonewb/800/800', 1);