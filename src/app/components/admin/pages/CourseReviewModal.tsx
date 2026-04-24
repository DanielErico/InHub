import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { courseService, Course, Lesson, Resource } from '../../../../services/courseService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Video, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Textarea } from '../ui/textarea';

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
      if (l.length > 0) setActiveVideo(l[0].video_url);
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
      alert(`Error: ${err.message}`);
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
              <div className="bg-black aspect-video rounded-xl overflow-hidden flex items-center justify-center">
                {activeVideo ? (
                  <video src={activeVideo} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Video className="w-12 h-12 mb-2 opacity-50" />
                    <p>Select a lesson to view</p>
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
