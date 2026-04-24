import { useEffect, useState } from "react";
import { FileText, MessageSquare, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../../../../lib/supabase";

interface DailyPoint {
  date: string;
  lessons: number;
  courses: number;
  users: number;
}

interface CourseActivity {
  title: string;
  lessons: number;
}

export function AIAnalyticsPage() {
  const [totalLessons, setTotalLessons] = useState<number | null>(null);
  const [totalCourses, setTotalCourses] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [topCourses, setTopCourses] = useState<CourseActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Parallel queries
        const [lessonsRes, coursesRes, usersRes, lessonListRes, courseListRes] =
          await Promise.all([
            supabase
              .from("lessons")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("courses")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("users")
              .select("id", { count: "exact", head: true }),
            // Raw lessons for daily trend
            supabase
              .from("lessons")
              .select("created_at")
              .order("created_at", { ascending: false })
              .limit(500),
            // Courses with lesson counts for top-courses list
            supabase
              .from("courses")
              .select("title, lessons(id)")
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

        setTotalLessons(lessonsRes.count ?? 0);
        setTotalCourses(coursesRes.count ?? 0);
        setTotalUsers(usersRes.count ?? 0);

        // Build last-7-days trend from lesson creation dates
        const now = new Date();
        const days: DailyPoint[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          days.push({
            date: d.toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
            }),
            lessons: 0,
            courses: 0,
            users: 0,
          });
        }

        (lessonListRes.data ?? []).forEach((l) => {
          const lessonDate = new Date(l.created_at);
          days.forEach((day, idx) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - idx));
            if (
              lessonDate.getFullYear() === d.getFullYear() &&
              lessonDate.getMonth() === d.getMonth() &&
              lessonDate.getDate() === d.getDate()
            ) {
              day.lessons++;
            }
          });
        });

        setDailyData(days);

        // Top courses by lesson count
        const sorted = (courseListRes.data ?? [])
          .map((c: any) => ({
            title: c.title,
            lessons: Array.isArray(c.lessons) ? c.lessons.length : 0,
          }))
          .sort((a, b) => b.lessons - a.lessons)
          .slice(0, 4);

        setTopCourses(sorted);
      } catch (err) {
        console.error("AI Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      name: "Total Lessons",
      value: loading ? "—" : (totalLessons ?? 0).toLocaleString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Total Courses",
      value: loading ? "—" : (totalCourses ?? 0).toLocaleString(),
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Registered Users",
      value: loading ? "—" : (totalUsers ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.name} className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lesson Activity Trend */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Lesson Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[400px] text-gray-400 text-sm">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="lessons"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Lessons Added"
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Courses by Lesson Count */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Top Courses by Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : topCourses.length === 0 ? (
              <p className="text-sm text-gray-400">No courses yet</p>
            ) : (
              <div className="space-y-4">
                {topCourses.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 truncate max-w-[70%]">
                      {item.title}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.lessons} lesson{item.lessons !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Summary */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Platform Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Lessons per Course (avg)",
                  value:
                    loading || !totalCourses || totalCourses === 0
                      ? "—"
                      : ((totalLessons ?? 0) / totalCourses).toFixed(1),
                  pct: 100,
                },
                {
                  label: "Courses per Tutor (avg)",
                  value: "—",
                  pct: 60,
                },
                {
                  label: "Content Coverage",
                  value: loading
                    ? "—"
                    : `${totalCourses} courses`,
                  pct: Math.min(((totalCourses ?? 0) / 20) * 100, 100),
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
