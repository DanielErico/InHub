import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, BookOpen, Sparkles, ArrowRight, CheckCircle2, GraduationCap, AlertCircle, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Logo } from "../ui/Logo";
import { supabase } from "../../../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Start a resend cooldown timer
  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, role },
            emailRedirectTo: `${window.location.origin}/app/dashboard`,
          },
        });

        if (signUpError) throw signUpError;

        // If Supabase auto-signed the user in (email confirmation is DISABLED),
        // there will be a live session — skip OTP and go straight to the app.
        if (signUpData?.session) {
          await supabase.from("users").upsert({
            id: signUpData.session.user.id,
            full_name: name,
            role,
          });
          navigate(role === "tutor" ? "/app/tutor/dashboard" : "/app/dashboard");
          return;
        }

        // Email confirmation is ON — signUp already sent the OTP email.
        // No need to call signInWithOtp separately (that was causing the type mismatch).
        startCooldown(60);
        setMode("verify");
      } else {
        // Login with email + password
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single();

          const userRole = profile?.role || role;
          navigate(userRole === "tutor" ? "/app/tutor/dashboard" : "/app/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (
        err.message?.toLowerCase().includes("sending confirmation") ||
        err.message?.toLowerCase().includes("error sending")
      ) {
        setError(
          "Supabase couldn't send the confirmation email. This is a Supabase rate limit issue. " +
          "Fix: Supabase Dashboard → Authentication → Providers → turn OFF 'Confirm email'."
        );
      } else if (err.message?.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.message?.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.message?.includes("Email not confirmed")) {
        // For unconfirmed email on login: send OTP so they can verify
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (!otpError) {
          startCooldown(60);
          setMode("verify");
          return;
        }
        setError("Please verify your email. Check your inbox for a code.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    // Supabase uses different token types:
    //   'signup'  → token from supabase.auth.signUp() confirmation email
    //   'email'   → token from supabase.auth.signInWithOtp() (used for Resend Code)
    // We try 'signup' first (initial signup flow), then fall back to 'email' (resent code).
    const tryVerify = async (type: "signup" | "email") => {
      return supabase.auth.verifyOtp({ email, token: otp, type });
    };

    try {
      let data: any = null;

      const { data: d1, error: e1 } = await tryVerify("signup");
      if (e1) {
        // First attempt failed — try the 'email' type (resent OTP via signInWithOtp)
        const { data: d2, error: e2 } = await tryVerify("email");
        if (e2) {
          // Both types failed — code is genuinely wrong or expired
          throw e2;
        }
        data = d2;
      } else {
        data = d1;
      }

      if (data?.user) {
        // Upsert the profile now that the session is active
        const { error: dbError } = await supabase.from("users").upsert({
          id: data.user.id,
          full_name: name,
          role,
        });
        if (dbError) console.warn("Profile upsert warning:", dbError.message);

        // Sign out the temporary OTP session so the user logs in properly
        await supabase.auth.signOut();

        // Show success then redirect to login
        setSuccessMsg("✅ Account verified! Please sign in with your email and password.");
        setTimeout(() => {
          setOtp("");
          setPassword("");
          setConfirmPassword("");
          setName("");
          setError(null);
          setSuccessMsg(null);
          setMode("login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      if (
        err.message?.toLowerCase().includes("expired") ||
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("otp")
      ) {
        setError("The code is wrong or has expired. Please use Resend Code to get a fresh one.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError(null);
    setSuccessMsg(null);
    setResendLoading(true);
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (resendError) throw resendError;
      setSuccessMsg("A new verification code has been sent to your email.");
      startCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google login failed.");
    }
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
              {mode === "login" ? "Welcome back" : mode === "verify" ? "Check your email" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue your learning journey"
                : mode === "verify"
                ? "Enter the 6-digit code we sent you"
                : "Start your learning journey today"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{successMsg}</p>
            </div>
          )}

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
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm text-foreground/80 hover:bg-muted/50 hover:border-slate-300 transition-all duration-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-muted-foreground/80 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          {mode === "verify" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2 text-center">
                <p className="text-blue-800 text-sm">
                  We've sent an 8-digit verification code to <strong>{email}</strong>
                </p>
                <p className="text-blue-600 text-xs mt-1">Check your spam folder if you don't see it.</p>
              </div>
              <div>
                <label className="block text-sm text-foreground/80 mb-1.5 text-center">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="00000000"
                  className="w-full border border-border rounded-xl px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center text-foreground placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length < 8}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 shadow-lg shadow-blue-400"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : "Verify Code"}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Didn't receive a code?</p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resendLoading
                    ? "Sending..."
                    : "Resend Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setMode("signup"); setOtp(""); setError(null); setSuccessMsg(null); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                ← Back to Sign Up
              </button>
            </form>
          ) : (
            <>
              {/* Form Content (Login / Signup) */}
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
                      required
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
                    required
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
                      required
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
                        required
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
                      {mode === "login" ? "Signing in..." : "Creating account..."}
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
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccessMsg(null); }}
                  className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground/80 mt-4">
            Powered by InternConnect
          </p>
        </div>
      </div>
    </div>
  );
}
