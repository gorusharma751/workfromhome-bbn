
-- Fix the permissive referrals INSERT policy - restrict to the referred user only
DROP POLICY "System can insert referrals" ON public.referrals;
CREATE POLICY "Referred user can insert referral" ON public.referrals FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = referred_id));
