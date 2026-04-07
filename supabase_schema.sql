-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Users table (Optional if relying wholly on Supabase Auth, but good for profiles)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('student', 'tutor')) default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Courses table
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  description text,
  thumbnail_url text,
  status text check (status in ('draft', 'review', 'published')) default 'draft',
  duration text default '0h',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Lessons table
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  video_url text,
  duration text default '0:00',
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Resources table (for PDFs, etc)
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  file_url text not null,
  file_type text default 'pdf',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;

-- Policies for public reading (for students)
create policy "Courses are viewable by everyone" on public.courses for select using (status = 'published');
create policy "Lessons are viewable by everyone" on public.lessons for select using (true);
create policy "Resources are viewable by everyone" on public.resources for select using (true);

-- Policies for tutors to insert/update their own content
create policy "Tutors can insert their own courses" on public.courses for insert with check (auth.uid() = tutor_id);
create policy "Tutors can update their own courses" on public.courses for update using (auth.uid() = tutor_id);
create policy "Tutors can delete their own courses" on public.courses for delete using (auth.uid() = tutor_id);

-- Lessons RLS for tutors
create policy "Tutors can manage lessons for their courses" on public.lessons for all using (
  exists (select 1 from public.courses where id = public.lessons.course_id and tutor_id = auth.uid())
);

-- Resources RLS for tutors
create policy "Tutors can manage resources for their courses" on public.resources for all using (
  exists (select 1 from public.courses where id = public.resources.course_id and tutor_id = auth.uid())
);

-- Set up Storage constraints (Run this in the SQL editor or create the bucket manually in the UI)
insert into storage.buckets (id, name, public) values ('course-content', 'course-content', true);

create policy "Content is publicly accessible" on storage.objects for select using ( bucket_id = 'course-content' );
create policy "Authenticated users can upload" on storage.objects for insert with check ( bucket_id = 'course-content' and auth.role() = 'authenticated' );
create policy "Users can update their uploads" on storage.objects for update using ( bucket_id = 'course-content' and auth.uid() = owner );
create policy "Users can delete their uploads" on storage.objects for delete using ( bucket_id = 'course-content' and auth.uid() = owner );
