import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  TrendingUp,
  Clock,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  Play,
  CalendarDays,
  Zap,
  ChevronRight,
} from "lucide-react";
import { courses, scheduleItems, assignments } from "../../data/mockData";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { courseService } from "../../../services/courseService";
import { supabase } from "../../../lib/supabase";

function CircularProgress({ percentage, size = 88 }: { percentage: number; size?: number }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E0F2FE" strokeWidth="7" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="7"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        className="text-foreground"
        fontSize="13"
        fontWeight="600"
      >
        {percentage}%
      </text>
    </svg>
  );
}

const categoryColors: Record<string, string> = {
  Development: "bg-blue-200 text-blue-900",
  "Data Science": "bg-violet-100 text-violet-700",
  Design: "bg-pink-100 text-pink-700",
  Marketing: "bg-amber-100 text-amber-700",
};

const progressColors: Record<string, string> = {
  Development: "bg-blue-700",
  "Data Science": "bg-violet-500",
  Design: "bg-pink-500",
  Marketing: "bg-amber-500",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [publishedCourses, setPublishedCourses] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState({ firstName: 'Student', streak: 4 });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          if (data) {
            setActiveUser(prev => ({ ...prev, firstName: data.full_name?.split(' ')[0] || 'Student' }));
          }
        }
        
        // Fetch real active courses created by tutors
        const coursesData = await courseService.getAllPublishedCourses();
        setPublishedCourses(coursesData || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    }
    loadDashboard();
  }, []);

  const activeCourses = publishedCourses;
  const pendingAssignments = assignments.filter((a) => a.status === "pending");
  const nextSession = scheduleItems[0];
  const overallProgress = 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-foreground mb-1">
            Welcome back, {activeUser.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            You're on a <span className="text-amber-500 font-semibold">{activeUser.streak}-day streak</span> — keep it up!
          </p>
        </div>
        <button
          onClick={() => navigate("/app/courses")}
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200 self-start sm:self-auto"
        >
          <Play className="w-4 h-4" />
          Continue Learning
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">+8%</span>
          </div>
          <p className="text-2xl text-foreground mb-0.5">{overallProgress}%</p>
          <p className="text-muted-foreground text-xs">Overall Progress</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-500 dark:text-violet-400" />
            </div>
          </div>
          <p className="text-2xl text-foreground mb-0.5">{activeCourses.length}</p>
          <p className="text-muted-foreground text-xs">Active Courses</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full font-medium">🔥</span>
          </div>
          <p className="text-2xl text-foreground mb-0.5">{activeUser.streak}</p>
          <p className="text-muted-foreground text-xs">Day Streak</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl text-foreground mb-0.5">{pendingAssignments.length}</p>
          <p className="text-muted-foreground text-xs">Pending Tasks</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Progress Card */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-card/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-card/10 rounded-full translate-y-1/2" />
            <div className="relative flex items-center gap-6">
              <CircularProgress percentage={overallProgress} size={96} />
              <div>
                <h3 className="text-white text-lg mb-1">Learning Progress</h3>
                <p className="text-blue-200 text-sm mb-3">
                  You've completed <strong>{overallProgress}%</strong> of your enrolled curriculum
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-400">
                  <span>✅ {0} lessons done</span>
                  <span>📚 {publishedCourses.length} courses available</span>
                </div>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground text-lg">My Courses</h2>
              <button
                onClick={() => navigate("/app/courses")}
                className="text-blue-700 dark:text-blue-400 text-sm hover:text-blue-800 flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {publishedCourses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/app/course/${course.id}`)}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <ImageWithFallback
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-foreground text-sm font-medium truncate">{course.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[course.category] || "bg-muted text-muted-foreground"}`}>
                          {course.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-2">{course.users?.full_name || "Tutor"}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${progressColors[course.category] || "bg-blue-700"}`}
                            style={{ width: `0%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {publishedCourses.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-xl">
                  No published courses available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Next Session */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-foreground text-sm font-semibold">Next Session</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-800 dark:text-blue-200 text-xs font-medium uppercase tracking-wide">LIVE</span>
              </div>
              <h4 className="text-foreground text-sm font-semibold mb-1">{nextSession.title}</h4>
              <p className="text-muted-foreground text-xs mb-3">{nextSession.course}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {nextSession.time}
                </div>
                <span>•</span>
                <span>{nextSession.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {nextSession.tutor.split(" ").map((n) => n[0]).join("")}
              </div>
              <span>{nextSession.tutor}</span>
            </div>
            <button
              onClick={() => navigate("/app/schedule")}
              className="w-full bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Join Session
            </button>
          </div>

          {/* AI Tip */}
          <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-900/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-foreground text-sm font-semibold">AI Study Tip</h3>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed mb-3">
              Based on your progress, you should focus on <strong>React Hooks</strong> today. You're 68% through the web dev course — just 2 more lessons to the next milestone!
            </p>
            <button
              onClick={() => navigate("/app/course/1")}
              className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 text-xs font-medium hover:text-violet-700"
            >
              Continue learning <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h3 className="text-foreground text-sm font-semibold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {pendingAssignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate("/app/assignments")}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    assignment.priority === "high" ? "bg-red-400" :
                    assignment.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-medium truncate group-hover:text-blue-800 transition-colors">
                      {assignment.title}
                    </p>
                    <p className="text-muted-foreground text-xs">Due {assignment.dueDate}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate("/app/assignments")}
                className="text-blue-700 dark:text-blue-400 text-xs hover:text-blue-800 flex items-center gap-1 mt-1"
              >
                View all assignments <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
