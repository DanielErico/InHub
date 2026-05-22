-- Run this in the Supabase SQL Editor

-- Allow tutors to delete their own courses if the status is 'draft'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'courses' AND policyname = 'Tutors can delete own draft courses'
  ) THEN
    CREATE POLICY "Tutors can delete own draft courses"
      ON courses FOR DELETE TO authenticated
      USING (
        tutor_id = auth.uid() AND status = 'draft'
      );
  END IF;
END $$;
