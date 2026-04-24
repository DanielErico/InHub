import { useState, useEffect } from "react";
import { Bell, Search, Menu, BookOpen, ClipboardList, Calendar, LayoutDashboard, Loader2 } from "lucide-react";
import { useUserProfile } from "../../context/UserProfileContext";
import { supabase } from "../../../lib/supabase";

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const { profile } = useUserProfile();

  const unreadCount = notifList.filter((n) => !n.read).length;

  useEffect(() => {
    if (!profile?.id) return;
    loadNotifications();
  }, [profile?.id]);

  const loadNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) setNotifList(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const markAllRead = async () => {
    if (!profile?.id || unreadCount === 0) return;
    // Optimistic UI update
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", profile.id)
      .eq("read", false);
  };

  const markOneRead = async (id: string) => {
    setNotifList((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "course": return <BookOpen className="w-4 h-4 text-blue-700" />;
      case "deadline": return <ClipboardList className="w-4 h-4 text-red-500" />;
      case "message": return <Calendar className="w-4 h-4 text-violet-500" />;
      case "achievement": return <LayoutDashboard className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30 transition-colors duration-200">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-foreground text-lg font-semibold hidden sm:block">{title}</h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses, lessons..."
          className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-background transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 w-80 bg-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-foreground text-sm font-semibold">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-blue-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-blue-700 text-xs hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
                    </div>
                  ) : notifList.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markOneRead(notif.id)}
                        className={`flex gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notif.read ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-relaxed ${!notif.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {notif.message}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">{formatTime(notif.created_at)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-700 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-blue-100 hover:ring-blue-300 transition-all">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
