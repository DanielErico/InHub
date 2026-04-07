import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, BookOpen, Sparkles, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Logo } from "../ui/Logo";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === "tutor") {
        navigate("/app/tutor/dashboard");
      } else {
        navigate("/app/dashboard");
      }
    }, 1200);
  };

  const features = [
    "AI-powered smart notes & summaries",
    "Live sessions with expert tutors",
    "Interactive assignments & feedback",
    "Progress tracking & analytics",
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 flex-col justify-between p-14">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-card -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500 translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-card/30 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Logo className="w-10 h-10 text-white" />
          <span className="text-white text-xl font-bold tracking-tight">InHub</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">AI-Powered Learning</span>
            </div>
            <h1 className="text-5xl text-white leading-tight mb-4">
              Learn smarter.<br />
              Teach better.<br />
              <span className="text-blue-400">Powered by AI.</span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
              Join thousands of learners and instructors on the most intelligent e-learning platform built for interns.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-blue-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl opacity-90">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1707904633074-20fb8f8f865a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NzU1NzY2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Learning illustration"
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-blue-800 text-xs font-bold">🎯</span>
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">12,400+ Students</p>
              <p className="text-muted-foreground text-xs">Active this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-card min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo className="w-10 h-10 text-blue-700" />
            <span className="text-foreground text-lg font-bold">InHub</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue your learning journey"
                : "Start your learning journey today"}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all duration-200 ${
                role === "student"
                  ? "bg-card shadow-sm text-blue-800 font-medium"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Continue as Student
            </button>
            <button
              onClick={() => setRole("tutor")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all duration-200 ${
                role === "tutor"
                  ? "bg-card shadow-sm text-blue-800 font-medium"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Continue as Tutor
            </button>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm text-foreground/80 hover:bg-muted/50 hover:border-slate-300 transition-all duration-200 group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm text-foreground/80 hover:bg-muted/50 hover:border-slate-300 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-muted-foreground/80 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-foreground/80 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daniel Okafor"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-foreground/80 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-foreground/80 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-700 hover:text-blue-800 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 shadow-lg shadow-blue-400"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground/80 mt-4">
            By continuing, you agree to our{" "}
            <span className="text-blue-700 cursor-pointer">Terms of Service</span> and{" "}
            <span className="text-blue-700 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
