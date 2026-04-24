import { supabase } from '../lib/supabase';

export interface Course {
  id: string;
  tutor_id: string;
  title: string;
  category: string;
  description: string;
  thumbnail_url: string;
  status: 'draft' | 'review' | 'published';
  duration: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  duration: string;
  order_index: number;
}

export interface Resource {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string;
}

export interface LessonCompletion {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

export interface Assignment {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  points: number;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  // joined
  courses?: { title: string } | null;
  assignment_submissions?: { id: string; status: string }[];
}

export interface ScheduleSession {
  id: string;
  course_id: string | null;
  tutor_id: string | null;
  title: string;
  type: 'live' | 'workshop' | 'deadline' | 'review' | 'mentoring';
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  color: string;
  // joined
  courses?: { title: string } | null;
  users?: { full_name: string | null } | null;
}

export const courseService = {
  // === Courses === //

  async getTutorCourses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Course[];
  },

  async getAllPublishedCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*, users(full_name, avatar_url)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Course;
  },

  async createCourse(title: string, category: string, file: File | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create a course');

    let thumbnailUrl = '';
    
    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(`thumbnails/${fileName}`, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(`thumbnails/${fileName}`);
        
      thumbnailUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        tutor_id: user.id,
        title,
        category,
        thumbnail_url: thumbnailUrl,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Course;
  },

  // === Lessons / Videos === //

  async getLessons(courseId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as Lesson[];
  },

  async uploadVideo(courseId: string, title: string, file: File) {
    const fileName = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { error: uploadError } = await supabase.storage
      .from('course-content')
      .upload(`videos/${fileName}`, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('course-content')
      .getPublicUrl(`videos/${fileName}`);

    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title,
        video_url: publicUrlData.publicUrl,
        duration: 'New',
        order_index: count || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Lesson;
  },

  async deleteLesson(id: string) {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  },

  // === Resources / PDFs === //

  async getResources(courseId: string) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('course_id', courseId);

    if (error) throw error;
    return data as Resource[];
  },

  async uploadPdf(courseId: string, title: string, file: File) {
    const fileName = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { error: uploadError } = await supabase.storage
      .from('course-content')
      .upload(`pdfs/${fileName}`, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('course-content')
      .getPublicUrl(`pdfs/${fileName}`);

    const { data, error } = await supabase
      .from('resources')
      .insert({
        course_id: courseId,
        title,
        file_url: publicUrlData.publicUrl,
        file_type: 'pdf',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Resource;
  },

  async deleteResource(id: string) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
  },

  // === Lesson Completions === //

  async getStudentCompletions(studentId: string): Promise<LessonCompletion[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('student_id', studentId);
      if (error) return [];
      return (data as LessonCompletion[]) || [];
    } catch {
      return [];
    }
  },

  async getStudentCourseCompletions(studentId: string, courseId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('student_id', studentId)
        .eq('course_id', courseId);
      if (error) return [];
      return (data || []).map((r: any) => r.lesson_id);
    } catch {
      return [];
    }
  },

  async markLessonComplete(studentId: string, lessonId: string, courseId: string): Promise<void> {
    try {
      await supabase
        .from('lesson_completions')
        .upsert({ student_id: studentId, lesson_id: lessonId, course_id: courseId }, { onConflict: 'student_id,lesson_id' });
    } catch {
      // silently fail if table doesn't exist yet
    }
  },

  // === Assignments === //

  async getAssignments(studentId: string): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(title), assignment_submissions!left(id, status, student_id)')
        .order('due_date', { ascending: true });
      if (error) return [];
      // Filter submissions to only this student
      return ((data as any[]) || []).map((a) => ({
        ...a,
        assignment_submissions: (a.assignment_submissions || []).filter(
          (s: any) => s.student_id === studentId
        ),
      }));
    } catch {
      return [];
    }
  },

  async submitAssignment(assignmentId: string, studentId: string, file: File | null): Promise<void> {
    let fileUrl: string | null = null;

    if (file) {
      const fileName = `submissions/${studentId}/${assignmentId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('assignment_submissions')
      .upsert(
        { assignment_id: assignmentId, student_id: studentId, file_url: fileUrl, status: 'submitted' },
        { onConflict: 'assignment_id,student_id' }
      );
    if (error) throw error;
  },

  // === Schedule === //

  async getScheduleSessions(): Promise<ScheduleSession[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_sessions')
        .select('*, courses(title), users(full_name)')
        .order('scheduled_at', { ascending: true });
      if (error) return [];
      return (data as ScheduleSession[]) || [];
    } catch {
      return [];
    }
  },
};
