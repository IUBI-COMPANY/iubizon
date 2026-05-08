-- Agregar columna specifications a la tabla products
ALTER TABLE public.products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;

-- Crear índice para búsquedas en specifications
CREATE INDEX idx_products_specifications ON public.products USING GIN (specifications);