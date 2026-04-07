import { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink } from "react-router";
import { LayoutDashboard, BookOpen, ClipboardList, Calendar, Settings, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const pageTitles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/courses": "My Courses",
  "/app/assignments": "Assignments",
  "/app/schedule": "Schedule",
  "/app/settings": "Settings",
};

const mobileNavItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/app/courses", icon: BookOpen, label: "Courses" },
  { to: "/app/assignments", icon: ClipboardList, label: "Tasks" },
  { to: "/app/schedule", icon: Calendar, label: "Schedule" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/app/course/") ? "Course Player" : "");

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-border flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-sidebar shadow-2xl z-50 flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5 text-sidebar-foreground/60" />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30 safe-area-bottom">
        <div className="flex items-center">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
