
-- Add second form fields to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS second_form_fields jsonb DEFAULT '[]'::jsonb;

-- Add second form tracking to task_submissions
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS second_form_data jsonb DEFAULT NULL;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS second_form_status text DEFAULT NULL;
-- second_form_status values: null (no 2nd form), 'active' (admin activated), 'submitted' (user filled), 'approved', 'rejected'
