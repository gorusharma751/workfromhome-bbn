
-- Add guide columns to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS guide_video_url text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS guide_text text;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to update their own submissions (for 2nd form)
CREATE POLICY "Users can update own submissions" ON public.task_submissions FOR UPDATE TO public USING (auth.uid() = user_id);
