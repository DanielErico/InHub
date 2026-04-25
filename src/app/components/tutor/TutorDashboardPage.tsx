import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Upload,
  Calendar as CalendarIcon,
  Video,
  FileText,
  PlayCircle,
  MoreVertical,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useUserProfile } from "../../context/UserProfileContext";
import { courseService } from "../../../services/courseService";
import { formatDistanceToNow } from "date-fns";

export default function TutorDashboardPage() {
  const [showUploadModal, setShowUploadModal] = useState<"course" | "pdf" | "video" | null>(null);
  const { profile } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await courseService.getTutorStats();
      setStatsData(data);
    } catch (error) {
      console.error("Failed to load tutor stats", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Students", value: statsData?.totalStudents || 0, trend: "Active", icon: Users, color: "blue" },
    { label: "Total Courses", value: statsData?.totalCourses || 0, trend: "Published", icon: BookOpen, color: "emerald" },
    { label: "Total Lessons", value: statsData?.totalLessons || 0, trend: "Uploaded", icon: Video, color: "purple" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {profile?.full_name?.split(' ')[0] || 'Tutor'}</h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with your students today.</p>
        </div>
        <button className="bg-card border border-border text-foreground/80 px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm">
          View Public Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div id="tutor-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowUploadModal("course")}
            className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-2xl hover:shadow-lg hover:shadow-blue-900/20 transition-all text-left relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-card/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-card/20 flex items-center justify-center backdrop-blur-sm relative z-10">
              <Upload className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="font-semibold text-lg">Upload Course</p>
              <p className="text-blue-100 text-sm mt-0.5">Create a full module</p>
            </div>
          </button>
          
          <button 
            onClick={() => setShowUploadModal("pdf")}
            className="flex items-center gap-4 bg-card border border-border text-foreground/80 p-5 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-rose-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Upload PDF</p>
              <p className="text-muted-foreground text-sm mt-0.5">Share notes & sheets</p>
            </div>
          </button>

          <button 
            onClick={() => setShowUploadModal("video")}
            className="flex items-center gap-4 bg-card border border-border text-foreground/80 p-5 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-purple-600">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Upload Video</p>
              <p className="text-muted-foreground text-sm mt-0.5">Share a recorded lecture</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Student Progress</h2>
            <button className="text-sm font-medium text-blue-700 hover:text-blue-800">View All</button>
          </div>
          
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : statsData?.recentPurchases?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent student enrollments.</div>
              ) : (
                statsData?.recentPurchases?.map((purchase: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        {purchase.student?.avatar_url ? (
                          <img src={purchase.student.avatar_url} alt={purchase.student.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-bold">{(purchase.student?.full_name || "S").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{purchase.student?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">Enrolled: {purchase.course?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">Purchased</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}</p>
                      </div>
                      <button className="p-2 hover:bg-slate-200 rounded-lg text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Courses</h2>
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground/80 hover:text-muted-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
            ) : statsData?.recentCourses?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No courses uploaded yet.</p>
            ) : (
              statsData?.recentCourses?.map((course: any) => (
                <div key={course.id} className="flex items-start gap-4">
                  <div className="w-12 pt-1 text-center shrink-0">
                    <p className="text-xs font-bold text-foreground">{new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className={`flex-1 ${course.status === 'published' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'} border rounded-xl p-3 min-w-0`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold text-sm truncate pr-2 ${course.status === 'published' ? 'text-emerald-900' : 'text-blue-900'}`}>{course.title}</p>
                    </div>
                    <p className={`text-xs capitalize ${course.status === 'published' ? 'text-emerald-700' : 'text-blue-700'}`}>{course.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upload Modals */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                Upload {showUploadModal === 'course' ? 'New Course' : showUploadModal.toUpperCase() + ' File'}
              </h3>
              <button 
                onClick={() => setShowUploadModal(null)}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground/80 hover:text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title</label>
                <input 
                  type="text" 
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none" 
                  placeholder="e.g., Advanced React Patterns"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">File Upload</label>
                <div className="border-2 border-dashed border-border bg-muted/50 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <Upload className="w-8 h-8 text-muted-foreground/80 group-hover:text-blue-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Click to browse or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    {showUploadModal === 'video' ? 'MP4, WebM up to 2GB' : 'PDF, ZIP up to 500MB'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setShowUploadModal(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Upload simulation completed!");
                  setShowUploadModal(null);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Upload Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
