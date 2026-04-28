import { supabase } from "../lib/supabase";

export interface SearchResult {
  id: string;
  type: 'course' | 'user' | 'assignment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link: string;
}

export const searchService = {
  async searchGlobal(query: string, role: string, userId: string): Promise<SearchResult[]> {
    if (!query || query.trim() === '') return [];
    
    const safeQuery = `%${query.trim()}%`;
    const results: SearchResult[] = [];

    if (role === 'admin') {
      // 1. Search All Courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, category, thumbnail_url')
        .ilike('title', safeQuery)
        .limit(5);

      if (courses) {
        results.push(...courses.map(c => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          subtitle: c.category,
          imageUrl: c.thumbnail_url,
          link: `/app/admin/courses` // or details if admin had a details page
        })));
      }

      // 2. Search All Users
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url, role')
        .ilike('full_name', safeQuery)
        .limit(5);

      if (users) {
        results.push(...users.map(u => ({
          id: u.id,
          type: 'user' as const,
          title: u.full_name || 'Unknown User',
          subtitle: u.email,
          imageUrl: u.avatar_url,
          link: `/app/admin/users`
        })));
      }
    } 
    else if (role === 'tutor') {
      // 1. Search Tutor's Courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, category, thumbnail_url')
        .eq('tutor_id', userId)
        .ilike('title', safeQuery)
        .limit(5);

      if (courses) {
        results.push(...courses.map(c => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          subtitle: c.category,
          imageUrl: c.thumbnail_url,
          link: `/app/tutor/course/${c.id}`
        })));
      }

      // 2. Search Enrolled Students
      const { data: myCourses } = await supabase.from('courses').select('id').eq('tutor_id', userId);
      const courseIds = myCourses?.map(c => c.id) || [];
      
      if (courseIds.length > 0) {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('user_id')
          .in('course_id', courseIds)
          .eq('status', 'success');
          
        const studentIds = [...new Set(purchases?.map(p => p.user_id) || [])];
        
        if (studentIds.length > 0) {
          const { data: students } = await supabase
            .from('users')
            .select('id, full_name, email, avatar_url')
            .in('id', studentIds)
            .ilike('full_name', safeQuery)
            .limit(5);
            
          if (students) {
            results.push(...students.map(s => ({
              id: s.id,
              type: 'user' as const,
              title: s.full_name || 'Unknown Student',
              subtitle: s.email,
              imageUrl: s.avatar_url,
              link: `/app/tutor/students`
            })));
          }
        }
      }
    }
    else {
      // Student or general user
      // 1. Search Published Courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, category, thumbnail_url')
        .eq('status', 'published')
        .ilike('title', safeQuery)
        .limit(10);

      if (courses) {
        // Find which ones they are enrolled in to give the right link
        const courseIds = courses.map(c => c.id);
        const { data: purchases } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', userId)
          .eq('status', 'success')
          .in('course_id', courseIds);
          
        const enrolledIds = new Set(purchases?.map(p => p.course_id) || []);

        results.push(...courses.map(c => ({
          id: c.id,
          type: 'course' as const,
          title: c.title,
          subtitle: c.category,
          imageUrl: c.thumbnail_url,
          link: enrolledIds.has(c.id) ? `/app/course/${c.id}/player` : `/app/course/${c.id}`
        })));
      }
    }

    return results;
  }
};
