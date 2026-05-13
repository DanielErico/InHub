-- Run this in the Supabase SQL Editor

-- 1. Create the course deletion requests table
CREATE TABLE IF NOT EXISTS course_deletion_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tutor_id        UUID NOT NULL REFERENCES users(id),
  course_title    TEXT NOT NULL,
  tutor_reason    TEXT NOT NULL,
  admin_reason    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

-- 2. Enable RLS
ALTER TABLE course_deletion_requests ENABLE ROW LEVEL SECURITY;

-- 3. Tutors can insert their own requests
CREATE POLICY "Tutors can create deletion requests"
  ON course_deletion_requests FOR INSERT TO authenticated
  WITH CHECK (tutor_id = auth.uid());

-- 4. Tutors can read their own requests
CREATE POLICY "Tutors can view own deletion requests"
  ON course_deletion_requests FOR SELECT TO authenticated
  USING (
    tutor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Admins can update (approve/reject) any request
CREATE POLICY "Admins can update deletion requests"
  ON course_deletion_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Admin RLS policy to delete any course (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'courses' AND policyname = 'Admins can delete any course'
  ) THEN
    CREATE POLICY "Admins can delete any course"
      ON courses FOR DELETE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;
