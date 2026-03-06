
CREATE OR REPLACE FUNCTION public.lookup_referrer_by_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.profiles WHERE referral_code = upper(_code) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.set_referred_by(_user_id uuid, _referrer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET referred_by = _referrer_id
  WHERE user_id = _user_id AND referred_by IS NULL;
END;
$$;
