-- ============================================================
-- TUTOR FINANCE SCHEMA
-- ============================================================

-- 1. Add bank_details and agreed_to_tutor_tc to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS agreed_to_tutor_tc BOOLEAN DEFAULT FALSE;

-- 2. Create tutor_withdrawals table
CREATE TABLE IF NOT EXISTS public.tutor_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.tutor_withdrawals ENABLE ROW LEVEL SECURITY;

-- 4. Tutors can view and insert their own withdrawal requests
CREATE POLICY "Tutors can view own withdrawals"
  ON public.tutor_withdrawals FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert own withdrawals"
  ON public.tutor_withdrawals FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

-- 5. Admins can view and update all withdrawals
CREATE POLICY "Admins can view all withdrawals"
  ON public.tutor_withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all withdrawals"
  ON public.tutor_withdrawals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
