-- Delete duplicate images keeping only the first one for each product/position
DELETE FROM product_images
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id, position ORDER BY created_at) as rn
    FROM product_images
  ) sub
  WHERE rn > 1
);

-- Verify the result
SELECT product_id, COUNT(*) as count
FROM product_images 
GROUP BY product_id
ORDER BY product_id;