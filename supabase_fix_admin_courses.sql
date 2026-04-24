-- Fix: Allow admins to see all courses in the admin dashboard
-- Run this in the Supabase SQL Editor

-- First, drop the old course select policy that blocks admins
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Lessons are viewable by authorized users" ON public.lessons;
DROP POLICY IF EXISTS "Resources are viewable by authorized users" ON public.resources;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;

-- Allow admins to see ALL courses regardless of status
CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow tutors to see their own courses
CREATE POLICY "Tutors can view their own courses" ON public.courses
  FOR SELECT USING (
    tutor_id = auth.uid()
  );

-- Allow everyone to see published courses
CREATE POLICY "Published courses are viewable by everyone" ON public.courses
  FOR SELECT USING (
    status = 'published'
  );

-- Lessons: admin + tutor owner + paid student
CREATE POLICY "Lessons are viewable by authorized users" ON public.lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = public.lessons.course_id AND tutor_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.purchases WHERE course_id = public.lessons.course_id AND user_id = auth.uid() AND status = 'success')
    OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = public.lessons.course_id AND status = 'published')
  );

-- Resources: same access as lessons
CREATE POLICY "Resources are viewable by authorized users" ON public.resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = public.resources.course_id AND tutor_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.purchases WHERE course_id = public.resources.course_id AND user_id = auth.uid() AND status = 'success')
    OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = public.resources.course_id AND status = 'published')
  );
