import React, { useState } from "react";
import {
  Calendar,
  Video,
  Users,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  BookOpen,
  Bell,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const sessions = [
  {
    id: "s1",
    title: "1-on-1 Mentoring",
    student: "Alex Johnson",
    type: "mentoring",
    date: "2026-04-09",
    time: "09:00",
    endTime: "09:30",
    duration: "30 min",
    color: "blue",
  },
  {
    id: "s2",
    title: "Live Masterclass: System Design",
    student: "All Students (45)",
    type: "live",
    date: "2026-04-09",
    time: "13:30",
    endTime: "14:15",
    duration: "45 min",
    color: "purple",
  },
  {
    id: "s3",
    title: "Assignment Review",
    student: "Maria Santos",
    type: "review",
    date: "2026-04-10",
    time: "11:00",
    endTime: "11:30",
    duration: "30 min",
    color: "emerald",
  },
  {
    id: "s4",
    title: "React Patterns Workshop",
    student: "Group (12 students)",
    type: "workshop",
    date: "2026-04-11",
    time: "14:00",
    endTime: "15:30",
    duration: "90 min",
    color: "amber",
  },
  {
    id: "s5",
    title: "Office Hours",
    student: "Open",
    type: "office",
    date: "2026-04-14",
    time: "10:00",
    endTime: "11:00",
    duration: "60 min",
    color: "sky",
  },
  {
    id: "s6",
    title: "1-on-1 Mentoring",
    student: "Yuki Tanaka",
    type: "mentoring",
    date: "2026-04-15",
    time: "09:00",
    endTime: "09:30",
    duration: "30 min",
    color: "blue",
  },
];

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  mentoring: { icon: Users, label: "1-on-1" },
  live: { icon: Video, label: "Live" },
  workshop: { icon: BookOpen, label: "Workshop" },
  review: { icon: CheckCircle2, label: "Review" },
  office: { icon: Bell, label: "Office Hours" },
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  sky: "bg-sky-50 border-sky-200 text-sky-800",
};

const dotMap: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
};

export default function TutorSchedulePage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getSessionsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sessions.filter(s => s.date === dateStr);
  };

  const selectedSessions = selectedDate
    ? sessions.filter(s => s.date === selectedDate)
    : sessions.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).sort((a, b) => a.date.localeCompare(b.date));

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your sessions, classes, and office hours.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Add Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-6">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground/80 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const daySessions = getSessionsForDate(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-blue-700 text-white shadow-sm"
                      : isToday
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {day}
                  {daySessions.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {daySessions.slice(0, 3).map((s, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-card/70" : dotMap[s.color]}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border flex-wrap">
            {Object.entries(typeConfig).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${dotMap[Object.keys(dotMap)[Object.keys(typeConfig).indexOf(key)]] || "bg-slate-400"}`} />
                {val.label}
              </div>
            ))}
          </div>
        </div>

        {/* Session List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {selectedDate ? formatDisplayDate(selectedDate) : "All Sessions This Month"}
            </h2>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="text-xs text-muted-foreground/80 hover:text-muted-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {selectedSessions.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium text-sm">No sessions scheduled</p>
              <button onClick={() => setShowAddModal(true)} className="mt-3 text-blue-700 text-xs font-medium hover:underline">
                Add a session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedSessions.map((s) => {
                const TypeIcon = typeConfig[s.type]?.icon || Calendar;
                return (
                  <div key={s.id} className={`bg-card rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${colorMap[s.color]} border-l-4`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${colorMap[s.color]}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{s.title}</p>
                          <p className="text-xs opacity-80 mt-0.5">{s.student}</p>
                          {!selectedDate && (
                            <p className="text-xs opacity-70 mt-0.5">{formatDisplayDate(s.date)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">{s.time}</p>
                        <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {s.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Add New Session</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Session Title</label>
                <input type="text" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none" placeholder="e.g., 1-on-1 Mentoring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Date</label>
                  <input type="date" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Time</label>
                  <input type="time" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Session Type</label>
                <select className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card">
                  <option value="mentoring">1-on-1 Mentoring</option>
                  <option value="live">Live Masterclass</option>
                  <option value="workshop">Workshop</option>
                  <option value="review">Assignment Review</option>
                  <option value="office">Office Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Duration</label>
                <select className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card">
                  <option>30 min</option>
                  <option>45 min</option>
                  <option>60 min</option>
                  <option>90 min</option>
                  <option>120 min</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { alert("Session added!"); setShowAddModal(false); }}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
