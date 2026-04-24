-- Migration to add schedule_sessions table

CREATE TABLE IF NOT EXISTS public.schedule_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    meeting_url TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on RLS
ALTER TABLE public.schedule_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read schedule sessions
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.schedule_sessions FOR SELECT
    USING (true);

-- Policy: Tutors can insert their own sessions
CREATE POLICY "Tutors can insert their own sessions"
    ON public.schedule_sessions FOR INSERT
    WITH CHECK (auth.uid() = tutor_id);

-- Policy: Tutors can update their own sessions
CREATE POLICY "Tutors can update their own sessions"
    ON public.schedule_sessions FOR UPDATE
    USING (auth.uid() = tutor_id);

-- Policy: Tutors can delete their own sessions
CREATE POLICY "Tutors can delete their own sessions"
    ON public.schedule_sessions FOR DELETE
    USING (auth.uid() = tutor_id);
