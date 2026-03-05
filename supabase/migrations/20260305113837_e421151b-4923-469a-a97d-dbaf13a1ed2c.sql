
-- Allow admins to insert user roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default admin_settings for telegram and app branding if not exists
INSERT INTO public.admin_settings (key, value) VALUES 
  ('telegram', '{"group_link": "", "support_link": ""}'),
  ('app_branding', '{"app_name": "WorkFromHome", "logo_url": ""}')
ON CONFLICT (key) DO NOTHING;
