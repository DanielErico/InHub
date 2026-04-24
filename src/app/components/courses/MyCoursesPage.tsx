import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Play, Loader2, Library, Clock } from "lucide-react";
import { courseService } from "../../../services/courseService";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const categoryColors: Record<string, string> = {
  Development: "bg-blue-200 text-blue-900 border-blue-400",
  "Data Science": "bg-violet-100 text-violet-700 border-violet-200",
  Design: "bg-pink-100 text-pink-700 border-pink-200",
  Marketing: "bg-amber-100 text-amber-700 border-amber-200",
};

const ringColors: Record<string, string> = {
  Development: "ring-blue-400",
  "Data Science": "ring-violet-200",
  Design: "ring-pink-200",
  Marketing: "ring-amber-200",
};

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getPurchasedCourses();
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching purchased courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl text-foreground mb-1 flex items-center gap-2">
            <Library className="w-6 h-6 text-blue-700" />
            My Courses
          </h1>
          <p className="text-muted-foreground text-sm">Courses you have enrolled in and purchased</p>
        </div>
        <button
          onClick={() => navigate("/app/courses")}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <BookOpen className="w-4 h-4" />
          Browse More
        </button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't purchased or enrolled in any courses. Browse our catalog to start learning!
          </p>
          <button
            onClick={() => navigate("/app/courses")}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/app/course/${course.id}/play`)}
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
                <h3 className="text-foreground text-sm font-semibold mb-2 leading-snug line-clamp-2">{course.title}</h3>
                
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

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {course.duration || 'Self-paced'}
                </div>

                {/* Progress Bar (Mocked for now) */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="text-blue-700 font-bold">0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `0%` }}></div>
                  </div>
                </div>

                {/* Button */}
                <button className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
