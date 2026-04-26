-- =====================================================
-- Course Progress & Certification System
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add certificate fields to courses table
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS has_tutor_certificate boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tutor_certificate_sample_url text;

-- 2. Create lesson_completions table to track video progress
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, lesson_id)
);

-- 3. Create course_completions table
CREATE TABLE IF NOT EXISTS public.course_completions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'completed' NOT NULL, -- 'completed', 'claimed'
  intern_connect_certificate_sent boolean DEFAULT false,
  tutor_certificate_sent boolean DEFAULT false,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- 4. Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

-- 5. Policies for lesson_completions
DROP POLICY IF EXISTS "Students can manage their completions" ON public.lesson_completions;
CREATE POLICY "Students can manage their completions" ON public.lesson_completions
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Tutors can view student completions for their courses" ON public.lesson_completions;
CREATE POLICY "Tutors can view student completions for their courses" ON public.lesson_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lesson_completions.course_id
      AND courses.tutor_id = auth.uid()
    )
  );

-- 6. Policies for course_completions
DROP POLICY IF EXISTS "Students can view their completions" ON public.course_completions;
CREATE POLICY "Students can view their completions" ON public.course_completions
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all completions" ON public.course_completions;
CREATE POLICY "Admins can manage all completions" ON public.course_completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Tutors can view completions for their courses" ON public.course_completions;
CREATE POLICY "Tutors can view completions for their courses" ON public.course_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_completions.course_id
      AND courses.tutor_id = auth.uid()
    )
  );

-- 7. Add columns for email notification support if needed
-- Users table already has email in auth.users, we can join there.
