import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Camera,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Globe,
  ChevronRight,
} from "lucide-react";
import { user } from "../../data/mockData";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    bio: "Passionate learner focused on full-stack development and data science. Currently interning at a tech startup.",
    location: "Lagos, Nigeria",
    website: "danielokafor.dev",
    linkedin: "linkedin.com/in/danielokafor",
  });
  const [notifSettings, setNotifSettings] = useState({
    emailDeadlines: true,
    emailSessions: true,
    emailAI: false,
    pushDeadlines: true,
    pushSessions: true,
    pushMessages: true,
    weeklyReport: true,
  });
  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "medium",
    language: "English",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        checked ? "bg-blue-700" : "bg-slate-200"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-all duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-56 flex-shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all border-b border-slate-50 last:border-0 ${
                  activeTab === id
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  activeTab === id ? "bg-blue-700" : "bg-muted"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${activeTab === id ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <span className="flex-1 text-left">{label}</span>
                {activeTab === id && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Avatar Section */}
              <div className="px-6 py-6 border-b border-border flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{user.avatar}</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-0.5">{user.name}</h3>
                  <p className="text-muted-foreground/80 text-sm capitalize">{user.role} · Joined {user.joinDate}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">🔥 {user.streak}-day streak</span>
                    <span className="flex items-center gap-1">⭐ {user.totalPoints} pts</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Email Address</label>
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Location</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                      <input
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Website</label>
                    <input
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">LinkedIn Profile</label>
                  <input
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-200"
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-foreground font-semibold mb-0.5">Notification Preferences</h3>
                <p className="text-muted-foreground text-sm">Choose what you want to be notified about</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-blue-700" />
                    <h4 className="text-foreground/80 text-sm font-semibold">Email Notifications</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: "emailDeadlines", label: "Assignment deadline reminders", desc: "24h and 1h before due date" },
                      { key: "emailSessions", label: "Upcoming session reminders", desc: "1h before scheduled sessions" },
                      { key: "emailAI", label: "AI-generated weekly report", desc: "Your learning progress summary" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-foreground/80 text-sm">{label}</p>
                          <p className="text-muted-foreground/80 text-xs">{desc}</p>
                        </div>
                        <Toggle
                          checked={notifSettings[key as keyof typeof notifSettings]}
                          onChange={() =>
                            setNotifSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifSettings] }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4 text-violet-500" />
                    <h4 className="text-foreground/80 text-sm font-semibold">Push Notifications</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: "pushDeadlines", label: "Assignment deadlines", desc: "Real-time alerts" },
                      { key: "pushSessions", label: "Live session alerts", desc: "When sessions are about to start" },
                      { key: "pushMessages", label: "Tutor messages", desc: "Replies and feedback" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-foreground/80 text-sm">{label}</p>
                          <p className="text-muted-foreground/80 text-xs">{desc}</p>
                        </div>
                        <Toggle
                          checked={notifSettings[key as keyof typeof notifSettings]}
                          onChange={() =>
                            setNotifSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifSettings] }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                  {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-foreground font-semibold mb-0.5">Security Settings</h3>
                <p className="text-muted-foreground text-sm">Keep your account safe</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <input type="password" placeholder="••••••••" className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <input type="password" placeholder="••••••••" className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <input type="password" placeholder="••••••••" className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm font-medium mb-2">Password Requirements</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {["At least 8 characters", "One uppercase letter", "One number", "One special character"].map((req) => (
                      <li key={req} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                  {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-foreground font-semibold mb-0.5">Appearance</h3>
                <p className="text-muted-foreground text-sm">Customize your interface</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-foreground/80 text-sm font-medium mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", icon: Sun, label: "Light" },
                      { id: "dark", icon: Moon, label: "Dark" },
                      { id: "system", icon: Smartphone, label: "System" },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setAppearance({ ...appearance, theme: id })}
                        className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border-2 transition-all ${
                          appearance.theme === id
                            ? "border-blue-700 bg-blue-100"
                            : "border-border hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${appearance.theme === id ? "text-blue-700" : "text-muted-foreground/80"}`} />
                        <span className={`text-xs font-medium ${appearance.theme === id ? "text-blue-800" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-foreground/80 text-sm font-medium mb-3">Font Size</p>
                  <div className="flex gap-2">
                    {["small", "medium", "large"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setAppearance({ ...appearance, fontSize: size })}
                        className={`px-4 py-2 rounded-xl text-sm border-2 transition-all capitalize ${
                          appearance.fontSize === size
                            ? "border-blue-700 bg-blue-100 text-blue-800 font-medium"
                            : "border-border text-muted-foreground hover:border-slate-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                  {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Apply Settings</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
