import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'tester' | 'recruiter' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  plan_type: string;
  study_limit: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null; data: { user: any; session: any } | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer role fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const resolveRole = (candidate: unknown): AppRole => {
    if (candidate === 'recruiter' || candidate === 'admin') return candidate;
    return 'tester';
  };

  const fetchUserRole = async (authUser: User) => {
    const userId = authUser.id;

    // Ensure profile row exists; this is a safety net if signup trigger failed.
    const { data: profileData } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email: authUser.email ?? null,
          full_name: (authUser.user_metadata?.full_name as string | undefined) ?? null,
        },
        { onConflict: 'user_id' }
      )
      .select('id, user_id, full_name, plan_type, study_limit')
      .single();

    if (profileData) {
      setProfile(profileData as UserProfile);
    }

    // Fetch user roles - will only see own roles due to RLS policy
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (!error && data && data.length > 0) {
      // Prioritize admin role if user has multiple roles
      const roles = data.map((d: any) => d.role as AppRole);
      if (roles.includes('admin')) {
        console.log('✅ User is admin', { user_id: userId });
        setRole('admin');
      } else {
        console.log(`✅ User role: ${roles[0]}`, { user_id: userId, role: roles[0] });
        setRole(roles[0]);
      }
      return;
    }

    // If we can't read the role (RLS blocked or doesn't exist), default to tester
    // The signup trigger should have created a role already
    const fallbackRole = 'tester';
    console.log(`⚠️ No role readable, using fallback: ${fallbackRole}`, { 
      user_id: userId, 
      error: error?.message 
    });
    setRole(fallbackRole);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/verify-email`;
    const timeoutMs = 15000;

    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    // Hard timeout via Promise.race: Supabase SMTP can hang when provider is misconfigured.
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('SIGNUP_TIMEOUT')), timeoutMs);
    });
    
    try {
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);
      return { error: error as Error | null, data: data ?? null };
    } catch (err: any) {
      if (err?.message === 'SIGNUP_TIMEOUT') {
        return {
          error: new Error('Sign up is taking longer than expected. Please check your email, then try signing in. Also verify SMTP in Supabase Auth settings.'),
          data: null,
        };
      }

      const normalizedMessage =
        typeof err?.message === 'string' && err.message.trim().length > 0
          ? err.message
          : typeof err === 'string' && err.trim().length > 0
            ? err
            : 'Sign up failed due to a temporary server issue. Please try again.';

      return { error: new Error(normalizedMessage), data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserRole(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
