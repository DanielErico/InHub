import { supabase } from '../lib/supabase';

export interface SavedCurriculum {
  id: string;
  tutor_id: string;
  title: string;
  content: string;
  created_at: string;
}

export type QuestionType = 'mcq' | 'theory';

export interface CBTQuestion {
  question: string;
  type: QuestionType;
  options?: string[];       // MCQ only
  correctAnswer?: string;   // MCQ only
  explanation?: string;     // MCQ only
  expectedAnswer?: string;  // Theory only (for AI grading reference)
  points?: number;          // default 1
}

export interface StudentAnswer {
  questionIndex: number;
  answer: string;  // chosen option text for MCQ, typed text for theory
  isCorrect?: boolean;    // auto-set for MCQ
  aiScore?: number;       // AI suggested score for theory (0 to question.points)
  finalScore?: number;    // tutor overridden score
}

export interface Quiz {
  id: string;
  tutor_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  questions: CBTQuestion[];
  due_date: string | null;
  time_limit_minutes: number | null;
  pass_mark_percent: number;
  max_attempts: number;
  status: string;
  created_at: string;
}

export interface QuizScore {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  completed_at: string;
  answers: StudentAnswer[];
  ai_theory_scores: Record<number, number> | null;
  final_theory_scores: Record<number, number> | null;
  total_score: number;
  max_score: number;
  total_questions?: number;
  passed: boolean;
  users?: { full_name: string; avatar_url: string | null; email?: string };
}

export const cbtService = {
  // === Curriculums === //
  
  async saveCurriculum(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to save curriculums');

    const { data, error } = await supabase
      .from('saved_curriculums')
      .insert({ tutor_id: user.id, title, content })
      .select()
      .single();

    if (error) throw error;
    return data as SavedCurriculum;
  },

  async getSavedCurriculums() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_curriculums')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SavedCurriculum[];
  },

  async deleteCurriculum(id: string) {
    const { error } = await supabase.from('saved_curriculums').delete().eq('id', id);
    if (error) throw error;
  },

  // === Quizzes / CBT === //

  async publishQuiz(
    title: string,
    questions: CBTQuestion[],
    options: {
      description?: string;
      dueDate?: string | null;
      courseId?: string | null;
      timeLimitMinutes?: number | null;
      passMarkPercent?: number;
    } = {}
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to publish quizzes');

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        tutor_id: user.id,
        course_id: options.courseId || null,
        title,
        description: options.description || null,
        questions,
        due_date: options.dueDate || null,
        time_limit_minutes: options.timeLimitMinutes || null,
        pass_mark_percent: options.passMarkPercent ?? 50,
        status: 'published'
      })
      .select()
      .single();

    if (error) throw error;
    const quiz = data as Quiz;

    // Send notifications to enrolled students
    try {
      if (options.courseId) {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('course_id', options.courseId)
          .eq('status', 'success');

        if (purchases && purchases.length > 0) {
          const notifications = purchases
            .filter(p => p.user_id !== user.id)
            .map(p => ({
              user_id: p.user_id,
              title: 'New Assignment Posted',
              message: `A new CBT assignment "${title}" has been posted.`,
              type: 'assignment',
              link: '/app/assignments',
              seen: false,
            }));
          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        }
      }
    } catch (notifErr) {
      console.error('Failed to send notifications:', notifErr);
    }

    return quiz;
  },

  async getTutorQuizzes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Quiz[];
  },

  async getStudentQuizzes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get courses student is enrolled in
    const { data: purchases } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'success');

    const courseIds = (purchases || []).map(p => p.course_id);

    // Get published quizzes for those courses (or general quizzes with no course)
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (courseIds.length > 0) {
      query = query.or(`course_id.in.(${courseIds.join(',')}),course_id.is.null`);
    } else {
      query = query.is('course_id', null);
    }

    const { data: quizzes, error } = await query;
    if (error) throw error;

    // Get student's existing submissions
    const { data: scores } = await supabase
      .from('quiz_scores')
      .select('quiz_id, score, passed, completed_at, total_score, max_score')
      .eq('student_id', user.id);

    const scoreMap = (scores || []).reduce((acc: any, s) => {
      acc[s.quiz_id] = s;
      return acc;
    }, {});

    return (quizzes || []).map(q => ({
      ...q,
      submission: scoreMap[q.id] || null,
    }));
  },

  async submitQuizAttempt(
    quizId: string,
    questions: CBTQuestion[],
    answers: StudentAnswer[]
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Auto-grade MCQ answers
    let mcqCorrect = 0;
    let mcqTotal = 0;
    const gradedAnswers: StudentAnswer[] = answers.map((a, i) => {
      const q = questions[i];
      if (!q) return a;
      if (q.type === 'mcq' || !q.type) {
        mcqTotal++;
        const pts = q.points ?? 1;
        const correct = a.answer === q.correctAnswer;
        if (correct) mcqCorrect += pts;
        return { ...a, isCorrect: correct };
      }
      return a; // theory — graded separately
    });

    const theoryQuestions = questions.filter(q => q.type === 'theory');
    const maxScore = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

    const { data, error } = await supabase
      .from('quiz_scores')
      .insert({
        quiz_id: quizId,
        student_id: user.id,
        score: mcqCorrect,
        answers: gradedAnswers,
        total_score: mcqCorrect,
        max_score: maxScore,
        total_questions: questions.length,
        passed: theoryQuestions.length === 0 ? (mcqCorrect / maxScore) >= 0.5 : null,
      })
      .select()
      .single();

    if (error) throw error;
    return { score: mcqCorrect, maxScore, submission: data };
  },

  async getStudentSubmission(quizId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('quiz_scores')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', user.id)
      .maybeSingle();

    return data as QuizScore | null;
  },

  async getQuizSubmissions(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('*, users!quiz_scores_student_id_fkey(full_name, avatar_url, email)')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data as QuizScore[];
  },

  async updateTheoryScores(
    submissionId: string,
    finalTheoryScores: Record<number, number>,
    totalScore: number,
    maxScore: number,
    passMarkPercent: number
  ) {
    const { error } = await supabase
      .from('quiz_scores')
      .update({
        final_theory_scores: finalTheoryScores,
        total_score: totalScore,
        passed: (totalScore / maxScore) * 100 >= passMarkPercent,
      })
      .eq('id', submissionId);

    if (error) throw error;
  },

  async getStudentScores(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('*, users!quiz_scores_student_id_fkey(full_name, avatar_url)')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // === Notifications === //

  async getUnseenAssignmentCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'assignment')
      .eq('seen', false);

    return count || 0;
  },

  async markAssignmentNotificationsSeen() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('user_id', user.id)
      .eq('type', 'assignment')
      .eq('seen', false);
  },
};
