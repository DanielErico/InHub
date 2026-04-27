import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, GraduationCap, UserCheck, BookOpen, Wallet, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../../../../lib/supabase";

interface Stats {
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
}

interface GrowthPoint {
  month: string;
  users: number;
}

interface EngagementPoint {
  course: string;
  students: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTutors: 0,
    totalCourses: 0,
  });
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch counts in parallel
        const [studentsRes, tutorsRes, coursesRes, usersRes, courseListRes] =
          await Promise.all([
            supabase
              .from("users")
              .select("id", { count: "exact", head: true })
              .ilike("role", "student"),
            supabase
              .from("users")
              .select("id", { count: "exact", head: true })
              .ilike("role", "tutor"),
            supabase
              .from("courses")
              .select("id", { count: "exact", head: true }),
            // Fetch all users for growth chart
            supabase.from("users").select("created_at").order("created_at"),
            // Fetch courses for engagement chart (by category)
            supabase.from("courses").select("category, title"),
          ]);

        setStats({
          totalStudents: studentsRes.count ?? 0,
          totalTutors: tutorsRes.count ?? 0,
          totalCourses: coursesRes.count ?? 0,
        });

        // Build user growth by month (last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const monthMap: Record<string, number> = {};

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthMap[`${d.getFullYear()}-${d.getMonth()}`] = 0;
        }

        (usersRes.data ?? []).forEach((u) => {
          const d = new Date(u.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (key in monthMap) monthMap[key]++;
        });

        const growth: GrowthPoint[] = Object.entries(monthMap).map(([key, count]) => {
          const [year, month] = key.split("-").map(Number);
          return { month: monthNames[month], users: count };
        });

        // Cumulate for a growth line
        let cumulative = 0;
        const cumulativeGrowth = growth.map((g) => {
          cumulative += g.users;
          return { month: g.month, users: cumulative };
        });

        setGrowthData(cumulativeGrowth);

        // Build engagement by category
        const categoryMap: Record<string, number> = {};
        (courseListRes.data ?? []).forEach((c) => {
          const cat = c.category || "Other";
          categoryMap[cat] = (categoryMap[cat] ?? 0) + 1;
        });

        const engagement: EngagementPoint[] = Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([cat, count]) => ({ course: cat, students: count }));

        setEngagementData(engagement);
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      name: "Total Students",
      value: loading ? "—" : stats.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Total Tutors",
      value: loading ? "—" : stats.totalTutors.toLocaleString(),
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Registered Users",
      value: loading
        ? "—"
        : (stats.totalStudents + stats.totalTutors).toLocaleString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Total Courses",
      value: loading ? "—" : stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/app/admin/finance" className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-xl font-bold mb-1">Finance & Withdrawals</h3>
          <p className="text-blue-100 text-sm">Review platform revenue, export purchases, and approve tutor withdrawals.</p>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">User Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                Loading chart...
              </div>
            ) : growthData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                    name="Total Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Courses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                Loading chart...
              </div>
            ) : engagementData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                No courses yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="course" stroke="#888" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Courses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
