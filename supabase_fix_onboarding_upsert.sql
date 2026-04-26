-- Run this in the Supabase SQL Editor to fix the RLS for upsert

-- Allow users to update their own survey response (needed for upsert)
DROP POLICY IF EXISTS "Users can update their own survey response" ON public.onboarding_responses;
CREATE POLICY "Users can update their own survey response"
    ON public.onboarding_responses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
