import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface UserProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  refetch: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: null,
  loading: true,
  refetch: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("id, full_name, role, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      setProfile({
        id: authUser.id,
        full_name: data?.full_name ?? null,
        role: data?.role ?? null,
        avatar_url: data?.avatar_url ?? null,
        email: authUser.email ?? null,
      });
    } catch (err) {
      console.error("Failed to load user profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Re-fetch when auth state changes (e.g. on login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refetch: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
