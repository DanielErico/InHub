import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "../ui/Logo";
import { supabase } from "../../../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if Supabase appended an error to the URL hash (e.g. expired token)
    const hash = window.location.hash;
    if (hash && hash.includes("error_description")) {
      const params = new URLSearchParams(hash.substring(1));
      const errDesc = params.get("error_description")?.replace(/\+/g, ' ');
      setLinkError(errDesc || "This password reset link is no longer valid.");
      setIsChecking(false);
      return;
    }

    // 2. Listen for the recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setIsChecking(false);
      }
    });

    // 3. Check if there is already an active session (e.g. token already processed)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setLinkError(error.message);
      } else if (session) {
        setSessionReady(true);
      }
      // Give the onAuthStateChange a tiny bit of time to fire if it's going to
      setTimeout(() => setIsChecking(false), 500);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-400" };
    return { score, label: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 flex-col justify-center items-center p-14 gap-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500 translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">Secure Your Account</h2>
            <p className="text-blue-200 text-lg max-w-sm leading-relaxed">
              Choose a strong, unique password to keep your InHub account safe.
            </p>
          </div>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {["At least 8 characters long", "Mix of uppercase & lowercase", "Include numbers or symbols"].map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <span className="text-blue-200 text-sm">{tip}</span>
              </div>
            ))}
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

          {success ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated!</h2>
                <p className="text-muted-foreground">
                  Your password has been successfully changed. Redirecting you to sign in...
                </p>
              </div>
            </div>
          ) : isChecking ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin mx-auto" />
              <h2 className="text-xl font-medium text-foreground">Verifying secure link...</h2>
              <p className="text-muted-foreground text-sm">Please wait a moment.</p>
            </div>
          ) : linkError || !sessionReady ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Invalid or Expired Link</h2>
              <p className="text-muted-foreground text-sm">
                {linkError || "This password reset link is no longer valid. Please request a new one."}
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3 text-sm font-medium transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <KeyRound className="w-7 h-7 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Set New Password</h2>
                <p className="text-muted-foreground">
                  Create a strong new password for your account.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.label === "Strong" ? "text-emerald-600" :
                        strength.label === "Fair" ? "text-amber-600" : "text-red-500"
                      }`}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-foreground/80 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-300 bg-red-50/50"
                          : confirmPassword && confirmPassword === password
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-border"
                      }`}
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
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || password !== confirmPassword}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 shadow-lg shadow-blue-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
