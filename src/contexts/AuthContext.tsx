import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  xxCoinBalance: number;
  referrals?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state cleanup to prevent limbo states
  const cleanupAuthState = () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
      // Remove legacy app-specific user storage
      localStorage.removeItem('xxvpn_user');
      sessionStorage.removeItem('xxvpn_session');
    } catch {}
  };

  // Fetch user profile from profiles table
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user ID:', supabaseUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      console.log('Profile query result:', { profile, error });

      if (error) {
        console.error('Error fetching profile:', error);
        // Create fallback user object
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
          subscriptionTier: 'free' as const,
          xxCoinBalance: 10,
          referrals: 0,
        };
      }

      if (profile) {
        console.log('Profile found, creating user object');
        return {
          id: profile.user_id,
          email: supabaseUser.email || '',
          fullName: profile.display_name || '',
          avatarUrl: profile.avatar_url || '',
          subscriptionTier: profile.subscription_tier as 'free' | 'premium' | 'enterprise',
          xxCoinBalance: parseFloat(profile.xx_coin_balance.toString()) || 0,
          referrals: profile.referrals || 0,
        };
      } else {
        console.log('No profile found, creating fallback user');
        // No profile found, create fallback user object
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
          subscriptionTier: 'free' as const,
          xxCoinBalance: 10,
          referrals: 0,
        };
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create fallback user object
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
        subscriptionTier: 'free' as const,
        xxCoinBalance: 10,
        referrals: 0,
      };
    }
  };

  useEffect(() => {
  // Set up auth state listener FIRST
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching profile...');
        // Defer profile fetching to prevent deadlocks
        setTimeout(async () => {
          try {
            console.log('Fetching profile for user:', session.user.id);
            const userProfile = await fetchUserProfile(session.user);
            console.log('Profile fetched:', userProfile);
            setUser(userProfile);
            setLoading(false);
            
            // Force page reload to ensure clean state
            if (window.location.pathname === '/') {
              window.location.reload();
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            // Fallback: create basic user object from auth data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              avatarUrl: session.user.user_metadata?.avatar_url || '',
              subscriptionTier: 'free',
              xxCoinBalance: 10,
              referrals: 0,
            });
            setLoading(false);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or no session');
        setUser(null);
        setLoading(false);
      } else {
        console.log('Other auth event:', event);
        setLoading(false);
      }
    }
  );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: fullName || '',
            full_name: fullName || '',
          }
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth...');
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Try to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing...');
      }
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      console.log('OAuth response:', { error });
      if (error) throw error;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even if sign out fails
      window.location.href = '/';
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user && session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: updates.fullName,
            avatar_url: updates.avatarUrl,
            subscription_tier: updates.subscriptionTier,
            xx_coin_balance: updates.xxCoinBalance,
            referrals: updates.referrals,
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } catch (error) {
        console.error('Error updating user profile:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    session,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    logout: signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};