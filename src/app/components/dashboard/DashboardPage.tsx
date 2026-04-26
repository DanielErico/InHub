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
  Hand,
  CheckCircle2,
  Library,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { courseService, Assignment, ScheduleSession } from "../../../services/courseService";
import { useUserProfile } from "../../context/UserProfileContext";

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

function formatSessionTime(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ampm}`;
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getPendingAssignments(assignments: Assignment[]): Assignment[] {
  return assignments.filter((a) => {
    const hasSubmission = (a.assignment_submissions || []).length > 0;
    return !hasSubmission;
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [publishedCourses, setPublishedCourses] = useState<any[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    loadDashboard();
  }, [profile?.id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [coursesData, purchasedData, assignmentsData, sessionsData, progressVal] = await Promise.all([
        courseService.getAllPublishedCourses(),
        courseService.getPurchasedCourses(),
        courseService.getAssignments(profile!.id),
        courseService.getScheduleSessions(profile!.id),
        courseService.getOverallProgress(profile!.id),
      ]);
      setPublishedCourses(coursesData || []);
      setPurchasedCourses(purchasedData || []);
      setAssignments(assignmentsData || []);
      setSessions(sessionsData || []);
      setOverallProgress(progressVal);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const pendingAssignments = getPendingAssignments(assignments);
  const nextSession = sessions.length > 0 ? sessions[0] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-foreground mb-1 flex items-center gap-2">
            Welcome back, {firstName}!
            <Hand className="w-6 h-6 text-amber-400 inline-block" />
          </h1>
          <p className="text-muted-foreground text-sm">
            Keep up the great work and continue your learning journey!
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
          <p className="text-2xl text-foreground mb-0.5">{publishedCourses.length}</p>
          <p className="text-muted-foreground text-xs">Available Courses</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-900/30">
              <Flame className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <p className="text-2xl text-foreground mb-0.5">0</p>
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
          {/* Progress Card */}
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
                <div className="flex items-center gap-4 text-xs text-blue-200">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {0} lessons done
                  </span>
                  <span className="flex items-center gap-1">
                    <Library className="w-3.5 h-3.5 text-blue-300" />
                    {publishedCourses.length} courses available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div id="student-courses">
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
              {purchasedCourses.slice(0, 3).map((course) => (
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
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          {course.users?.avatar_url ? (
                            <img src={course.users.avatar_url} alt={course.users.full_name ?? "Tutor"} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-[8px] font-bold">
                              {(course.users?.full_name ?? "T").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">{course.users?.full_name || "Tutor"}</p>
                      </div>
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
              {purchasedCourses.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-xl">
                  You haven't purchased any courses yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Next Session */}
          <div id="student-schedule" className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-foreground text-sm font-semibold">Next Session</h3>
            </div>

            {nextSession ? (
              <>
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-800 dark:text-blue-200 text-xs font-medium uppercase tracking-wide">UPCOMING</span>
                  </div>
                  <h4 className="text-foreground text-sm font-semibold mb-1">{nextSession.title}</h4>
                  <p className="text-muted-foreground text-xs mb-3">{nextSession.courses?.title || "General"}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSessionTime(nextSession.scheduled_at)}
                    </div>
                    <span>•</span>
                    <span>{nextSession.duration_minutes > 0 ? `${nextSession.duration_minutes}min` : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {(nextSession.users?.full_name || "I").split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span>{nextSession.users?.full_name || "Instructor"}</span>
                </div>
                <button
                  onClick={() => navigate("/app/schedule")}
                  className="w-full bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  View Schedule
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No upcoming sessions</p>
                <button
                  onClick={() => navigate("/app/schedule")}
                  className="mt-3 w-full bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  View Schedule
                </button>
              </div>
            )}
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
              Stay consistent — even 30 minutes of focused learning per day compounds over time. Pick a course and make progress today!
            </p>
            <button
              onClick={() => navigate("/app/courses")}
              className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 text-xs font-medium hover:text-violet-700"
            >
              Browse courses <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div id="student-assignments" className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h3 className="text-foreground text-sm font-semibold mb-4">Upcoming Deadlines</h3>
            {pendingAssignments.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-2">No pending assignments 🎉</p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map((assignment) => {
                  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => navigate("/app/assignments")}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? "bg-red-400" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-xs font-medium truncate group-hover:text-blue-800 transition-colors">
                          {assignment.title}
                        </p>
                        <p className="text-muted-foreground text-xs">Due {formatDueDate(assignment.due_date)}</p>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => navigate("/app/assignments")}
                  className="text-blue-700 dark:text-blue-400 text-xs hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  View all assignments <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
