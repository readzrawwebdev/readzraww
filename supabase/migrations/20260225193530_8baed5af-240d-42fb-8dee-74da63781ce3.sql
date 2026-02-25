
-- Make receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- Drop old permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;

-- Allow anyone to upload receipts (needed for anonymous order flow)
CREATE POLICY "Anyone can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- Only admins can view receipts
CREATE POLICY "Admins can view receipts" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));
