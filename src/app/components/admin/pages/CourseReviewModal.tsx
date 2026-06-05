import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { courseService, Course, Lesson, Resource } from '../../../../services/courseService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Video, FileText, CheckCircle, XCircle, AlertTriangle, Globe, Award, ClipboardList, ChevronDown, ChevronUp, Users, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import toast from 'react-hot-toast';

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

interface CourseReviewModalProps {
  courseId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CourseReviewModal({ courseId, onClose, onSuccess }: CourseReviewModalProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(0);

  useEffect(() => {
    if (courseId) {
      fetchDetails();
    }
  }, [courseId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const c = await courseService.getCourseById(courseId!);
      setCourse(c);
      const l = await courseService.getLessons(courseId!);
      setLessons(l);
      const r = await courseService.getResources(courseId!);
      setResources(r);
      if (l.length > 0) {
        setActiveVideo(l[0].video_url);
      } else if (c.preview_video_url) {
        setActiveVideo(c.preview_video_url);
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
      toast.error('Please provide feedback for the tutor.');
      return;
    }

    setSubmitting(true);
    try {
      await courseService.updateCourseStatus(course.id, action);
      
      // If there's feedback, send notification
      if (feedback.trim()) {
        await supabase.from('notifications').insert({
          user_id: course.tutor_id,
          message: `Your course "${course.title}" was ${action === 'needs_changes' ? 'sent back for changes' : 'rejected'}. Admin Feedback: ${feedback}`
        });
      } else if (action === 'published') {
        await supabase.from('notifications').insert({
          user_id: course.tutor_id,
          message: `Good news! Your course "${course.title}" has been approved and is now published.`
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!courseId) return null;

  return (
    <Dialog open={!!courseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Course</DialogTitle>
          <DialogDescription>Review the course content before making a decision.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Left Column: Player & Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="bg-black aspect-video rounded-xl overflow-hidden flex items-center justify-center relative">
                {activeVideo ? (
                  <video src={activeVideo} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Video className="w-12 h-12 mb-2 opacity-50" />
                    <p>Select a lesson to view</p>
                  </div>
                )}
                {course && activeVideo === course.preview_video_url && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                    Course Preview Video
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                    NGN {course.price}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-2">{course.description || 'No description provided.'}</p>

                {/* Extended Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                  {course.level && (
                    <div>
                      <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Level</p>
                      <span className={`inline-block font-semibold px-2 py-0.5 rounded capitalize ${LEVEL_BADGE[course.level] || 'bg-gray-200 text-gray-800'}`}>
                        {course.level}
                      </span>
                    </div>
                  )}
                  {course.language && (
                    <div>
                      <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Language</p>
                      <p className="font-semibold text-gray-800">{course.language}</p>
                    </div>
                  )}
                  {course.total_duration && (
                    <div>
                      <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</p>
                      <p className="font-semibold text-gray-800">{course.total_duration}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Assignments</p>
                    <p className="font-semibold text-gray-800">
                      {course.has_assignments ? `Yes (${course.assignment_count || 0})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><Award className="w-3 h-3" /> Cert.</p>
                    <p className="font-semibold text-gray-800">
                      {course.has_certificate ? 'Platform Cert' : 'No'}
                    </p>
                  </div>
                  {course.teaching_format && (
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-gray-400 font-medium mb-1">Teaching Format</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {course.teaching_format.split(',').map((f, idx) => (
                          <span key={idx} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-700">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* What You'll Learn */}
                {course.learning_outcomes && course.learning_outcomes.filter(Boolean).length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What You'll Learn
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {course.learning_outcomes.filter(Boolean).map((o, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {course.target_audience && (
                  <div className="mt-6 border-t border-gray-100 pt-6 text-xs">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" /> Who Is This For?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{course.target_audience}</p>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && course.requirements.filter(Boolean).length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-6 text-xs">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                      <ClipboardList className="w-4 h-4 text-orange-500" /> Requirements
                    </h3>
                    <ul className="space-y-1.5">
                      {course.requirements.filter(Boolean).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured Curriculum / Modules Accordion */}
                {course.modules && course.modules.filter(m => m.title).length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-600" /> Structured Curriculum / Modules
                    </h3>
                    <div className="space-y-2">
                      {course.modules.filter(m => m.title).map((mod, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 text-xs">
                          <button
                            type="button"
                            onClick={() => setOpenModule(openModule === i ? null : i)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">M{i + 1}</span>
                              <span className="font-semibold text-gray-800">{mod.title}</span>
                              {mod.lessons?.length > 0 && (
                                <span className="text-[10px] text-gray-400">({mod.lessons.length} text lessons)</span>
                              )}
                            </div>
                            {openModule === i ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                          </button>
                          {openModule === i && mod.lessons?.length > 0 && (
                            <div className="border-t border-gray-100 bg-white divide-y divide-gray-50">
                              {mod.lessons.map((lesson, li) => (
                                <div key={li} className="flex items-center gap-2 px-4 py-2">
                                  <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{li + 1}.</span>
                                  <span className="text-gray-600">{lesson}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Resources */}
                {resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
                    <div className="space-y-2">
                      {resources.map(r => (
                        <a 
                          key={r.id} 
                          href={r.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-red-500 mr-3" />
                          <span className="text-sm font-medium">{r.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificate Sample */}
                {course.has_tutor_certificate && course.tutor_certificate_sample_url && (
                  <div className="mt-6 p-4 border-2 border-blue-100 rounded-xl bg-blue-50/30">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" /> Tutor Certificate Sample
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                      {course.tutor_certificate_sample_url.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-red-500" />
                          <span className="text-xs font-medium text-gray-500">PDF Certificate</span>
                          <a href={course.tutor_certificate_sample_url} target="_blank" rel="noreferrer" className="text-xs text-blue-700 font-bold hover:underline">Click to view PDF</a>
                        </div>
                      ) : (
                        <img src={course.tutor_certificate_sample_url} alt="Sample" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Lessons & Actions */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Lessons ({lessons.length})</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveVideo(lesson.video_url)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-start ${
                        activeVideo === lesson.video_url ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="w-6 shrink-0">{idx + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  ))}
                  {lessons.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No lessons uploaded.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900">Admin Actions</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Feedback (Required for Reject/Changes)</label>
                  <Textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the tutor..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    onClick={() => handleAction('published')}
                    disabled={submitting}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Course
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => handleAction('needs_changes')}
                      disabled={submitting}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Request Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleAction('rejected')}
                      disabled={submitting}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">Course not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
