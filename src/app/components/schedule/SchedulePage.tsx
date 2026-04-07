import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { scheduleItems } from "../../data/mockData";

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Video }> = {
  live: { label: "Live Session", color: "text-blue-800", bg: "bg-blue-100 border-blue-400", icon: Video },
  workshop: { label: "Workshop", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: Users },
  deadline: { label: "Deadline", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle },
  review: { label: "Review", color: "text-pink-600", bg: "bg-pink-50 border-pink-200", icon: FileText },
  mentoring: { label: "Mentoring", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Star },
};

const dotColors: Record<string, string> = {
  sky: "bg-blue-700",
  violet: "bg-violet-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
  amber: "bg-amber-500",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarView({
  year,
  month,
  selectedDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  selectedDay: number | null;
  onSelectDay: (d: number) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const scheduledDays = new Set(
    scheduleItems.map((s) => {
      const d = new Date(s.date);
      return d.getMonth() === month && d.getFullYear() === year ? d.getDate() : null;
    }).filter(Boolean)
  );

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center py-3 text-muted-foreground/80 text-xs font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isToday =
            day !== null &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const isSelected = day === selectedDay;
          const hasEvent = day !== null && scheduledDays.has(day);

          return (
            <div
              key={i}
              onClick={() => day && onSelectDay(day)}
              className={`relative min-h-[52px] p-2 flex flex-col items-center border-b border-r border-slate-50 transition-all ${
                day
                  ? "cursor-pointer hover:bg-blue-100"
                  : "bg-muted/50/30"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
                      isSelected
                        ? "bg-blue-700 text-white"
                        : isToday
                        ? "bg-blue-200 text-blue-900 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>
                  {hasEvent && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1" />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(3); // April = 3 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(9); // April 9
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const selectedItems = selectedDateStr
    ? scheduleItems.filter((s) => s.date === selectedDateStr)
    : scheduleItems;

  const upcomingItems = scheduleItems.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-foreground mb-1">Schedule</h1>
          <p className="text-muted-foreground text-sm">{scheduleItems.length} upcoming events</p>
        </div>
        <div className="flex bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              view === "calendar" ? "bg-card text-blue-800 shadow-sm font-medium" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              view === "list" ? "bg-card text-blue-800 shadow-sm font-medium" : "text-muted-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {view === "calendar" && (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <CalendarView
                year={currentYear}
                month={currentMonth}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
            </>
          )}

          {/* Events for selected day or all */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">
                {selectedDay && view === "calendar"
                  ? `Events on April ${selectedDay}`
                  : "All Upcoming Events"}
              </h3>
              {selectedDay && view === "calendar" && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-blue-700 text-sm hover:text-blue-800"
                >
                  Show all
                </button>
              )}
            </div>

            {(view === "calendar" ? selectedItems : upcomingItems).length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No events on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(view === "calendar" ? selectedItems : upcomingItems).map((item) => {
                  const config = typeConfig[item.type] || typeConfig.live;
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      className={`bg-card rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group ${
                        item.type === "deadline" ? "border-red-100" : "border-border"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap mb-1.5">
                            <h4 className="text-foreground text-sm font-semibold flex-1">{item.title}</h4>
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${config.bg} ${config.color} flex-shrink-0`}>
                              {config.label}
                            </span>
                          </div>

                          <p className="text-muted-foreground/80 text-xs mb-3">{item.course}</p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {item.time}
                            </div>
                            {item.duration !== "-" && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-300">•</span>
                                {item.duration}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {item.tutor.split(" ").map((n) => n[0]).join("")}
                              </div>
                              {item.tutor}
                            </div>
                          </div>
                        </div>
                      </div>

                      {item.type !== "deadline" && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Confirmed
                          </div>
                          <button className="text-blue-700 text-xs font-medium hover:text-blue-800 transition-colors flex items-center gap-1">
                            Add to Calendar <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-5">
          {/* Today's Quick Summary */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-foreground text-sm font-semibold mb-4">This Week</h3>
            <div className="space-y-1">
              {upcomingItems.slice(0, 4).map((item) => {
                const dot = dotColors[item.color] || "bg-slate-400";
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                    onClick={() => {
                      const d = new Date(item.date);
                      setSelectedDay(d.getDate());
                      setView("calendar");
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground/80 text-xs font-medium truncate">{item.title}</p>
                      <p className="text-muted-foreground/80 text-xs">
                        {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-100 border border-blue-200 rounded-2xl p-4 text-center">
              <p className="text-3xl text-blue-800 mb-1">{scheduleItems.filter((s) => s.type === "live" || s.type === "workshop").length}</p>
              <p className="text-muted-foreground text-xs">Sessions</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <p className="text-3xl text-amber-600 mb-1">{scheduleItems.filter((s) => s.type === "deadline").length}</p>
              <p className="text-muted-foreground text-xs">Deadlines</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border border-blue-200 p-5">
            <h4 className="text-blue-950 text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              Schedule Tips
            </h4>
            <ul className="space-y-2 text-xs text-blue-900">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                Set reminders 30 min before each session
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                Review lesson material before live Q&A sessions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                Submit assignments at least 1 day early
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
