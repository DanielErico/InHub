-- ============================================
-- FIX: resolve 409 Conflict errors by ensuring users exist and fixing RLS
-- Run this in the Supabase SQL Editor
-- ============================================

-- Fix 1: Ensure any existing users in auth.users are also in public.users to prevent Foreign Key violations
INSERT INTO public.users (id, full_name, role)
SELECT id, raw_user_meta_data->>'full_name', 'tutor'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE public.users.id = auth.users.id
);

-- Fix 2: Explicitly separate the RLS policies for INSERT to ensure WITH CHECK works perfectly
DROP POLICY IF EXISTS "Tutors can manage their own curriculums" ON public.saved_curriculums;
CREATE POLICY "Tutors can select their own curriculums" ON public.saved_curriculums FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can insert their own curriculums" ON public.saved_curriculums FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own curriculums" ON public.saved_curriculums FOR DELETE USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors can manage their own quizzes" ON public.quizzes;
CREATE POLICY "Tutors can select their own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can insert their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = tutor_id);
