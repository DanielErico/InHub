import React, { useState } from "react";
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
} from "lucide-react";
import { assignments, notifications } from "../../data/mockData";

export default function TutorDashboardPage() {
  const [showUploadModal, setShowUploadModal] = useState<"course" | "pdf" | "video" | null>(null);

  const stats = [
    { label: "Active Students", value: "342", trend: "+12%", icon: Users, color: "blue" },
    { label: "Course Completions", value: "89", trend: "+24%", icon: TrendingUp, color: "emerald" },
    { label: "Hours Taught", value: "1,240", trend: "+18%", icon: Clock, color: "purple" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Dr. Jenkins</h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with your students today.</p>
        </div>
        <button className="bg-card border border-border text-foreground/80 px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm">
          View Public Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                      alt="Student" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">Student Name {i}</p>
                      <p className="text-xs text-muted-foreground">Completed React Basics - Module {i}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">92% Grade</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <button className="p-2 hover:bg-slate-200 rounded-lg text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Upcoming Schedule</h2>
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground/80 hover:text-muted-foreground transition-colors">
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 pt-1 text-center">
                <p className="text-xs font-bold text-foreground">09:00</p>
                <p className="text-[10px] text-muted-foreground/80 uppercase">AM</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-blue-900 text-sm">1-on-1 Mentoring</p>
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-700">with Alex Johnson</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 pt-1 text-center">
                <p className="text-xs font-bold text-foreground">01:30</p>
                <p className="text-[10px] text-muted-foreground/80 uppercase">PM</p>
              </div>
              <div className="flex-1 bg-purple-50 border border-purple-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-purple-900 text-sm">Live Masterclass</p>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-purple-700">System Design Basics • 45 Enrolled</p>
              </div>
            </div>
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
