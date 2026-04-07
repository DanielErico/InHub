import React, { useState } from "react";
import {
  Search,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
  MoreVertical,
  MessageSquare,
  BookOpen,
  Mail,
  Star,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

const students = [
  { id: 1, name: "Alex Johnson", email: "alex.j@email.com", avatar: 11, course: "Advanced React Patterns", progress: 88, grade: 94, lastActive: "2h ago", status: "active", streak: 14 },
  { id: 2, name: "Maria Santos", email: "maria.s@email.com", avatar: 12, course: "System Design Fundamentals", progress: 62, grade: 78, lastActive: "5h ago", status: "active", streak: 7 },
  { id: 3, name: "James Liu", email: "james.l@email.com", avatar: 13, course: "Advanced React Patterns", progress: 45, grade: 65, lastActive: "2d ago", status: "at-risk", streak: 2 },
  { id: 4, name: "Aisha Patel", email: "aisha.p@email.com", avatar: 14, course: "Node.js Microservices", progress: 95, grade: 97, lastActive: "1h ago", status: "top", streak: 30 },
  { id: 5, name: "Carlos Mendez", email: "carlos.m@email.com", avatar: 15, course: "System Design Fundamentals", progress: 71, grade: 82, lastActive: "3h ago", status: "active", streak: 9 },
  { id: 6, name: "Sophie Wright", email: "sophie.w@email.com", avatar: 16, course: "Docker & Kubernetes", progress: 33, grade: 55, lastActive: "5d ago", status: "at-risk", streak: 0 },
  { id: 7, name: "Kwame Asante", email: "kwame.a@email.com", avatar: 17, course: "Advanced React Patterns", progress: 79, grade: 88, lastActive: "1d ago", status: "active", streak: 5 },
  { id: 8, name: "Yuki Tanaka", email: "yuki.t@email.com", avatar: 18, course: "Node.js Microservices", progress: 100, grade: 98, lastActive: "4h ago", status: "top", streak: 21 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  top: { label: "Top Performer", className: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "at-risk": { label: "At Risk", className: "bg-red-50 text-red-600 border-red-200" },
};

const filters = ["All Students", "Top Performers", "Active", "At Risk"];

export default function TutorStudentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Students");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All Students" ||
      (activeFilter === "Top Performers" && s.status === "top") ||
      (activeFilter === "Active" && s.status === "active") ||
      (activeFilter === "At Risk" && s.status === "at-risk");
    return matchSearch && matchFilter;
  });

  const summaryStats = [
    { label: "Total Students", value: students.length.toString(), icon: Users, color: "blue", trend: "+12%" },
    { label: "Avg. Grade", value: `${Math.round(students.reduce((a, s) => a + s.grade, 0) / students.length)}%`, icon: Award, color: "purple", trend: "+5%" },
    { label: "Avg. Progress", value: `${Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)}%`, icon: TrendingUp, color: "emerald", trend: "+8%" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-1">Monitor student progress and engagement across all your courses.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200">
          <Mail className="w-4 h-4" />
          Message All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground/80" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
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

      {/* Student Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Student</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Course</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Progress</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Grade</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Streak</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?img=${student.avatar}`} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground/80">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-foreground/80 max-w-[180px] truncate">{student.course}</p>
                    <p className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {student.lastActive}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${student.progress >= 80 ? "bg-emerald-500" : student.progress >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className={`w-4 h-4 ${student.grade >= 90 ? "text-amber-400" : "text-slate-300"}`} />
                      <span className="text-sm font-semibold text-foreground">{student.grade}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-sm font-bold ${student.streak >= 14 ? "text-amber-500" : student.streak >= 7 ? "text-blue-600" : "text-muted-foreground/80"}`}>
                      🔥 {student.streak}d
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusConfig[student.status].className}`}>
                      {statusConfig[student.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-muted-foreground/80 hover:text-blue-600 transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground/80 hover:text-muted-foreground transition-colors" title="View Profile">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No students found</p>
            <p className="text-muted-foreground/80 text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
