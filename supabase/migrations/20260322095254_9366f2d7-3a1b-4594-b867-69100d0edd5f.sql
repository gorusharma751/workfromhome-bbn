
-- Drop old columns and add new ones to deals table
ALTER TABLE public.deals
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS deal_link,
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS photo_url,
  DROP COLUMN IF EXISTS rules;

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS product_link text,
  ADD COLUMN IF NOT EXISTS pp_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_type text DEFAULT 'original',
  ADD COLUMN IF NOT EXISTS review_word_limit text,
  ADD COLUMN IF NOT EXISTS rating_limit text,
  ADD COLUMN IF NOT EXISTS review_days text,
  ADD COLUMN IF NOT EXISTS mediator_name text,
  ADD COLUMN IF NOT EXISTS color_instruction text,
  ADD COLUMN IF NOT EXISTS order_details_required jsonb DEFAULT '["Order Screenshot","Order ID","Reviewer Name"]'::jsonb,
  ADD COLUMN IF NOT EXISTS rules jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS order_form_link text,
  ADD COLUMN IF NOT EXISTS refund_form_link text,
  ADD COLUMN IF NOT EXISTS refund_form_name text,
  ADD COLUMN IF NOT EXISTS slots_booked integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_available_after_days integer DEFAULT 25;
