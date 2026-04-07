import React, { useState } from "react";
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
} from "lucide-react";

const tutorCourses = [
  {
    id: "1",
    title: "Advanced React Patterns",
    category: "Development",
    status: "published",
    students: 142,
    rating: 4.9,
    lessons: 18,
    duration: "24h",
    revenue: "$3,120",
    thumbnail: "https://images.unsplash.com/photo-1669023414171-56f0740e34cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "2 days ago",
    color: "sky",
  },
  {
    id: "2",
    title: "System Design Fundamentals",
    category: "Engineering",
    status: "published",
    students: 98,
    rating: 4.8,
    lessons: 22,
    duration: "30h",
    revenue: "$2,450",
    thumbnail: "https://images.unsplash.com/photo-1634464660153-468d44306ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "1 week ago",
    color: "violet",
  },
  {
    id: "3",
    title: "TypeScript for Professionals",
    category: "Development",
    status: "draft",
    students: 0,
    rating: 0,
    lessons: 12,
    duration: "16h",
    revenue: "$0",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "3 days ago",
    color: "amber",
  },
  {
    id: "4",
    title: "Node.js Microservices",
    category: "Backend",
    status: "published",
    students: 76,
    rating: 4.7,
    lessons: 20,
    duration: "28h",
    revenue: "$1,890",
    thumbnail: "https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "4 days ago",
    color: "emerald",
  },
  {
    id: "5",
    title: "GraphQL API Design",
    category: "Development",
    status: "review",
    students: 0,
    rating: 0,
    lessons: 14,
    duration: "18h",
    revenue: "$0",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "1 day ago",
    color: "pink",
  },
  {
    id: "6",
    title: "Docker & Kubernetes Essentials",
    category: "DevOps",
    status: "published",
    students: 54,
    rating: 4.6,
    lessons: 16,
    duration: "20h",
    revenue: "$1,340",
    thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    lastUpdated: "5 days ago",
    color: "blue",
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  review: { label: "In Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

const filters = ["All", "Published", "Draft", "In Review"];

type UploadType = "course" | "pdf" | "video" | null;

export default function TutorContentPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState<UploadType>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = tutorCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Published" && c.status === "published") ||
      (activeFilter === "Draft" && c.status === "draft") ||
      (activeFilter === "In Review" && c.status === "review");
    return matchSearch && matchFilter;
  });

  const summaryStats = [
    { label: "Total Courses", value: tutorCourses.length.toString(), icon: BookOpen, color: "blue" },
    { label: "Total Students", value: tutorCourses.reduce((a, c) => a + c.students, 0).toString(), icon: Users, color: "purple" },
    { label: "Total Revenue", value: "$8,800", icon: TrendingUp, color: "emerald" },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div key={course.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md hover:border-border transition-all group">
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusConfig[course.status].className}`}>
                {statusConfig[course.status].label}
              </span>
              {/* Menu */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                  className="p-1.5 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                {openMenu === course.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-card rounded-xl shadow-lg border border-border z-10 overflow-hidden">
                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors">
                      <Eye className="w-4 h-4 text-muted-foreground/80" /> Preview
                    </button>
                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors">
                      <Edit3 className="w-4 h-4 text-blue-500" /> Edit
                    </button>
                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{course.category}</span>
              <h3 className="font-bold text-foreground mt-2 mb-3 leading-snug">{course.title}</h3>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {course.lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {course.duration}
                </span>
                {course.status === "published" && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> {course.rating}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-muted-foreground/80" />
                  <span className="text-sm font-semibold text-foreground">{course.students}</span>
                  <span className="text-xs text-muted-foreground">students</span>
                </div>
                <div className="text-sm font-bold text-emerald-600">{course.revenue}</div>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {showUploadModal === "course" ? "Create New Course" : "Upload PDF Resource"}
              </h3>
              <button onClick={() => setShowUploadModal(null)} className="p-2 hover:bg-muted rounded-full text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title</label>
                <input type="text" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none" placeholder="e.g., Advanced React Patterns" />
              </div>
              {showUploadModal === "course" && (
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Category</label>
                  <div className="relative">
                    <select className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none appearance-none bg-card">
                      <option>Development</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>DevOps</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {showUploadModal === "course" ? "Course Thumbnail" : "PDF File"}
                </label>
                <div className="border-2 border-dashed border-border bg-muted/50 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <Upload className="w-8 h-8 text-muted-foreground/80 group-hover:text-blue-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Click to browse or drag & drop</p>
                  <p className="text-xs text-muted-foreground">{showUploadModal === "course" ? "PNG, JPG up to 5MB" : "PDF up to 100MB"}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowUploadModal(null)} className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { alert("Course created!"); setShowUploadModal(null); }}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                {showUploadModal === "course" ? "Create Course" : "Upload PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
