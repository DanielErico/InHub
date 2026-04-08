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
      .select('*')
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
  }
};
