-- ============================================================
-- SEED: Conversaciones y mensajes entre Noel y Pepito
-- ============================================================
-- INSTRUCCIONES:
--   1. Abre el Supabase Dashboard → SQL Editor
--   2. Pega y ejecuta este script completo
--   3. El SQL Editor corre como superuser (bypass RLS)
-- ============================================================
--
-- IDs verificados:
--   Noel   → cadf5390-137f-4a1c-b35e-d7ba8f9ff95a  (nmoriano26@gmail.com)
--   Pepito → a8d8e1d9-9dc7-4bc6-b9c9-a392ac0d16db  (pepito@gmail.com)
--
-- Productos activos (seller: 10432af3...):
--   MacBook Pro 14 M2    → a8a6fe94-4c47-4990-9193-ace33888b50a
--   Proyector Epson      → 11155878-ee97-4c4f-a633-d519049c1fde
--   Samsung Smart TV 55" → 19f06769-d8ce-4db0-8e67-057497b960d0
-- ============================================================

DO $$
DECLARE
  noel_id   UUID := 'cadf5390-137f-4a1c-b35e-d7ba8f9ff95a';
  pepito_id UUID := 'a8d8e1d9-9dc7-4bc6-b9c9-a392ac0d16db';

  product_macbook UUID := 'a8a6fe94-4c47-4990-9193-ace33888b50a';
  product_epson   UUID := '11155878-ee97-4c4f-a633-d519049c1fde';
  product_tv      UUID := '19f06769-d8ce-4db0-8e67-057497b960d0';

  conv1_id UUID;
  conv2_id UUID;
  conv3_id UUID;
BEGIN

  -- ── Conversación 1: Pepito compra, Noel vende — MacBook ──────────────────
  INSERT INTO public.conversations (buyer_id, seller_id, product_id, created_at, updated_at)
  VALUES (pepito_id, noel_id, product_macbook,
          NOW() - INTERVAL '2 days',
          NOW() - INTERVAL '1 hour')
  ON CONFLICT (buyer_id, product_id) DO UPDATE
    SET updated_at = NOW() - INTERVAL '1 hour'
  RETURNING id INTO conv1_id;

  -- Eliminar mensajes previos si el ON CONFLICT actualizó
  DELETE FROM public.messages WHERE conversation_id = conv1_id;

  INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
    (conv1_id, pepito_id, 'Hola, me interesa el MacBook Pro 14 M2. ¿Está disponible?',              NOW() - INTERVAL '2 days'),
    (conv1_id, noel_id,   '¡Hola! Sí, está disponible. Está en perfecto estado.',                   NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    (conv1_id, pepito_id, '¿Cuánto tiempo de uso tiene y cómo está la batería?',                    NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
    (conv1_id, noel_id,   'Tiene 8 meses de uso. La batería está al 96%, como nueva.',              NOW() - INTERVAL '1 day' + INTERVAL '4 hours'),
    (conv1_id, pepito_id, '¿Aceptas S/ 1,100? Puedo ir a recogerlo hoy.',                           NOW() - INTERVAL '3 hours'),
    (conv1_id, noel_id,   'Por S/ 1,150 incluyo la funda y el adaptador Thunderbolt. ¿Te parece?', NOW() - INTERVAL '1 hour');

  -- ── Conversación 2: Pepito compra, Noel vende — Proyector Epson ──────────
  INSERT INTO public.conversations (buyer_id, seller_id, product_id, created_at, updated_at)
  VALUES (pepito_id, noel_id, product_epson,
          NOW() - INTERVAL '5 days',
          NOW() - INTERVAL '3 days')
  ON CONFLICT (buyer_id, product_id) DO UPDATE
    SET updated_at = NOW() - INTERVAL '3 days'
  RETURNING id INTO conv2_id;

  DELETE FROM public.messages WHERE conversation_id = conv2_id;

  INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
    (conv2_id, pepito_id, 'Hola, me interesa el Proyector Epson PowerLite. ¿Cuántos lúmenes tiene?', NOW() - INTERVAL '5 days'),
    (conv2_id, noel_id,   '3.600 lúmenes ANSI. Ideal para aulas o salas de reuniones.',               NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
    (conv2_id, pepito_id, '¿Incluye pantalla o solo el proyector?',                                   NOW() - INTERVAL '4 days'),
    (conv2_id, noel_id,   'Solo el proyector, control remoto y cables. La pantalla no está incluida.', NOW() - INTERVAL '3 days');

  -- ── Conversación 3: Noel compra, Pepito vende — Samsung TV ───────────────
  INSERT INTO public.conversations (buyer_id, seller_id, product_id, created_at, updated_at)
  VALUES (noel_id, pepito_id, product_tv,
          NOW() - INTERVAL '14 hours',
          NOW() - INTERVAL '14 hours')
  ON CONFLICT (buyer_id, product_id) DO UPDATE
    SET updated_at = NOW() - INTERVAL '14 hours'
  RETURNING id INTO conv3_id;

  DELETE FROM public.messages WHERE conversation_id = conv3_id;

  INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
    (conv3_id, noel_id,   'Hola Pepito, ¿el Samsung TV 55" todavía está disponible?',    NOW() - INTERVAL '14 hours'),
    (conv3_id, pepito_id, 'Sí Noel, disponible. ¿Lo necesitas para cuándo?',              NOW() - INTERVAL '13 hours'),
    (conv3_id, noel_id,   'Esta semana si es posible. ¿Puedes hacer entrega a domicilio?', NOW() - INTERVAL '12 hours');

  RAISE NOTICE 'Listo! conv1=% conv2=% conv3=%', conv1_id, conv2_id, conv3_id;

END $$;

-- ── Verificación final ────────────────────────────────────────────────────────
SELECT
  c.id                                     AS conversation_id,
  pb.name                                  AS comprador,
  ps.name                                  AS vendedor,
  pr.title                                 AS producto,
  (SELECT COUNT(*) FROM public.messages m WHERE m.conversation_id = c.id) AS total_mensajes,
  c.updated_at
FROM public.conversations c
JOIN public.profiles pb ON c.buyer_id  = pb.id
JOIN public.profiles ps ON c.seller_id = ps.id
JOIN public.products pr ON c.product_id = pr.id
ORDER BY c.updated_at DESC;
