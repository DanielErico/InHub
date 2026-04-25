-- =====================================================
-- Messaging & Moderation System Migration
-- =====================================================

-- 1. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL, -- Optional context
  content text,
  image_url text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create reported content table (for both manual reports and AI blocks)
CREATE TABLE IF NOT EXISTS public.reported_content (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- NULL if AI flagged
  offender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL, -- NULL if blocked before sending
  content text NOT NULL, -- The offending text
  reason text NOT NULL,
  source text NOT NULL CHECK (source IN ('ai_filter', 'user_report')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_content ENABLE ROW LEVEL SECURITY;

-- 4. Messages RLS Policies
-- Users can read messages where they are sender or receiver
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
CREATE POLICY "Users can read their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages where they are the sender
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages to mark them as read (only if they are the receiver)
DROP POLICY IF EXISTS "Receivers can update message read status" ON public.messages;
CREATE POLICY "Receivers can update message read status" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 5. Reported Content RLS Policies
-- Users can insert manual reports
DROP POLICY IF EXISTS "Users can insert reports" ON public.reported_content;
CREATE POLICY "Users can insert reports" ON public.reported_content
  FOR INSERT WITH CHECK (auth.uid() = reporter_id OR source = 'ai_filter');

-- Only admins can read/update reported content (or tutors for their own students, but let's restrict to admins or superusers for safety. For now, we'll leave read open to admins, which we simulate with role checking if needed. Since we don't have a strict admin role yet, we can leave it select-all or restrict to sender/reporter).
-- Let's make it so users can read reports they submitted
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reported_content;
CREATE POLICY "Users can view their own reports" ON public.reported_content
  FOR SELECT USING (auth.uid() = reporter_id);

-- 6. Storage Bucket for Chat Attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for chat_attachments
DROP POLICY IF EXISTS "Anyone can read chat attachments" ON storage.objects;
CREATE POLICY "Anyone can read chat attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat_attachments');

DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat_attachments' AND auth.uid() = owner);
