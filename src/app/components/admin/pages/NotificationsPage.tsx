import { useState, useEffect } from "react";
import { UserPlus, BookOpen, AlertTriangle, Send, Flag, Bell, Loader2, CheckCheck, Radio, ShieldAlert, MessageSquare } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { supabase } from "../../../../lib/supabase";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
}

interface FlaggedMessage {
  id: string;
  content: string;
  reason: string;
  source: string;
  status: string;
  created_at: string;
  offender?: { full_name: string; role: string };
  reporter?: { full_name: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeIcon: Record<string, { icon: any; color: string }> = {
  signup:    { icon: UserPlus,   color: "text-blue-600 bg-blue-50" },
  course:    { icon: BookOpen,   color: "text-purple-600 bg-purple-50" },
  alert:     { icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
  message:   { icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
  default:   { icon: Bell,       color: "text-slate-600 bg-slate-100" },
};

function getTypeConfig(type: string) {
  return typeIcon[type] ?? typeIcon.default;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [flagged, setFlagged] = useState<FlaggedMessage[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingFlagged, setLoadingFlagged] = useState(true);
  const [activeTab, setActiveTab] = useState<"notifications" | "flagged">("notifications");

  // Broadcast state
  const [audience, setAudience] = useState("all-students");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);

  // ── Fetch notifications ──
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setNotifications(data || []);
    } catch (err: any) {
      toast.error("Failed to load notifications: " + err.message);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // ── Fetch flagged/reported messages ──
  const fetchFlagged = async () => {
    setLoadingFlagged(true);
    try {
      const { data, error } = await supabase
        .from("reported_content")
        .select(`
          id, content, reason, source, status, created_at,
          offender:users!reported_content_offender_id_fkey(full_name, role),
          reporter:users!reported_content_reporter_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setFlagged((data as any) || []);
    } catch (err: any) {
      toast.error("Failed to load flagged messages: " + err.message);
    } finally {
      setLoadingFlagged(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchFlagged();
  }, []);

  // ── Mark all as read ──
  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  // ── Update flagged status ──
  const updateFlaggedStatus = async (id: string, status: "reviewed" | "dismissed") => {
    const { error } = await supabase
      .from("reported_content")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    setFlagged(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    toast.success(`Report marked as ${status}`);
  };

  // ── Send Broadcast ──
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) { toast.error("Please write a message first."); return; }
    setSending(true);
    try {
      // 1. Fetch target user IDs based on audience
      let query = supabase.from("users").select("id");
      if (audience === "all-students") query = query.eq("role", "student");
      else if (audience === "all-tutors") query = query.eq("role", "tutor");
      // "all-users" → no role filter

      const { data: users, error: usersError } = await query;
      if (usersError) throw usersError;
      if (!users || users.length === 0) { toast.error("No users found for the selected audience."); return; }

      // 2. Insert a notification row for every target user
      const audienceLabel: Record<string, string> = {
        "all-students": "All Students",
        "all-tutors":   "All Tutors",
        "all-users":    "All Users",
      };

      const rows = users.map((u: any) => ({
        user_id: u.id,
        title: "📢 Platform Announcement",
        message: broadcastMsg.trim(),
        type: "broadcast",
        read: false,
        link: null,
      }));

      const { error: insertError } = await supabase.from("notifications").insert(rows);
      if (insertError) throw insertError;

      toast.success(`Broadcast sent to ${users.length} ${audienceLabel[audience] ?? "users"}!`);
      setBroadcastMsg("");
      fetchNotifications(); // refresh list
    } catch (err: any) {
      toast.error("Broadcast failed: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingFlags = flagged.filter(f => f.status === "pending").length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Tabs + Lists ── */}
      <div className="lg:col-span-2 space-y-4">
        {/* Tab bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-white text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeTab === "flagged"
                ? "bg-red-600 text-white border-red-600 shadow"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Flagged Messages
            {pendingFlags > 0 && (
              <span className="bg-white text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {pendingFlags}
              </span>
            )}
          </button>
          {activeTab === "notifications" && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* ── Notifications tab ── */}
        {activeTab === "notifications" && (
          <>
            {loadingNotifs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <Card className="p-10 text-center border-dashed">
                <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm">No notifications yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => {
                  const cfg = getTypeConfig(n.type);
                  const Icon = cfg.icon;
                  return (
                    <Card
                      key={n.id}
                      className={`p-4 border-border transition-colors ${!n.read ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg h-fit flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-foreground text-sm">{n.title}</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.read && (
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] flex-shrink-0">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Flagged Messages tab ── */}
        {activeTab === "flagged" && (
          <>
            {loadingFlagged ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-red-500" />
              </div>
            ) : flagged.length === 0 ? (
              <Card className="p-10 text-center border-dashed">
                <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm">No flagged messages. 🎉</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {flagged.map(f => (
                  <Card key={f.id} className={`p-4 border-border ${f.status === "pending" ? "border-l-4 border-l-red-500" : ""}`}>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg h-fit bg-red-50 text-red-600 flex-shrink-0">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              {(f.offender as any)?.full_name ?? "Unknown User"}
                            </span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                              {(f.offender as any)?.role ?? "user"}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              f.source === "ai_filter"
                                ? "bg-violet-100 text-violet-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {f.source === "ai_filter" ? "🤖 AI Blocked" : "👤 User Reported"}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            f.status === "pending" ? "bg-red-100 text-red-700" :
                            f.status === "reviewed" ? "bg-green-100 text-green-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {f.status}
                          </span>
                        </div>

                        <blockquote className="text-sm text-foreground/80 bg-muted rounded-lg px-3 py-2 border-l-2 border-border italic">
                          "{f.content}"
                        </blockquote>

                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-red-600">Reason:</span> {f.reason}
                        </p>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[10px] text-muted-foreground/70">{timeAgo(f.created_at)}</p>
                          {f.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateFlaggedStatus(f.id, "reviewed")}
                                className="text-xs px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium"
                              >
                                Mark Reviewed
                              </button>
                              <button
                                onClick={() => updateFlaggedStatus(f.id, "dismissed")}
                                className="text-xs px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right: Broadcast ── */}
      <div className="lg:col-span-1">
        <Card className="p-6 border-border sticky top-24">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Radio className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Broadcast Message</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Select Audience
              </label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  <SelectItem value="all-tutors">All Tutors</SelectItem>
                  <SelectItem value="all-users">All Users (Everyone)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">
                Message
              </label>
              <Textarea
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Type your announcement here..."
                className="min-h-32 resize-none"
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground/70 mt-1 text-right">
                {broadcastMsg.length}/500
              </p>
            </div>

            <Button
              onClick={handleBroadcast}
              disabled={sending || !broadcastMsg.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Broadcast</>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
              This will send an in-app notification to all selected users. They will see it in their notification bell.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
