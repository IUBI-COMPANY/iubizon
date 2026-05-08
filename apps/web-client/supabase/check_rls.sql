-- Check if RLS is enabled on products table
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'products';