import { NavLink, useNavigate } from "react-router";
import { Logo } from "../ui/Logo";
import {
  LayoutDashboard,
  FolderUp,
  Users,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { user } from "../../data/mockData";
import { useTheme } from "../../contexts/ThemeContext";
import { useUserProfile } from "../../context/UserProfileContext";

interface TutorSidebarProps {
  onClose?: () => void;
}

const navItems = [
  { to: "/app/tutor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/tutor/content", icon: FolderUp, label: "Manage Courses" },
  { to: "/app/tutor/students", icon: Users, label: "My Students" },
  { to: "/app/tutor/schedule", icon: Calendar, label: "Schedule" },
  { to: "/app/tutor/ai-tools", icon: Sparkles, label: "AI Tools" },
  { to: "/app/tutor/settings", icon: Settings, label: "Settings" },
];

export function TutorSidebar({ onClose }: TutorSidebarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUserProfile();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? "T");

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-colors duration-200">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10 text-blue-700" />
          <div className="min-w-0">
            <p className="text-foreground text-sm font-bold truncate">InHub</p>
            <p className="text-muted-foreground text-xs font-semibold">Tutor Portal</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-muted-foreground/80 text-xs font-medium uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive ? "bg-blue-700 shadow-sm shadow-blue-400" : "bg-muted group-hover:bg-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </>
            )}
          </NavLink>
        ))}

        {/* AI Insight Badge */}
        <div className="mt-6 mx-1">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-indigo-900 text-xs font-semibold">AI Powered</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed mb-3">
              Generate curriculums, quizzes, and student insights with our advanced AI tools.
            </p>
            <NavLink
              to="/app/tutor/ai-tools"
              onClick={onClose}
              className="block w-full bg-indigo-600 text-white text-xs font-medium text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open AI Tools
            </NavLink>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name ?? "Tutor"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{profile?.full_name || "Tutor"}</p>
            <p className="text-sidebar-foreground/60 text-xs capitalize">{profile?.role || "Instructor"}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground/80 hover:text-blue-600 transition-colors"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground/80 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
