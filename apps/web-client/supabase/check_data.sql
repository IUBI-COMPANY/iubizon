-- Verificar categorías y productos en la base de datos
SELECT 
  c.id, c.name, c.slug,
  p.id as product_id, p.title, p.category_id
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.slug IN ('proyectores', 'laptops', 'electronica')
ORDER BY c.slug;