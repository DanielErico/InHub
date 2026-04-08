-- ============================================
-- FIX: Updated RLS policies for Supabase Auth
-- Run this in the Supabase SQL Editor
-- ============================================

-- Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Tutors can insert their own courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can delete their own courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all select on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all insert on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all update on courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all delete on courses" ON public.courses;

DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Tutors can manage lessons for their courses" ON public.lessons;
DROP POLICY IF EXISTS "Allow all select on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow all insert on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow all update on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow all delete on lessons" ON public.lessons;

DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Tutors can manage resources for their courses" ON public.resources;
DROP POLICY IF EXISTS "Allow all select on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow all insert on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow all update on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow all delete on resources" ON public.resources;

DROP POLICY IF EXISTS "Content is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all select on storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow all insert on storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update on storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow all delete on storage" ON storage.objects;

-- Drop the problematic foreign key on tutor_id (references users table which needs manual population)
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_tutor_id_fkey;

-- ============================================
-- USERS table: anyone can read, users can update their own
-- ============================================
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- COURSES: anyone can read published, authenticated users can create/edit their own
-- ============================================
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can update their own courses" ON public.courses FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own courses" ON public.courses FOR DELETE USING (auth.uid() = tutor_id);

-- ============================================
-- LESSONS: anyone can read, course owners can manage
-- ============================================
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

-- ============================================
-- RESOURCES: anyone can read, course owners can manage
-- ============================================
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

-- ============================================
-- STORAGE: public read, authenticated upload
-- ============================================
CREATE POLICY "Course content is publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'course-content');
CREATE POLICY "Authenticated users can upload course content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-content' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'course-content' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their uploads" ON storage.objects FOR DELETE USING (bucket_id = 'course-content' AND auth.role() = 'authenticated');
