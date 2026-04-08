-- ============================================
-- SQL for CBT Quizzes and Saved Curriculums
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create table for Saved Curriculums
CREATE TABLE public.saved_curriculums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tutor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for CBT Quizzes (Assignments)
CREATE TABLE public.quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tutor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL, -- Optional mapping to a specific course
    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- Will store the array of structured multiple-choice questions
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for Student Quiz Scores
CREATE TABLE public.quiz_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================
-- SET ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE public.saved_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Curriculums: Only the tutor who created it can view/edit it
CREATE POLICY "Tutors can manage their own curriculums" ON public.saved_curriculums FOR ALL USING (auth.uid() = tutor_id);

-- Quizzes: Everyone (students) can read published quizzes, but only the tutor can create/edit them
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (status = 'published');
CREATE POLICY "Tutors can manage their own quizzes" ON public.quizzes FOR ALL USING (auth.uid() = tutor_id);

-- Quiz Scores: Students can view/insert their own scores. Tutors can view scores for quizzes they created.
CREATE POLICY "Students can view their own scores" ON public.quiz_scores FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own scores" ON public.quiz_scores FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutors can view scores for their quizzes" ON public.quiz_scores FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quizzes WHERE id = public.quiz_scores.quiz_id AND tutor_id = auth.uid()
    )
);
