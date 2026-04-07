import React, { useState } from "react";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Upload,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Globe,
  Sparkles,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Video,
  DollarSign,
} from "lucide-react";

type Section = "profile" | "security" | "notifications" | "payout";

const sidebarItems: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profile", label: "Profile", icon: User, desc: "Your public info" },
  { id: "security", label: "Security", icon: Shield, desc: "Password & 2FA" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & emails" },
  { id: "payout", label: "Payout", icon: DollarSign, desc: "Earnings & payouts" },
];

function ProfileSection() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Public Profile</h2>
        <p className="text-muted-foreground text-sm mt-1">This information is shown to your students.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">DR</span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-700 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-800 transition-colors">
            <Upload className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-foreground">Dr. Sarah Jenkins</p>
          <p className="text-muted-foreground text-sm">Lead Instructor</p>
          <button className="text-blue-700 text-xs font-medium mt-1 hover:text-blue-800 transition-colors">Change photo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">First Name</label>
          <input defaultValue="Sarah" type="text" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Last Name</label>
          <input defaultValue="Jenkins" type="text" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email Address</label>
          <input defaultValue="dr.jenkins@internconnect.edu" type="email" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Bio / Tagline</label>
          <textarea
            rows={3}
            defaultValue="Senior Software Engineer & Educator with 12+ years of experience in full-stack development, system design, and mentoring."
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Specialization</label>
          <input defaultValue="Full-Stack & System Design" type="text" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Language</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <select className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 outline-none bg-card">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/80">Last updated: 3 days ago</p>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved ? "bg-emerald-600 text-white" : "bg-blue-700 text-white hover:bg-blue-800 shadow-sm shadow-blue-200"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Security</h2>
        <p className="text-muted-foreground text-sm mt-1">Keep your account safe and secure.</p>
      </div>

      {/* Password */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-4 border border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" /> Change Password
        </h3>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? "text" : "password"} className="w-full border border-border bg-card rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 outline-none pr-10" placeholder="Enter current password" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">New Password</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} className="w-full border border-border bg-card rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 outline-none pr-10" placeholder="Min. 8 characters" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button className="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
          Update Password
        </button>
      </div>

      {/* 2FA */}
      <div className="bg-muted/50 rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Two-Factor Authentication</p>
              <p className="text-muted-foreground text-xs mt-0.5">Adds an extra layer of security to your account.</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`relative w-12 h-6 rounded-full transition-colors ${twoFA ? "bg-blue-700" : "bg-slate-300"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all ${twoFA ? "left-7" : "left-1"}`} />
          </button>
        </div>
        {twoFA && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2FA is active via Authenticator App
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-muted/50 rounded-2xl p-5 border border-border space-y-3">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" /> Active Sessions
        </h3>
        {[
          { device: "MacBook Pro (Chrome)", location: "Lagos, Nigeria", time: "Now", current: true },
          { device: "iPhone 15 (Safari)", location: "Lagos, Nigeria", time: "2h ago", current: false },
        ].map((session) => (
          <div key={session.device} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">{session.device}</p>
              <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
            </div>
            {session.current ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">This device</span>
            ) : (
              <button className="text-xs font-medium text-red-500 hover:text-red-600">Revoke</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [settings, setSettings] = useState({
    newStudent: true,
    sessionReminder: true,
    assignmentSubmit: true,
    studentMessage: false,
    weeklyReport: true,
    marketingEmails: false,
    pushNotifs: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const notifGroups = [
    {
      title: "Activity",
      icon: Bell,
      items: [
        { key: "newStudent" as keyof typeof settings, label: "New Student Enrollment", desc: "When a student joins your course" },
        { key: "assignmentSubmit" as keyof typeof settings, label: "Assignment Submissions", desc: "When a student submits work" },
        { key: "studentMessage" as keyof typeof settings, label: "Student Messages", desc: "Direct messages from students" },
      ],
    },
    {
      title: "Sessions",
      icon: Video,
      items: [
        { key: "sessionReminder" as keyof typeof settings, label: "Session Reminders", desc: "30 min before scheduled sessions" },
      ],
    },
    {
      title: "Reports",
      icon: Mail,
      items: [
        { key: "weeklyReport" as keyof typeof settings, label: "Weekly Summary", desc: "Performance and revenue digest" },
        { key: "marketingEmails" as keyof typeof settings, label: "Platform News", desc: "Updates, tips, and announcements" },
      ],
    },
    {
      title: "Push",
      icon: Smartphone,
      items: [
        { key: "pushNotifs" as keyof typeof settings, label: "Browser Push Notifications", desc: "Real-time browser notifications" },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground text-sm mt-1">Choose how and when you get notified.</p>
      </div>

      {notifGroups.map((group) => (
        <div key={group.title} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-muted/50 border-b border-border">
            <group.icon className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground/80">{group.title}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${settings[item.key] ? "bg-blue-700" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all ${settings[item.key] ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PayoutSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Payout Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage how you receive your earnings.</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: "$8,800", color: "blue" },
          { label: "Pending", value: "$1,240", color: "amber" },
          { label: "Paid Out", value: "$7,560", color: "emerald" },
        ].map((item) => (
          <div key={item.label} className={`bg-${item.color}-50 border border-${item.color}-100 rounded-2xl p-5`}>
            <p className={`text-xs font-semibold text-${item.color}-700 uppercase tracking-wide mb-1`}>{item.label}</p>
            <p className={`text-2xl font-bold text-${item.color}-800`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Bank Account */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" /> Connected Bank Account
        </h3>
        <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4 border border-border">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">First Bank •••• 4821</p>
            <p className="text-xs text-muted-foreground">Verified · Added Jan 2026</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">Primary</span>
        </div>
        <button className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1">
          <CreditCard className="w-4 h-4" /> Add another account
        </button>
      </div>

      {/* Payout Schedule */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Payout Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Weekly", "Bi-Weekly", "Monthly"].map((freq) => (
            <button
              key={freq}
              className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                freq === "Monthly"
                  ? "bg-blue-700 border-blue-700 text-white shadow-sm shadow-blue-200"
                  : "bg-card border-border text-muted-foreground hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Next payout: <span className="font-semibold text-foreground/80">April 30, 2026</span> · Estimated <span className="font-semibold text-emerald-600">$1,240</span></p>
      </div>

      {/* Revenue Split */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-1">Revenue Share</p>
            <p className="text-2xl font-bold">80% <span className="text-blue-300 text-base font-normal">to you</span></p>
            <p className="text-blue-200 text-sm mt-1">Platform fee: 20% of each sale</p>
          </div>
          <div className="p-2 bg-card/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const sectionMap = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    notifications: <NotificationsSection />,
    payout: <PayoutSection />,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sidebarItems.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === id
                    ? "bg-blue-50 text-blue-800 border border-blue-100"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeSection === id ? "bg-blue-700" : "bg-muted"}`}>
                  <Icon className={`w-4 h-4 ${activeSection === id ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground/80 truncate">{desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ml-auto flex-shrink-0 transition-opacity ${activeSection === id ? "opacity-100 text-blue-600" : "opacity-0"}`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-8">
          {sectionMap[activeSection]}
        </div>
      </div>
    </div>
  );
}
