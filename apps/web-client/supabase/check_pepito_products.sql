-- Verificar productos de pepito
SELECT p.id, p.title, p.price, p.status, u.email
FROM products p
JOIN auth.users u ON p.seller_id = u.id
WHERE u.email = 'pepito@gmail.com';