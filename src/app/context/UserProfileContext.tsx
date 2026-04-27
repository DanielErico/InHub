import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  has_completed_onboarding: boolean;
  created_at?: string;
}

interface UserProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  refetch: () => void;
  completeOnboarding: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  profile: null,
  loading: true,
  refetch: () => {},
  completeOnboarding: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("id, full_name, role, avatar_url, bio, location, website, linkedin, has_completed_onboarding, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      const localDone = localStorage.getItem(`onboarding_${authUser.id}`) === 'true';
      
      // Bypass onboarding for old accounts (created before April 26, 2026)
      const isOldAccount = data?.created_at && new Date(data.created_at) < new Date('2026-04-26T00:00:00Z');
      const completedOnboarding = data?.has_completed_onboarding || localDone || onboardingDone || isOldAccount;

      setProfile({
        id: authUser.id,
        full_name: data?.full_name ?? null,
        role: data?.role ?? null,
        avatar_url: data?.avatar_url ?? null,
        email: authUser.email ?? null,
        bio: data?.bio ?? null,
        location: data?.location ?? null,
        website: data?.website ?? null,
        linkedin: data?.linkedin ?? null,
        has_completed_onboarding: !!completedOnboarding,
        created_at: data?.created_at,
      });

      if (completedOnboarding) setOnboardingDone(true);
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

  const completeOnboarding = () => {
    if (profile) {
      localStorage.setItem(`onboarding_${profile.id}`, 'true');
      setOnboardingDone(true);
      setProfile({ ...profile, has_completed_onboarding: true });
    }
  };

  return (
    <UserProfileContext.Provider value={{ profile, loading, refetch: fetchProfile, completeOnboarding }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
