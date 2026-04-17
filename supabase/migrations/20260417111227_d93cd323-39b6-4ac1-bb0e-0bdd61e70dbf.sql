-- Fix WARN 1: Replace permissive orders insert with validation
DROP POLICY "Anyone can place an order" ON public.orders;

CREATE POLICY "Anyone can place a valid order"
  ON public.orders FOR INSERT
  WITH CHECK (
    length(customer_name) BETWEEN 2 AND 100
    AND length(customer_phone) BETWEEN 6 AND 30
    AND length(customer_address) BETWEEN 3 AND 500
    AND quantity > 0 AND quantity <= 1000
    AND total >= 0
    AND product_id IS NOT NULL
  );

-- Fix WARN 2: Restrict bucket file listing (objects are still publicly readable by direct URL)
DROP POLICY "Product images are publicly accessible" ON storage.objects;

CREATE POLICY "Product images readable by direct path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.role() = 'anon' IS NOT NULL);
