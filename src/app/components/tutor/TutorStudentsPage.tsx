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
  Loader2,
} from "lucide-react";
import { courseService } from "../../../services/courseService";
import { useNavigate } from "react-router";
import BulkMessageModal from "./BulkMessageModal";



const statusConfig: Record<string, { label: string; className: string }> = {
  top: { label: "Top Performer", className: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "at-risk": { label: "At Risk", className: "bg-red-50 text-red-600 border-red-200" },
};

const filters = ["All Students", "Top Performers", "Active", "At Risk"];

export default function TutorStudentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Students");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await courseService.getTutorStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    { label: "Avg. Grade", value: students.length > 0 ? `${Math.round(students.reduce((a, s) => a + s.grade, 0) / students.length)}%` : "0%", icon: Award, color: "purple", trend: "+5%" },
    { label: "Avg. Progress", value: students.length > 0 ? `${Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)}%` : "0%", icon: TrendingUp, color: "emerald", trend: "+8%" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-1">Monitor student progress and engagement across all your courses.</p>
        </div>
        <button 
          onClick={() => setShowBulkMessage(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200"
        >
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
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
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
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusConfig[student.status].className}`}>
                      {statusConfig[student.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate('/app/tutor/messages', { state: { initialContact: { id: student.user_id, full_name: student.name, avatar_url: student.avatar, role: 'student' } } })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
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
      {/* Bulk Message Modal */}
      {showBulkMessage && (
        <BulkMessageModal
          onClose={() => setShowBulkMessage(false)}
          studentsCount={filtered.length}
          studentIds={filtered.map(s => s.user_id)}
        />
      )}
    </div>
  );
}
