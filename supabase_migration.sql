-- 1. Update courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;

-- Drop the old status check constraint if it exists (the name might vary, usually it's courses_status_check)
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_status_check CHECK (status IN ('draft', 'pending_review', 'needs_changes', 'rejected', 'published'));

-- 2. Create Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount_paid numeric NOT NULL,
  reference text,
  status text DEFAULT 'success',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 3. Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Set up Row Level Security (RLS) for new tables
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Purchases Policies
-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (
  public.is_admin()
);
-- Tutors can view purchases for their courses
CREATE POLICY "Tutors can view purchases for their courses" ON public.purchases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = public.purchases.course_id AND tutor_id = auth.uid())
);
-- Students can view their own purchases
CREATE POLICY "Students can view their own purchases" ON public.purchases FOR SELECT USING (
  user_id = auth.uid()
);
-- Authenticated users can insert their own purchases (client side check after paystack)
CREATE POLICY "Users can insert their own purchases" ON public.purchases FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Notifications Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (
  user_id = auth.uid()
);
-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
  user_id = auth.uid()
);
-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (
  public.is_admin()
);

-- 5. Update Lessons and Resources Policies
-- Previously they were viewable by everyone. We need to restrict access to buyers and course owner/admin.
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons are viewable by authorized users" ON public.lessons FOR SELECT USING (
  -- Admin
  public.is_admin() OR
  -- Tutor owner
  EXISTS (SELECT 1 FROM public.courses WHERE id = public.lessons.course_id AND tutor_id = auth.uid()) OR
  -- Student who purchased
  EXISTS (SELECT 1 FROM public.purchases WHERE course_id = public.lessons.course_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
CREATE POLICY "Resources are viewable by authorized users" ON public.resources FOR SELECT USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = public.resources.course_id AND tutor_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.purchases WHERE course_id = public.resources.course_id AND user_id = auth.uid())
);
