-- Migration to add extended course details

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS learning_outcomes JSONB,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS requirements JSONB,
ADD COLUMN IF NOT EXISTS modules JSONB,
ADD COLUMN IF NOT EXISTS teaching_format TEXT,
ADD COLUMN IF NOT EXISTS total_duration TEXT,
ADD COLUMN IF NOT EXISTS has_assignments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assignment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_requirements TEXT,
ADD COLUMN IF NOT EXISTS preview_video_url TEXT;
