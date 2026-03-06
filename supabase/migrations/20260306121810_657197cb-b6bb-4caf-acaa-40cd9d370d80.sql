
CREATE OR REPLACE FUNCTION public.handle_referral_chain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _l1_referrer_id uuid;
  _l2_referrer_id uuid;
  _l3_referrer_id uuid;
BEGIN
  -- Only fire when referred_by is set (from NULL to a value)
  IF OLD.referred_by IS NULL AND NEW.referred_by IS NOT NULL THEN
    _l1_referrer_id := NEW.referred_by;

    -- Level 1: direct referrer
    INSERT INTO public.referrals (referrer_id, referred_id, level, earnings)
    VALUES (_l1_referrer_id, NEW.id, 1, 0)
    ON CONFLICT DO NOTHING;

    -- Level 2: referrer's referrer
    SELECT referred_by INTO _l2_referrer_id FROM public.profiles WHERE id = _l1_referrer_id;
    IF _l2_referrer_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, level, earnings)
      VALUES (_l2_referrer_id, NEW.id, 2, 0)
      ON CONFLICT DO NOTHING;

      -- Level 3: referrer's referrer's referrer
      SELECT referred_by INTO _l3_referrer_id FROM public.profiles WHERE id = _l2_referrer_id;
      IF _l3_referrer_id IS NOT NULL THEN
        INSERT INTO public.referrals (referrer_id, referred_id, level, earnings)
        VALUES (_l3_referrer_id, NEW.id, 3, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_referral_set
  AFTER UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_chain();
