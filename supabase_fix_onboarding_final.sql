-- ============================================
-- FINAL FIX FOR ONBOARDING RESPONSES
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- and click "RUN". It will fix the 42501 error completely.
-- ============================================

-- 1. Make sure the table exists
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    source TEXT NOT NULL,
    goal TEXT NOT NULL,
    features TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Make sure user_id is unique so UPSERT works
ALTER TABLE public.onboarding_responses DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_key;
ALTER TABLE public.onboarding_responses ADD CONSTRAINT onboarding_responses_user_id_key UNIQUE (user_id);

-- 3. Enable RLS
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can insert their own survey response" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can update their own survey response" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.onboarding_responses;

-- 5. Recreate INSERT policy
CREATE POLICY "Users can insert their own survey response"
    ON public.onboarding_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Recreate UPDATE policy (Crucial for UPSERT)
CREATE POLICY "Users can update their own survey response"
    ON public.onboarding_responses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Recreate SELECT policy (For both admins and the user themselves)
-- It's good practice to let the user select their own row during upsert
CREATE POLICY "Users can view their own survey response"
    ON public.onboarding_responses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all survey responses"
    ON public.onboarding_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
