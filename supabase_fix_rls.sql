-- ============================================
-- SAFE RLS FIX: Updated Table Policies
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can delete their own courses" ON public.courses;

DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Tutors can update their lessons" ON public.lessons;
DROP POLICY IF EXISTS "Tutors can delete their lessons" ON public.lessons;

DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Tutors can update their resources" ON public.resources;
DROP POLICY IF EXISTS "Tutors can delete their resources" ON public.resources;

-- 2. Drop the foreign key constraint that blocks course creation for new users
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_tutor_id_fkey;

-- 3. Create USERS policies
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 4. Create COURSES policies
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can update their own courses" ON public.courses FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own courses" ON public.courses FOR DELETE USING (auth.uid() = tutor_id);

-- 5. Create LESSONS policies (allows tutors to manage lessons for their own courses)
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lessons" ON public.lessons FOR INSERT WITH CHECK (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);
CREATE POLICY "Tutors can update their lessons" ON public.lessons FOR UPDATE USING (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);
CREATE POLICY "Tutors can delete their lessons" ON public.lessons FOR DELETE USING (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);

-- 6. Create RESOURCES policies
CREATE POLICY "Resources are viewable by everyone" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert resources" ON public.resources FOR INSERT WITH CHECK (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);
CREATE POLICY "Tutors can update their resources" ON public.resources FOR UPDATE USING (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);
CREATE POLICY "Tutors can delete their resources" ON public.resources FOR DELETE USING (
  exists (select 1 from public.courses where id = course_id and tutor_id = auth.uid())
);

-- NOTE: STORAGE POLICIES MUST BE ADDED MANUALLY IN THE SUPABASE UI
-- Dashboard > Storage > course-content > Policies
-- Add policies for SELECT, INSERT, UPDATE, and DELETE for "authenticated" users.
