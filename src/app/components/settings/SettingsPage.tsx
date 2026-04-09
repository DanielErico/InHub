import { useState, useEffect, useRef } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useUserProfile } from "../../context/UserProfileContext";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const { profile, refetch } = useUserProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
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

  // Populate form from profile when it loads
  useEffect(() => {
    if (profile) {
      setProfileForm((prev) => ({
        ...prev,
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
      }));
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    setAvatarUploading(true);
    setSaveError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update the user's avatar_url in the users table
      const { error: dbError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (dbError) throw dbError;

      setAvatarPreview(publicUrl);

      // Refresh the global profile so the Header updates instantly
      refetch();
    } catch (err: any) {
      setSaveError("Failed to upload avatar: " + err.message);
      // Revert preview on failure
      setAvatarPreview(profile.avatar_url ?? null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profileForm.full_name,
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Refresh global profile so Header name updates
      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "profile") {
      handleSaveProfile();
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
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

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? "U");

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
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">{initials}</span>
                    )}
                  </div>

                  <button
                    onClick={handleAvatarClick}
                    disabled={avatarUploading}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-0.5">
                    {profile?.full_name || "Your Name"}
                  </h3>
                  <p className="text-muted-foreground/80 text-sm capitalize">
                    {profile?.role ?? "student"} · {profile?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the camera icon to upload a new profile picture
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {saveError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-xs">{saveError}</p>
                </div>
              )}

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Full Name</label>
                    <input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Email Address</label>
                    <input
                      value={profileForm.email}
                      disabled
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Location</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                      <input
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/80 mb-1.5">Website</label>
                    <input
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      placeholder="yourwebsite.com"
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">LinkedIn Profile</label>
                  <input
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-200"
                  } disabled:opacity-60`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
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
