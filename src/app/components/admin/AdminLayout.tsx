import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { useTheme } from "../../contexts/ThemeContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Brain,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  ClipboardList
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";

const navigation = [
  { name: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
  { name: "Users", href: "/app/admin/users", icon: Users },
  { name: "Courses", href: "/app/admin/courses", icon: BookOpen },
  { name: "Assignments", href: "/app/admin/assignments", icon: FileText },
  { name: "Surveys", href: "/app/admin/surveys", icon: ClipboardList },
  { name: "AI Analytics", href: "/app/admin/ai-analytics", icon: Brain },
  { name: "Notifications", href: "/app/admin/notifications", icon: Bell },
  { name: "Settings", href: "/app/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Force light mode while admin is active; restore on leave
  useEffect(() => {
    const root = window.document.documentElement;
    const previous = theme;
    
    // Force DOM update directly to bypass any state delays
    root.classList.remove("dark");
    root.classList.add("light");
    setTheme("light");
    
    return () => {
      // Only restore if we are actually leaving the admin section
      if (previous === "dark") {
        root.classList.remove("light");
        root.classList.add("dark");
        setTheme("dark");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPage = navigation.find((item) => item.href === location.pathname);
  const pageTitle = currentPage?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">InHub Admin</h1>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600/75"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">InHub Admin</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center h-16 gap-4 px-4 bg-white border-b border-gray-200 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>

          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search users or courses..."
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-700">AD</AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
