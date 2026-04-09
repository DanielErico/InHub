import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Star, Clock, Play, CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { courseService } from "../../../services/courseService";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const categories = ["All", "Development", "Data Science", "Design", "Marketing"];

const categoryColors: Record<string, string> = {
  Development: "bg-blue-200 text-blue-900 border-blue-400",
  "Data Science": "bg-violet-100 text-violet-700 border-violet-200",
  Design: "bg-pink-100 text-pink-700 border-pink-200",
  Marketing: "bg-amber-100 text-amber-700 border-amber-200",
};

const progressBarColors: Record<string, string> = {
  Development: "bg-blue-700",
  "Data Science": "bg-violet-500",
  Design: "bg-pink-500",
  Marketing: "bg-amber-500",
};

const ringColors: Record<string, string> = {
  Development: "ring-blue-400",
  "Data Science": "ring-violet-200",
  Design: "ring-pink-200",
  Marketing: "ring-amber-200",
};

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllPublishedCourses();
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching published courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses
    .filter((c) => {
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.users?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return -1; // Add rating logic if we add rating column
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-foreground mb-1">Available Courses</h1>
          <p className="text-muted-foreground text-sm">Explore courses created by our expert tutors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or tutors..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground/80" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
          >
            <option value="title">Sort by Title</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-blue-700 text-white shadow-sm shadow-blue-400"
                : "bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses found matching your criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/app/course/${course.id}`)}
              className={`bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group ring-2 ring-transparent hover:${ringColors[course.category] || "ring-blue-400"}`}
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden bg-slate-100 flex items-center justify-center">
                {course.thumbnail_url ? (
                  <ImageWithFallback
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-card/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 text-blue-700 fill-blue-700" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${categoryColors[course.category] || "bg-muted text-muted-foreground"}`}>
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-foreground text-sm font-semibold mb-2 leading-snug truncate">{course.title}</h3>
                {/* Tutor row with avatar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    {course.users?.avatar_url ? (
                      <img src={course.users.avatar_url} alt={course.users.full_name ?? "Tutor"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-[9px] font-bold">
                        {(course.users?.full_name ?? "T").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground/80 text-xs truncate">{course.users?.full_name || "Unknown Tutor"}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-muted-foreground font-medium">4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration || '0h'}
                  </div>
                </div>

                {/* Button */}
                <button className="w-full mt-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 bg-blue-700 text-white hover:bg-blue-800 shadow-sm shadow-blue-200">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
