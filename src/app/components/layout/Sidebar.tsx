import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Logo } from "../ui/Logo";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  GraduationCap,
  LogOut,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useUserProfile } from "../../context/UserProfileContext";
import { supabase } from "../../../lib/supabase";

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/courses", icon: BookOpen, label: "My Courses" },
  { to: "/app/assignments", icon: ClipboardList, label: "Assignments" },
  { to: "/app/schedule", icon: Calendar, label: "Schedule" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUserProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? "S");

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            <p className="text-muted-foreground text-xs">Powered by InternConnect</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-muted-foreground/80 text-xs font-medium uppercase tracking-wider px-3 mb-3">Main Menu</p>
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

        {/* AI Feature Badge */}
        <div className="mt-6 mx-1">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-700 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-blue-900 text-xs font-semibold">AI Study Assistant</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed mb-3">
              Get instant help with lessons, notes, and assignments.
            </p>
            <NavLink
              to="/app/courses"
              onClick={onClose}
              className="block w-full bg-blue-700 text-white text-xs font-medium text-center py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Try AI Features
            </NavLink>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name ?? "User"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{profile?.full_name || "Student"}</p>
            <p className="text-sidebar-foreground/60 text-xs capitalize">{profile?.role || "Student"}</p>
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
              onClick={() => setShowLogoutModal(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground/80 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm mx-4"
            style={{ animation: "modalPop 0.18s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-foreground text-base font-bold">Log out of InHub?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You'll need to sign in again to access your dashboard.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Yes, Log out
              </button>
            </div>
          </div>
          <style>{`
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.92); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
