-- Fix: Allow admins to update course status (approve, reject, request changes)
-- Run this in the Supabase SQL Editor

-- Add UPDATE policy for admins on the courses table
CREATE POLICY "Admins can update any course" ON public.courses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Also ensure admins can insert notifications (needed to notify tutors)
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
