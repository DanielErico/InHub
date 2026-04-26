-- Run this in the Supabase SQL Editor

-- 1. Create the onboarding_responses table
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    source TEXT NOT NULL,
    goal TEXT NOT NULL,
    features TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Users can insert their own survey responses
DROP POLICY IF EXISTS "Users can insert their own survey response" ON public.onboarding_responses;
CREATE POLICY "Users can insert their own survey response"
    ON public.onboarding_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own survey responses (needed for upsert)
DROP POLICY IF EXISTS "Users can update their own survey response" ON public.onboarding_responses;
CREATE POLICY "Users can update their own survey response"
    ON public.onboarding_responses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all survey responses
CREATE POLICY "Admins can view all survey responses"
    ON public.onboarding_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tutors and students don't need to read responses right now, so we only need an admin select policy.

-- 4. In case the user doesn't already have the has_completed_onboarding column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
