-- =====================================================
-- CBT Assignment System Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Extend the quizzes table
ALTER TABLE public.quizzes 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS time_limit_minutes integer,
  ADD COLUMN IF NOT EXISTS pass_mark_percent integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 1;

-- 2. Make sure quiz_scores table exists with base columns first
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure base columns exist on pre-existing tables (safe to run even if already present)
ALTER TABLE public.quiz_scores
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS answers jsonb,
  ADD COLUMN IF NOT EXISTS ai_theory_scores jsonb,
  ADD COLUMN IF NOT EXISTS final_theory_scores jsonb,
  ADD COLUMN IF NOT EXISTS total_score numeric,
  ADD COLUMN IF NOT EXISTS max_score numeric,
  ADD COLUMN IF NOT EXISTS passed boolean;


-- 3. Enable RLS on quiz_scores
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- 4. Quiz RLS: Students can read published quizzes for courses they enrolled in
DROP POLICY IF EXISTS "Students can view published quizzes" ON public.quizzes;
CREATE POLICY "Students can view published quizzes" ON public.quizzes
  FOR SELECT USING (
    status = 'published' AND (
      course_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.purchases
        WHERE purchases.course_id = quizzes.course_id
        AND purchases.user_id = auth.uid()
        AND purchases.status = 'success'
      )
    )
  );

-- Tutors can manage their own quizzes
DROP POLICY IF EXISTS "Tutors can manage their quizzes" ON public.quizzes;
CREATE POLICY "Tutors can manage their quizzes" ON public.quizzes
  FOR ALL USING (tutor_id = auth.uid());

-- 5. Quiz scores RLS
DROP POLICY IF EXISTS "Students can view and insert their own scores" ON public.quiz_scores;
CREATE POLICY "Students can view and insert their own scores" ON public.quiz_scores
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Tutors can view scores for their quizzes" ON public.quiz_scores;
CREATE POLICY "Tutors can view scores for their quizzes" ON public.quiz_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_scores.quiz_id
      AND quizzes.tutor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tutors can update theory scores" ON public.quiz_scores;
CREATE POLICY "Tutors can update theory scores" ON public.quiz_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_scores.quiz_id
      AND quizzes.tutor_id = auth.uid()
    )
  );

-- 6. Ensure notifications table has a 'link' column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text DEFAULT 'system';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS seen boolean DEFAULT false;

-- 7. Mark notifications as seen
-- Students can update their own notifications (mark seen)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 8. Tutors can insert notifications for their students
DROP POLICY IF EXISTS "Tutors can insert notifications" ON public.notifications;
CREATE POLICY "Tutors can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 9. Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
