import React, { useState, useEffect } from "react";
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
  Star,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { courseService, scheduleService, ScheduleSession, Course } from "../../../services/courseService";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  live: { icon: Video, label: "Live Teaching" },
  qna: { icon: HelpCircle, label: "Q&A / Doubt-Clearing" },
  review: { icon: CheckCircle2, label: "Project Review" },
  workshop: { icon: BookOpen, label: "Workshop" },
  guest: { icon: Star, label: "Guest Session" },
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

const colorOptions = ["blue", "purple", "emerald", "amber", "sky"];

// Helper to extract local date strings from WAT timezone explicitly
function getWATDateParts(dateString: string) {
  const d = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // parts will contain something like "04/09/2026, 14:00"
  const formatted = formatter.format(d);
  const [datePart, timePart] = formatted.split(', ');
  const [month, day, year] = datePart.split('/');
  return {
    date: `${year}-${month}-${day}`,
    time: timePart, // "14:00"
    hour12: new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
  };
}

export default function TutorSchedulePage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    date: "",
    time: "",
    type: "live" as any,
    duration_minutes: 60,
    meeting_url: "",
    color: "blue"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedSessions, fetchedCourses] = await Promise.all([
        scheduleService.getTutorScheduleSessions(),
        courseService.getTutorCourses()
      ]);
      setSessions(fetchedSessions);
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Failed to load schedule data", err);
    } finally {
      setLoading(false);
    }
  };

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
    return sessions.filter(s => getWATDateParts(s.scheduled_at).date === dateStr);
  };

  const selectedSessions = selectedDate
    ? sessions.filter(s => getWATDateParts(s.scheduled_at).date === selectedDate)
    : sessions.filter(s => {
        const parts = getWATDateParts(s.scheduled_at);
        const d = new Date(parts.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).sort((a, b) => getWATDateParts(a.scheduled_at).date.localeCompare(getWATDateParts(b.scheduled_at).date));

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const handleAddSession = async () => {
    if (!formData.title || !formData.course_id || !formData.date || !formData.time) {
      alert("Please fill out all required fields (Title, Course, Date, Time).");
      return;
    }

    try {
      setSaving(true);
      // Construct UTC time out of the entered WAT date/time
      // Note: WAT is UTC+1. So we subtract 1 hour to get UTC, or we can just pass the string with +01:00 offset
      const scheduled_at = `${formData.date}T${formData.time}:00+01:00`;
      
      await scheduleService.createScheduleSession({
        title: formData.title,
        course_id: formData.course_id,
        type: formData.type,
        scheduled_at,
        duration_minutes: Number(formData.duration_minutes),
        meeting_url: formData.meeting_url || null,
        color: formData.color
      });

      setShowAddModal(false);
      setFormData({
        title: "",
        course_id: "",
        date: "",
        time: "",
        type: "live",
        duration_minutes: 60,
        meeting_url: "",
        color: "blue"
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-blue-700" /></div>;
  }

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
                const parts = getWATDateParts(s.scheduled_at);
                
                return (
                  <div key={s.id} className={`bg-card rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${colorMap[s.color]} border-l-4`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${colorMap[s.color]}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate pr-2">{s.title}</p>
                          <p className="text-xs opacity-80 mt-0.5 truncate">{s.courses?.title}</p>
                          {!selectedDate && (
                            <p className="text-xs opacity-70 mt-0.5">{formatDisplayDate(parts.date)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">{parts.hour12} <span className="opacity-70 text-[10px]">WAT</span></p>
                        <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5 justify-end">
                          <Clock className="w-3 h-3" /> {s.duration_minutes}m
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
          <div className="bg-card rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Schedule New Session</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground/80 hover:text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Session Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(f => ({...f, title: e.target.value}))}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card" 
                  placeholder="e.g., Live Masterclass" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Select Course</label>
                <select 
                  value={formData.course_id}
                  onChange={e => setFormData(f => ({...f, course_id: e.target.value}))}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card"
                >
                  <option value="" disabled>Select a course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(f => ({...f, date: e.target.value}))}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5 flex items-center justify-between">
                    Time <span className="text-xs text-muted-foreground font-normal">(WAT)</span>
                  </label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData(f => ({...f, time: e.target.value}))}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Session Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData(f => ({...f, type: e.target.value}))}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card"
                  >
                    {Object.entries(typeConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Duration (mins)</label>
                  <select 
                    value={formData.duration_minutes}
                    onChange={e => setFormData(f => ({...f, duration_minutes: Number(e.target.value)}))}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Meeting Link (Optional)</label>
                <input 
                  type="url" 
                  value={formData.meeting_url}
                  onChange={e => setFormData(f => ({...f, meeting_url: e.target.value}))}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-card" 
                  placeholder="https://zoom.us/j/..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Event Color</label>
                <div className="flex items-center gap-3">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData(f => ({...f, color: c}))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${dotMap[c]} ${formData.color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                    >
                      {formData.color === c && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)} 
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSession}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
