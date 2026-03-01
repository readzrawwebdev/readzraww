
-- Fix orders policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own orders (by email match - we'll add user_id later)
-- For now, allow authenticated users to view orders matching their email
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add user_id column to orders for linking to authenticated users (nullable for anonymous orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Policy for users to view orders by user_id
CREATE POLICY "Users can view orders by user_id" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Storage: allow anyone to upload receipts, admins to read
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins view receipts" ON storage.objects;

CREATE POLICY "Anyone can upload receipts" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Admins can view receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'receipts');
