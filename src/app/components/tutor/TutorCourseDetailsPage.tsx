import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  Upload,
  CheckCircle2,
  X,
  Loader2,
  Clock,
  Play,
  Info,
  Send
} from "lucide-react";
import { courseService, Course, Lesson, Resource } from "../../../services/courseService";
import { CourseInfoForm } from "./CourseInfoForm";

type UploadType = "video" | "pdf" | null;
type TabId = "info" | "videos" | "pdfs";

export default function TutorCourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState<UploadType>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData, resourcesData] = await Promise.all([
        courseService.getCourseById(courseId!),
        courseService.getLessons(courseId!),
        courseService.getResources(courseId!),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setResources(resourcesData);
    } catch (err) {
      console.error(err);
      alert("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await courseService.deleteLesson(id);
      setLessons(lessons.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete lesson.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await courseService.deleteResource(id);
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource.");
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadTitle) return alert("Title is required");
    if (!file) return alert("File is required");

    try {
      setUploading(true);
      if (showUploadModal === "video") {
        await courseService.uploadVideo(courseId!, uploadTitle, file);
      } else if (showUploadModal === "pdf") {
        await courseService.uploadPdf(courseId!, uploadTitle, file);
      }
      alert(`${showUploadModal} uploaded successfully!`);
      handleModalClose();
      loadCourseData();
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setShowUploadModal(null);
    setUploadTitle("");
    setFile(null);
  };

  const handleSubmitForReview = async () => {
    if (!course) return;
    const missing: string[] = [];
    if (!course.level) missing.push("Course Level");
    if (!course.target_audience) missing.push("Target Audience");
    if (!course.learning_outcomes?.filter(Boolean).length) missing.push("Learning Outcomes (at least 1)");
    if (missing.length) {
      alert(`Please fill in the following in the Course Info tab before submitting:\n\n• ${missing.join('\n• ')}`);
      setActiveTab("info");
      return;
    }
    if (!confirm("Submit this course for admin review? You won't be able to edit it until reviewed.")) return;
    setSubmitting(true);
    try {
      await courseService.updateCourseStatus(course.id, 'pending_review');
      setCourse(prev => prev ? { ...prev, status: 'pending_review' } : prev);
      alert("Course submitted for review!");
    } catch (err: any) {
      alert("Failed to submit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!course) {
    return <div className="p-8 text-center text-muted-foreground">Course not found.</div>;
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_review: "bg-amber-100 text-amber-700",
    needs_changes: "bg-orange-100 text-orange-700",
    published: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const canSubmit = course.status === 'draft' || course.status === 'needs_changes';

  const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: "info", label: "Course Info", icon: Info },
    { id: "videos", label: "Videos", icon: Video, count: lessons.length },
    { id: "pdfs", label: "PDFs", icon: FileText, count: resources.length },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-border pb-6">
        <button 
          onClick={() => navigate("/app/tutor/content")}
          className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{course.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage curriculum, resources, and course details.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusColors[course.status] || statusColors.draft}`}>
            {course.status.replace('_',' ')}
          </span>
          {canSubmit && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-200 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === id ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <CourseInfoForm course={course} onSaved={setCourse} />
      )}

      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Video className="w-5 h-5 text-blue-600" /> Course Videos
            </h2>
            <button onClick={() => setShowUploadModal("video")} className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Video
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[300px]">
            {lessons.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                <Video className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{lesson.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {lesson.duration}</span>
                        <a href={lesson.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Play className="w-3 h-3"/>View</a>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pdfs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-rose-500" /> PDF Resources
            </h2>
            <button onClick={() => setShowUploadModal("pdf")} className="text-sm bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add PDF
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[300px]">
            {resources.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                <FileText className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm">No PDFs uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {resources.map((res) => (
                  <div key={res.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-rose-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{res.title}</p>
                      <a href={res.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">View / Download</a>
                    </div>
                    <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal (Reused) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {showUploadModal === "video" ? "Upload Video Lesson" : "Upload PDF Resource"}
              </h3>
              <button 
                onClick={handleModalClose} 
                className="p-2 hover:bg-muted rounded-full text-muted-foreground/80 hover:text-muted-foreground transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title</label>
                <input 
                  type="text" 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none" 
                  placeholder={showUploadModal === "video" ? "e.g., Lesson 1: Introduction" : "e.g., Syllabus Overview"} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {showUploadModal === "video" ? "Video File (.mp4, .webm)" : "PDF File (.pdf)"}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border bg-muted/50 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={showUploadModal === "video" ? "video/mp4, video/webm" : "application/pdf"}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-muted-foreground/80 group-hover:text-blue-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Click to browse or drag & drop</p>
                      <p className="text-xs text-muted-foreground">
                        {showUploadModal === "video" ? "MP4 up to 500MB" : "PDF up to 100MB"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button 
                onClick={handleModalClose} 
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading || !file}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-70"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
