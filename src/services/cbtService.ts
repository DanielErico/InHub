import { supabase } from '../lib/supabase';

export interface SavedCurriculum {
  id: string;
  tutor_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface CBTQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  tutor_id: string;
  course_id: string | null;
  title: string;
  questions: CBTQuestion[];
  due_date: string | null;
  status: string;
  created_at: string;
}

export const cbtService = {
  // === Curriculums === //
  
  async saveCurriculum(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to save curriculums');

    const { data, error } = await supabase
      .from('saved_curriculums')
      .insert({
        tutor_id: user.id,
        title,
        content
      })
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

  async publishQuiz(title: string, questions: CBTQuestion[], dueDate: string | null = null, courseId: string | null = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to publish quizzes');

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        tutor_id: user.id,
        course_id: courseId,
        title,
        questions,
        due_date: dueDate,
        status: 'published'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Quiz;
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

  async getStudentScores(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_scores')
      .select(`
        *,
        users ( full_name, avatar_url )
      `)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
