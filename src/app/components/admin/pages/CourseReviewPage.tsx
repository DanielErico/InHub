import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../../../../lib/supabase';
import { courseService, Course, Lesson, Resource } from '../../../../services/courseService';
import {
  Loader2, Video, FileText, CheckCircle, XCircle, AlertTriangle,
  ChevronLeft, User, Mail, Calendar, BookOpen, Tag, DollarSign,
  Play, Clock, LayoutList, ShieldCheck, AlertCircle
} from 'lucide-react';

interface TutorProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  courseCount?: number;
}

export function CourseReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (courseId) fetchDetails();
  }, [courseId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const c = await courseService.getCourseById(courseId!);
      setCourse(c);

      const [l, r] = await Promise.all([
        courseService.getLessons(courseId!),
        courseService.getResources(courseId!),
      ]);
      setLessons(l);
      setResources(r);
      if (l.length > 0) setActiveLesson(l[0]);

      // Fetch tutor profile
      if (c.tutor_id) {
        const { data: tutorData } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, created_at')
          .eq('id', c.tutor_id)
          .single();

        if (tutorData) {
          // Get tutor's auth email
          const { data: authUser } = await supabase.auth.admin?.getUserById
            ? { data: null }
            : { data: null };

          // Count tutor's courses
          const { count } = await supabase
            .from('courses')
            .select('id', { count: 'exact', head: true })
            .eq('tutor_id', c.tutor_id);

          setTutor({
            ...tutorData,
            email: '',
            courseCount: count ?? 0,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'published' | 'rejected' | 'needs_changes') => {
    if (!course) return;
    if ((action === 'rejected' || action === 'needs_changes') && !feedback.trim()) {
      alert('Please provide feedback for the tutor.');
      return;
    }

    setSubmitting(true);
    try {
      await courseService.updateCourseStatus(course.id, action);

      if (feedback.trim()) {
        await supabase.from('notifications').insert({
          user_id: course.tutor_id,
          message: `Your course "${course.title}" was ${action === 'needs_changes' ? 'sent back for changes' : 'rejected'}. Admin Feedback: ${feedback}`
        });
      } else if (action === 'published') {
        await supabase.from('notifications').insert({
          user_id: course.tutor_id,
          message: `🎉 Your course "${course.title}" has been approved and is now live!`
        });
      }

      navigate('/app/admin/courses');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
    pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    needs_changes: { label: 'Needs Changes', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const currentStatus = course ? (statusConfig[course.status] || statusConfig.draft) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center text-gray-500">Course not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => navigate('/app/admin/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Courses</span>
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 truncate">{course.title}</h1>
        </div>
        {currentStatus && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* LEFT: Video + Course Info */}
        <div className="xl:col-span-2 space-y-6">

          {/* Video Player */}
          <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-xl">
            {activeLesson?.video_url ? (
              <video
                src={activeLesson.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
                key={activeLesson.id}
              />
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <Video className="w-14 h-14 opacity-30" />
                <p className="text-sm">No video uploaded for this lesson</p>
              </div>
            )}
          </div>

          {/* Lesson List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Lessons ({lessons.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-400 italic p-5">No lessons uploaded yet.</p>
              ) : (
                lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                      activeLesson?.id === lesson.id
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activeLesson?.id === lesson.id ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      {activeLesson?.id === lesson.id
                        ? <Play className="w-3.5 h-3.5 text-white fill-white" />
                        : <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${activeLesson?.id === lesson.id ? 'text-blue-900' : 'text-gray-800'}`}>
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {lesson.duration}
                        </p>
                      )}
                    </div>
                    {lesson.video_url && (
                      <Video className={`w-4 h-4 flex-shrink-0 ${activeLesson?.id === lesson.id ? 'text-blue-500' : 'text-gray-300'}`} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Resources */}
          {resources.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Resources ({resources.length})</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resources.map(r => (
                  <a
                    key={r.id}
                    href={r.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 uppercase">{r.file_type || 'PDF'}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Course Meta + Tutor + Actions */}
        <div className="space-y-6">

          {/* Course Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Course Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Title</p>
                <p className="font-semibold text-gray-900">{course.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</p>
                  <p className="text-sm font-medium text-gray-700">{course.category || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Price</p>
                  <p className="text-sm font-bold text-blue-700">
                    {course.price && course.price > 0 ? `NGN ${course.price.toLocaleString()}` : 'Free'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {course.description || <span className="italic text-gray-400">No description provided.</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Tutor Card */}
          {tutor && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" /> Tutor Profile
                </h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    {tutor.avatar_url ? (
                      <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {(tutor.full_name || 'T').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{tutor.full_name || 'Unknown Tutor'}</p>
                    <p className="text-xs text-gray-400">Course Instructor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Joined</p>
                      <p className="font-medium text-gray-700">
                        {new Date(tutor.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Courses</p>
                      <p className="font-medium text-gray-700">{tutor.courseCount ?? 0} course{(tutor.courseCount ?? 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Decision
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Feedback <span className="text-gray-400 font-normal">(required for Reject / Request Changes)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Write your feedback to the tutor here..."
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                />
              </div>

              <button
                onClick={() => handleAction('published')}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-emerald-100"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve & Publish Course
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('needs_changes')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" /> Request Changes
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
