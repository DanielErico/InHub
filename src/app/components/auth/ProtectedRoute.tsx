import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUserProfile } from "../../context/UserProfileContext";
import { supabase } from "../../../lib/supabase";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsAuthenticated(false);
          navigate("/");
          return;
        }

        setIsAuthenticated(true);

        // Check if user has required role
        if (requiredRole && profile?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
          setIsAuthenticated(false);
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        navigate("/");
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        navigate("/");
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate, profile?.role, requiredRole]);

  // Show loading state while checking auth
  if (loading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
