import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from "react";
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

  // Guard against concurrent fetchProfile calls — these cause the Supabase
  // navigator lock ("lock:sb-...-auth-token was released because another
  // request stole it") errors visible in DevTools.
  const isFetchingRef = useRef(false);
  // Debounce timer so rapid-fire onAuthStateChange events collapse into one fetch.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = useCallback(async () => {
    // Skip if a fetch is already in flight
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // Use getSession() instead of getUser() — getSession() is synchronous-
      // cache-backed and does NOT acquire the navigator lock, avoiding the
      // lock contention that getUser() causes when called concurrently.
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user ?? null;

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
      isFetchingRef.current = false;
    }
  }, [onboardingDone]);

  useEffect(() => {
    // Initial fetch on mount
    fetchProfile();

    // Re-fetch when auth state changes (login, logout, token refresh).
    // Debounce with 150ms to collapse rapid-fire events (React StrictMode
    // double-invocation, simultaneous SIGNED_IN + INITIAL_SESSION, etc.)
    // into a single fetch, preventing the navigator lock race.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(fetchProfile, 150);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchProfile]);

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
