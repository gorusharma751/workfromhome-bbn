
-- Create task_slots table
CREATE TABLE public.task_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  slot_number integer NOT NULL,
  review_text text NOT NULL DEFAULT '',
  assigned_user_id uuid DEFAULT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'completed')),
  assigned_at timestamp with time zone DEFAULT NULL,
  UNIQUE(task_id, slot_number)
);

ALTER TABLE public.task_slots ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage slots" ON public.task_slots
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can see their own assigned slots
CREATE POLICY "Users can view own slots" ON public.task_slots
FOR SELECT TO authenticated
USING (assigned_user_id = auth.uid());

-- Users can view available slot count (but not review_text of unassigned slots)
CREATE POLICY "Users can view available slots" ON public.task_slots
FOR SELECT TO authenticated
USING (status = 'available');

-- Users can book available slots
CREATE POLICY "Users can book available slots" ON public.task_slots
FOR UPDATE TO authenticated
USING (status = 'available')
WITH CHECK (assigned_user_id = auth.uid() AND status = 'booked');

-- Create deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  photo_url text,
  deal_link text,
  price numeric NOT NULL DEFAULT 0,
  total_slots integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  rules text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active deals" ON public.deals
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage deals" ON public.deals
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  note text,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create refunds table
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds" ON public.refunds
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own refunds" ON public.refunds
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage refunds" ON public.refunds
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
