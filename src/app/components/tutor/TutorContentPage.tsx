import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Upload,
  BookOpen,
  Users,
  Star,
  Clock,
  ChevronDown,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  X,
  CheckCircle2,
  FileText,
  PlayCircle,
  Filter,
  Loader2,
  Video
} from "lucide-react";
import { useNavigate } from "react-router";
import { courseService, Course } from "../../../services/courseService";

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  pending_review: { label: "In Review", className: "bg-blue-50 text-blue-700 border-blue-200" },
  needs_changes: { label: "Needs Changes", className: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

const filters = ["All", "Published", "Draft", "In Review", "Needs Changes", "Rejected"];

type UploadType = "course" | "pdf" | "video" | null;

export default function TutorContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState<UploadType>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Development");
  const [uploadPrice, setUploadPrice] = useState("0");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getTutorCourses();
      setCourses(data);
      if (data.length > 0) setSelectedCourseId(data[0].id);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Published" && c.status === "published") ||
      (activeFilter === "Draft" && c.status === "draft") ||
      (activeFilter === "In Review" && c.status === "pending_review") ||
      (activeFilter === "Needs Changes" && c.status === "needs_changes") ||
      (activeFilter === "Rejected" && c.status === "rejected");
    return matchSearch && matchFilter;
  });

  const summaryStats = [
    { label: "Total Courses", value: courses.length.toString(), icon: BookOpen, color: "blue" },
    { label: "Total Students", value: "0", icon: Users, color: "purple" },
    { label: "Total Revenue", value: "$0", icon: TrendingUp, color: "emerald" },
  ];

  const handleModalClose = () => {
    setShowUploadModal(null);
    setUploadTitle("");
    setUploadPrice("0");
    setFile(null);
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      setUploading(true);
      await courseService.updateCourseStatus(courseId, 'pending_review');
      alert("Course submitted for review!");
      fetchCourses();
    } catch (error: any) {
      alert(`Failed to submit: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadTitle) return alert("Title is required");
    
    // For Course creation, file (thumbnail) is optional. For PDF/Video, file is required.
    if ((showUploadModal === "pdf" || showUploadModal === "video") && !file) {
      return alert("Please select a file to upload");
    }

    try {
      setUploading(true);
      if (showUploadModal === "course") {
        await courseService.createCourse(uploadTitle, uploadCategory, parseFloat(uploadPrice) || 0, file);
      } else if (showUploadModal === "video") {
        await courseService.uploadVideo(selectedCourseId, uploadTitle, file!);
      } else if (showUploadModal === "pdf") {
        await courseService.uploadPdf(selectedCourseId, uploadTitle, file!);
      }
      
      alert(`${showUploadModal} uploaded successfully!`);
      handleModalClose();
      fetchCourses(); // Refresh list to show new data
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">Create, edit and track all your course content.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal("video")}
            className="flex items-center gap-2 bg-card border border-border text-foreground/80 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm"
          >
            <Video className="w-4 h-4 text-blue-500" />
            Upload Video
          </button>
          <button
            onClick={() => setShowUploadModal("pdf")}
            className="flex items-center gap-2 bg-card border border-border text-foreground/80 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            Upload PDF
          </button>
          <button
            onClick={() => setShowUploadModal("course")}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            New Course
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground/80" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === f
                  ? "bg-blue-700 text-white shadow-sm shadow-blue-200"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/app/tutor/content/${course.id}`)}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md hover:border-border transition-all group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden bg-slate-100 flex items-center justify-center">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusConfig[course.status]?.className || statusConfig['draft'].className}`}>
                  {statusConfig[course.status]?.label || "Draft"}
                </span>
                {/* Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === course.id ? null : course.id);
                    }}
                    className="p-1.5 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {openMenu === course.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-card rounded-xl shadow-lg border border-border z-10 overflow-hidden">
                      {(course.status === 'draft' || course.status === 'needs_changes') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSubmitForReview(course.id); setOpenMenu(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Submit for Review
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/tutor/content/${course.id}`); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground/80" /> Manage Content
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/tutor/content/${course.id}`); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-500" /> Edit
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{course.category}</span>
                <h3 className="font-bold text-foreground mt-2 mb-3 leading-snug truncate">{course.title}</h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration || '0h'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground/80" />
                    <span className="text-sm font-semibold text-foreground">0</span>
                    <span className="text-xs text-muted-foreground">students</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Course Card */}
          <button
            onClick={() => setShowUploadModal("course")}
            className="bg-muted/50 border-2 border-dashed border-border rounded-2xl h-full min-h-[280px] flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all shadow-sm">
              <Plus className="w-7 h-7 text-muted-foreground/80 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-blue-700 transition-colors">Create New Course</p>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {showUploadModal === "course" ? "Create New Course" : 
                 showUploadModal === "video" ? "Upload Video Lesson" : 
                 "Upload PDF Resource"}
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
                  placeholder={showUploadModal === "course" ? "e.g., Advanced React Patterns" : "e.g., Lesson 1: Introduction"} 
                />
              </div>

              {showUploadModal === "course" ? (
                <>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Category</label>
                  <div className="relative">
                    <select 
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none appearance-none bg-card"
                    >
                      <option>Development</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>DevOps</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Price (NGN)</label>
                  <input 
                    type="number" 
                    value={uploadPrice}
                    onChange={(e) => setUploadPrice(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none" 
                    placeholder="e.g., 5000 (0 for Free)"
                    min="0"
                  />
                </div>
              </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Select Course</label>
                  <div className="relative">
                    <select 
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none appearance-none bg-card"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {showUploadModal === "course" ? "Course Thumbnail (Optional)" : 
                   showUploadModal === "video" ? "Video File (.mp4, .webm)" : 
                   "PDF File (.pdf)"}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border bg-muted/50 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={showUploadModal === "course" ? "image/png, image/jpeg" : showUploadModal === "video" ? "video/mp4, video/webm" : "application/pdf"}
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
                        {showUploadModal === "course" ? "PNG, JPG up to 5MB" : 
                         showUploadModal === "video" ? "MP4 up to 500MB" : 
                         "PDF up to 100MB"}
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
                disabled={uploading || (showUploadModal !== "course" && !file)}
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
                    {showUploadModal === "course" ? "Create Course" : "Upload File"}
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
