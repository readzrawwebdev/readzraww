-- 1) Remove policy that queries auth.users (causes: permission denied for table users)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- 2) Let authenticated users update only their own orders (needed to save receipt_url after upload)
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3) Storage policies for receipts: support upsert and secure admin reads
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update receipts" ON storage.objects;

CREATE POLICY "Anyone can upload receipts"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Anyone can update receipts"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Admins can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND public.has_role(auth.uid(), 'admin')
);