import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../lib/supabase";

/**
 * This page handles the redirect from Supabase after Google OAuth.
 * Supabase appends #access_token=... to the URL. We read the session,
 * look up the user's role, then send them to the right dashboard.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      // Supabase automatically picks up the token from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("OAuth callback error:", error);
        navigate("/");
        return;
      }

      // Fetch the role from the users table
      let { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      const intendedRole = localStorage.getItem("intendedRole");
      let currentRole = profile?.role?.toLowerCase();
      const userEmail = session.user.email?.toLowerCase();

      // Hardcode admin protection for the main admin account to prevent accidental lockouts
      const isAdminEmail = userEmail === "dinternconnect@gmail.com";
      if (isAdminEmail) {
        currentRole = "admin";
      }

      // Apply the intended role if they just selected it on the Auth page.
      // CRITICAL: Never overwrite an 'admin' role!
      if (intendedRole && currentRole !== 'admin' && currentRole !== intendedRole) {
        const { error: upsertError } = await supabase.from("users").upsert({
          id: session.user.id,
          role: intendedRole,
          full_name: profile?.full_name || session.user.user_metadata?.full_name,
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url
        });
        
        if (!upsertError) {
          profile = { ...profile, role: intendedRole };
          currentRole = intendedRole;
        }
      }

      // Cleanup
      localStorage.removeItem("intendedRole");

      if (currentRole === "admin") {
        navigate("/app/admin", { replace: true });
      } else if (currentRole === "tutor") {
        navigate("/app/tutor/dashboard", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
