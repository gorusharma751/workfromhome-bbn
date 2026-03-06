
-- Add form_fields (custom form definition), approval_days, and has_refund to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS form_fields jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS approval_days integer DEFAULT 1;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS has_refund boolean DEFAULT false;

-- Add form_data to task_submissions for storing user form responses
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS form_data jsonb DEFAULT '{}'::jsonb;
