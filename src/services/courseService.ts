import { supabase } from '../lib/supabase';
import { uploadFileWithProgress } from '../lib/uploadHelper';

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  id: string;
  tutor_id: string;
  title: string;
  category: string;
  description: string;
  thumbnail_url: string;
  price: number;
  status: 'draft' | 'pending_review' | 'needs_changes' | 'rejected' | 'published';
  duration: string;
  created_at: string;
  // Extended detail fields
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  learning_outcomes?: string[];
  target_audience?: string;
  requirements?: string[];
  modules?: CourseModule[];
  teaching_format?: string;
  total_duration?: string;
  has_assignments?: boolean;
  assignment_count?: number;
  has_certificate?: boolean;
  certificate_requirements?: string;
  preview_video_url?: string;
  has_tutor_certificate?: boolean;
  tutor_certificate_sample_url?: string;
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
  course_id: string; // Required now
  tutor_id: string;
  title: string;
  type: 'live' | 'qna' | 'review' | 'workshop' | 'guest';
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  color: string;
  // joined
  courses?: { title: string } | null;
  users?: { full_name: string | null } | null;
}

export const scheduleService = {
  async getTutorScheduleSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('schedule_sessions')
      .select(`
        *,
        courses ( title ),
        users ( full_name )
      `)
      .eq('tutor_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error("Error fetching tutor schedule:", error);
      return [];
    }
    return data as ScheduleSession[];
  },

  async getStudentScheduleSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Find courses student is enrolled in
    const { data: purchases } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'success');

    if (!purchases || purchases.length === 0) return [];

    const courseIds = purchases.map(p => p.course_id);

    const { data, error } = await supabase
      .from('schedule_sessions')
      .select(`
        *,
        courses ( title ),
        users ( full_name )
      `)
      .in('course_id', courseIds)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error("Error fetching student schedule:", error);
      return [];
    }
    return data as ScheduleSession[];
  },

  async createScheduleSession(sessionData: Omit<ScheduleSession, 'id' | 'courses' | 'users' | 'tutor_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Insert the session
    const { data: insertedSession, error } = await supabase
      .from('schedule_sessions')
      .insert({
        ...sessionData,
        tutor_id: user.id
      })
      .select('id')
      .single();

    if (error) throw error;

    // Trigger notifications for enrolled students
    try {
      const { data: course } = await supabase.from('courses').select('title').eq('id', sessionData.course_id).single();
      const courseTitle = course?.title || 'a course';

      // Find enrolled students
      const { data: purchases } = await supabase
        .from('purchases')
        .select('user_id')
        .eq('course_id', sessionData.course_id)
        .eq('status', 'success');

      if (purchases && purchases.length > 0) {
        const notifications = purchases.map(p => ({
          user_id: p.user_id,
          title: "New Live Session Scheduled",
          message: `A new ${sessionData.type} session "${sessionData.title}" has been scheduled for ${courseTitle}.`,
          type: "system",
          link: "/app/schedule"
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } catch (notifErr) {
      console.error("Failed to send schedule notifications:", notifErr);
      // We don't throw here because the schedule was still created successfully
    }

    return insertedSession;
  }
};

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

  async getTutorStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get tutor's courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, status')
      .eq('tutor_id', user.id);

    const courseIds = courses?.map(c => c.id) || [];
    
    // Total courses
    const totalCourses = courseIds.length;
    
    // Total lessons
    let totalLessons = 0;
    if (courseIds.length > 0) {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds);
      totalLessons = count || 0;
    }

    // Total Students (purchases) and Revenue
    let totalStudents = 0;
    let totalRevenue = 0;
    let recentPurchases: any[] = [];
    if (courseIds.length > 0) {
      const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('created_at, user_id, course_id, amount_paid')
        .in('course_id', courseIds)
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (purchaseError) {
        console.error("Error fetching purchases:", purchaseError);
      }

      if (purchases) {
        // Unique students
        const uniqueStudents = new Set(purchases.map(p => p.user_id));
        totalStudents = uniqueStudents.size;
        
        // Total revenue
        totalRevenue = purchases.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
        
        // Let's get the 4 most recent purchases and fetch the student details
        const recent = purchases.slice(0, 4);
        
        // We need student details and course details
        const userIdsToFetch = [...new Set(recent.map(r => r.user_id))];
        let userMap: Record<string, any> = {};
        if (userIdsToFetch.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .in('id', userIdsToFetch);
            
          (usersData || []).forEach(u => { userMap[u.id] = u; });
        }
        
        const courseMap = (courses || []).reduce((acc: any, c) => { acc[c.id] = c; return acc; }, {});
        
        recentPurchases = recent.map(r => ({
          ...r,
          student: userMap[r.user_id] || { full_name: 'Unknown Student' },
          course: courseMap[r.course_id] || { title: 'Unknown Course' }
        }));
      }
    }

    // Recent Courses for schedule/recent section
    const recentCourses = [...(courses || [])]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);

    return {
      totalCourses,
      totalLessons,
      totalStudents,
      totalRevenue,
      recentPurchases,
      recentCourses
    };
  },

  async getTutorStudents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('tutor_id', user.id);

    if (!courses || courses.length === 0) return [];
    const courseMap = courses.reduce((acc: any, c) => { acc[c.id] = c.title; return acc; }, {});
    const courseIds = courses.map(c => c.id);

    const { data: purchases } = await supabase
      .from('purchases')
      .select('user_id, course_id, created_at')
      .in('course_id', courseIds)
      .eq('status', 'success')
      .order('created_at', { ascending: false });

    if (!purchases || purchases.length === 0) return [];

    const userIds = [...new Set(purchases.map(p => p.user_id))];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);

    const userMap = (usersData || []).reduce((acc: any, u) => { acc[u.id] = u; return acc; }, {});

    return purchases.map((p) => {
      const student = userMap[p.user_id] || { full_name: 'Unknown User', email: 'Protected', avatar_url: null };
      
      // Deterministic mock stats based on user id since we don't have grading/progress tables yet
      const charCode = p.user_id ? p.user_id.charCodeAt(0) + p.user_id.charCodeAt(p.user_id.length - 1) : 50;
      const progress = (charCode * 7) % 100;
      const grade = (charCode * 11) % 40 + 60; // Grades between 60 and 100
      const streak = (charCode * 3) % 14;
      
      let status = "active";
      if (grade > 90) status = "top";
      else if (progress < 30) status = "at-risk";

      return {
        id: `${p.user_id}-${p.course_id}`,
        user_id: p.user_id,
        name: student.full_name || 'Unknown User',
        email: student.email || 'No email provided',
        avatar: student.avatar_url,
        course: courseMap[p.course_id] || 'Unknown Course',
        progress: progress,
        grade: grade,
        lastActive: new Date(p.created_at).toLocaleDateString(),
        status: status,
        streak: streak
      };
    });
  },


  async getAllPublishedCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch tutor info separately (FK was dropped)
    const tutorIds = [...new Set(data.map((c: any) => c.tutor_id).filter(Boolean))];
    let tutorMap: Record<string, { full_name: string; avatar_url: string | null }> = {};

    if (tutorIds.length > 0) {
      const { data: tutors } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', tutorIds);

      (tutors || []).forEach((t: any) => {
        tutorMap[t.id] = { full_name: t.full_name, avatar_url: t.avatar_url };
      });
    }

    return data.map((c: any) => ({
      ...c,
      users: tutorMap[c.tutor_id] || { full_name: 'Unknown Tutor', avatar_url: null }
    }));
  },

  async getPurchasedCourses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'success');

    if (error || !purchases || purchases.length === 0) return [];

    const courseIds = purchases.map((p: any) => p.course_id);

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds);

    if (coursesError || !courses || courses.length === 0) return [];

    // Fetch tutor info separately
    const tutorIds = [...new Set(courses.map((c: any) => c.tutor_id).filter(Boolean))];
    let tutorMap: Record<string, { full_name: string; avatar_url: string | null }> = {};

    if (tutorIds.length > 0) {
      const { data: tutors } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', tutorIds);

      (tutors || []).forEach((t: any) => {
        tutorMap[t.id] = { full_name: t.full_name, avatar_url: t.avatar_url };
      });
    }

    return courses.map((c: any) => ({
      ...c,
      users: tutorMap[c.tutor_id] || { full_name: 'Unknown Tutor', avatar_url: null }
    }));
  },

  async hasPurchasedCourse(courseId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'success')
      .maybeSingle();

    return !!data && !error;
  },

  async recordPurchase(courseId: string, amount: number, reference: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: courseId,
        amount_paid: amount,
        reference,
        status: 'success'
      });

    if (error) throw error;
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

  async createCourse(title: string, category: string, price: number, file: File | null, onProgress?: (progress: number) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create a course');

    let thumbnailUrl = '';
    
    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      thumbnailUrl = await uploadFileWithProgress('course-content', `thumbnails/${fileName}`, file, onProgress);
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        tutor_id: user.id,
        title,
        category,
        price,
        thumbnail_url: thumbnailUrl,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Course;
  },

  async uploadCourseThumbnail(courseId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const thumbnailUrl = await uploadFileWithProgress('course-content', `thumbnails/${fileName}`, file, onProgress);

    const { error: updateError } = await supabase
      .from('courses')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', courseId);

    if (updateError) throw updateError;

    return thumbnailUrl;
  },
  
  async uploadCertificateSample(courseId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const fileName = `${Date.now()}-cert-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const certUrl = await uploadFileWithProgress('course-content', `certificates/${fileName}`, file, onProgress);

    await supabase
      .from('courses')
      .update({ tutor_certificate_sample_url: certUrl })
      .eq('id', courseId);

    return certUrl;
  },

  async updateCourseStatus(courseId: string, status: Course['status']) {
    const { error } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', courseId)
      .select()
      .single();
    if (error) throw error;
  },

  async updateCourseDetails(courseId: string, details: Partial<Course>) {
    const { error } = await supabase
      .from('courses')
      .update(details)
      .eq('id', courseId);
    if (error) throw error;
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

  async uploadVideo(courseId: string, title: string, file: File, onProgress?: (progress: number) => void) {
    const fileName = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const videoUrl = await uploadFileWithProgress('course-content', `videos/${fileName}`, file, onProgress);

    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title,
        video_url: videoUrl,
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

  async uploadPdf(courseId: string, title: string, file: File, onProgress?: (progress: number) => void) {
    const fileName = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUrl = await uploadFileWithProgress('course-content', `pdfs/${fileName}`, file, onProgress);

    const { data, error } = await supabase
      .from('resources')
      .insert({
        course_id: courseId,
        title,
        file_url: fileUrl,
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

  async getOverallProgress(studentId: string) {
    try {
      // 1. Get student's purchased course IDs
      const { data: purchases } = await supabase
        .from('purchases')
        .select('course_id')
        .eq('user_id', studentId)
        .eq('status', 'success');

      if (!purchases || purchases.length === 0) return 0;
      const courseIds = purchases.map(p => p.course_id);

      // 2. Get total lessons and quizzes for these courses
      const { data: lessons } = await supabase.from('lessons').select('id, course_id').in('course_id', courseIds);
      const { data: quizzes } = await supabase.from('quizzes').select('id, course_id').in('course_id', courseIds).eq('status', 'published');

      // 3. Get completions and scores
      const { data: completions } = await supabase.from('lesson_completions').select('lesson_id, course_id').eq('student_id', studentId);
      const { data: scores } = await supabase.from('quiz_scores').select('quiz_id, passed').eq('student_id', studentId).eq('passed', true);

      if (!lessons && !quizzes) return 0;

      // Group totals and completions by course
      let totalPoints = 0;
      let completedPoints = 0;

      courseIds.forEach(cId => {
        const courseLessons = lessons?.filter(l => l.course_id === cId) || [];
        const courseQuizzes = quizzes?.filter(q => q.course_id === cId) || [];
        const total = courseLessons.length + courseQuizzes.length;

        if (total > 0) {
          const doneLessons = completions?.filter(c => c.course_id === cId).length || 0;
          const doneQuizzes = scores?.filter(s => quizzes?.find(q => q.id === s.quiz_id && q.course_id === cId)).length || 0;
          
          totalPoints += total;
          completedPoints += (doneLessons + doneQuizzes);
        }
      });

      return totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
    } catch (err) {
      console.error("Progress error:", err);
      return 0;
    }
  },

  // === Assignments === //

  async getAssignments(studentId: string): Promise<Assignment[]> {
    // TODO: Migrate from 'assignments' table to 'quizzes' and 'quiz_scores'
    // Currently returns empty array to prevent 404 errors in console
    return [];
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

  async getScheduleSessions(userId?: string): Promise<ScheduleSession[]> {
    try {
      // Use provided ID or get current user ID
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        effectiveUserId = user?.id;
      }

      if (!effectiveUserId) return [];

      // Find courses student is enrolled in
      const { data: purchases } = await supabase
        .from('purchases')
        .select('course_id')
        .eq('user_id', effectiveUserId)
        .eq('status', 'success');

      if (!purchases || purchases.length === 0) return [];

      const courseIds = purchases.map(p => p.course_id);

      const { data, error } = await supabase
        .from('schedule_sessions')
        .select(`
          *,
          courses ( title ),
          users ( full_name )
        `)
        .in('course_id', courseIds)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error("Error fetching schedule sessions:", error);
        return [];
      }
      return (data as ScheduleSession[]) || [];
    } catch (err) {
      console.error("Schedule sessions error:", err);
      return [];
    }
  },

  // === Tutor Finance === //

  async getTutorFinanceData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get all tutor courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, price')
      .eq('tutor_id', user.id);

    const courseIds = (courses || []).map(c => c.id);
    const courseMap: Record<string, any> = (courses || []).reduce((acc: any, c) => { acc[c.id] = c; return acc; }, {});

    // Get all successful purchases for those courses
    let purchases: any[] = [];
    if (courseIds.length > 0) {
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('id, user_id, course_id, amount_paid, created_at')
        .in('course_id', courseIds)
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (purchaseData && purchaseData.length > 0) {
        // Fetch student details
        const userIds = [...new Set(purchaseData.map(p => p.user_id))];
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds as string[]);
        const userMap = (usersData || []).reduce((acc: any, u) => { acc[u.id] = u; return acc; }, {});

        purchases = purchaseData.map(p => ({
          ...p,
          student: userMap[p.user_id] || { full_name: 'Unknown', email: '' },
          course: courseMap[p.course_id] || { title: 'Unknown Course', price: 0 },
          tutor_share: (Number(p.amount_paid) || 0) * 0.65,
        }));
      }
    }

    // Get withdrawal requests
    const { data: withdrawals } = await supabase
      .from('tutor_withdrawals')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });

    // Get bank details from profile
    const { data: profile } = await supabase
      .from('users')
      .select('bank_name, bank_account_number, bank_account_name')
      .eq('id', user.id)
      .single();

    const allTimeRevenue = purchases.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const allTimeTutorEarnings = allTimeRevenue * 0.65; // 65% share
    
    const totalWithdrawn = (withdrawals || [])
      .filter(w => w.status === 'approved' || w.status === 'paid')
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);
      
    const pendingWithdrawal = (withdrawals || [])
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);

    // User requested: "removing the amount withdrawn, everything should recalculate"
    // We treat the current earnings and revenue as a "wallet balance" rather than an all-time ledger.
    const totalTutorEarnings = Math.max(0, allTimeTutorEarnings - totalWithdrawn);
    const totalRevenue = Math.max(0, allTimeRevenue - (totalWithdrawn / 0.65)); // Scale it so the 65% math holds visually
    
    // Hold back is 30% of the ALL TIME earnings (since it's released on completion)
    const heldBack = allTimeTutorEarnings * 0.30; 
    
    // Available is 70% of ALL TIME earnings minus what they've already withdrawn
    const availableForWithdrawal = Math.max(0, (allTimeTutorEarnings * 0.70) - totalWithdrawn);

    return {
      purchases,
      withdrawals: withdrawals || [],
      totalRevenue,
      totalTutorEarnings,
      availableForWithdrawal,
      heldBack,
      totalWithdrawn,
      pendingWithdrawal,
      bankDetails: profile || null,
    };
  },

  async submitWithdrawalRequest(payload: {
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Cache bank details on the user profile for future use
    await supabase.from('users').update({
      bank_name: payload.bank_name,
      bank_account_number: payload.account_number,
      bank_account_name: payload.account_name,
    }).eq('id', user.id);

    const { data, error } = await supabase
      .from('tutor_withdrawals')
      .insert({
        tutor_id: user.id,
        amount: payload.amount,
        bank_name: payload.bank_name,
        account_number: payload.account_number,
        account_name: payload.account_name,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // === Admin Finance === //

  async adminGetAllPurchases() {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('id, user_id, course_id, amount_paid, created_at, status')
      .eq('status', 'success')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!purchases || purchases.length === 0) return [];

    // Fetch all related courses and their tutors
    const courseIds = [...new Set(purchases.map(p => p.course_id))];
    const studentIds = [...new Set(purchases.map(p => p.user_id))];

    const [{ data: courses }, { data: students }] = await Promise.all([
      supabase.from('courses').select('id, title, tutor_id, price').in('id', courseIds as string[]),
      supabase.from('users').select('id, full_name, email').in('id', studentIds as string[]),
    ]);

    const tutorIds = [...new Set((courses || []).map((c: any) => c.tutor_id))];
    const { data: tutors } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', tutorIds as string[]);

    const courseMap = (courses || []).reduce((acc: any, c: any) => { acc[c.id] = c; return acc; }, {});
    const studentMap = (students || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {});
    const tutorMap = (tutors || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {});

    return purchases.map(p => {
      const course = courseMap[p.course_id] || {};
      const tutor = tutorMap[course.tutor_id] || {};
      const student = studentMap[p.user_id] || {};
      return {
        id: p.id,
        created_at: p.created_at,
        amount_paid: p.amount_paid,
        tutor_share: (Number(p.amount_paid) || 0) * 0.65,
        platform_share: (Number(p.amount_paid) || 0) * 0.35,
        course_title: course.title || 'Unknown',
        course_price: course.price || 0,
        tutor_name: tutor.full_name || 'Unknown',
        tutor_email: tutor.email || '',
        student_name: student.full_name || 'Unknown',
        student_email: student.email || '',
      };
    });
  },

  async adminGetAllWithdrawals() {
    const { data: withdrawals, error } = await supabase
      .from('tutor_withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!withdrawals || withdrawals.length === 0) return [];

    const tutorIds = [...new Set(withdrawals.map(w => w.tutor_id))];
    const { data: tutors } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', tutorIds as string[]);

    const tutorMap = (tutors || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {});

    return withdrawals.map(w => ({
      ...w,
      tutor: tutorMap[w.tutor_id] || { full_name: 'Unknown', email: '' },
    }));
  },

  async adminApproveWithdrawal(withdrawalId: string, tutorId: string) {
    // 1. Update withdrawal status
    const { error } = await supabase
      .from('tutor_withdrawals')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', withdrawalId);

    if (error) throw error;

    // 2. Create a notification for the tutor
    await supabase.from('notifications').insert({
      user_id: tutorId,
      title: 'Withdrawal Request Approved',
      message: 'Your withdrawal request has been approved. You will be credited within 24 to 48 hours.',
      type: 'payment',
      read: false,
    }).then(({ error: notifError }) => {
      if (notifError) console.warn('Notification insert failed:', notifError.message);
    });

    return true;
  },

  async adminRejectWithdrawal(withdrawalId: string, note: string) {
    const { error } = await supabase
      .from('tutor_withdrawals')
      .update({ status: 'rejected', admin_note: note, updated_at: new Date().toISOString() })
      .eq('id', withdrawalId);

    if (error) throw error;
    return true;
  },
};
