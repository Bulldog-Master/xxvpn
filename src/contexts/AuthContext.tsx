import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  signIn: (email: string, password: string, passphrase?: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, passphrase?: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
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
    } catch {}
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mappedUser: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: (session.user.user_metadata?.full_name as string) || '',
          avatarUrl: (session.user.user_metadata?.avatar_url as string) || undefined,
          subscriptionTier: 'free',
          xxCoinBalance: 0,
          referrals: 0,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mappedUser: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: (session.user.user_metadata?.full_name as string) || '',
          avatarUrl: (session.user.user_metadata?.avatar_url as string) || undefined,
          subscriptionTier: 'free',
          xxCoinBalance: 0,
          referrals: 0,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, passphrase?: string) => {
    // Validate passphrase if provided (not stored)
    if (passphrase) {
      const words = passphrase.trim().split(/\s+/);
      if (words.length !== 24) {
        throw new Error('Invalid passphrase: must be exactly 24 words');
      }
    }

    cleanupAuthState();
    try {
      // Attempt global sign out to avoid limbo states
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {
        // ignore
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Force page reload to ensure a clean state
      window.location.href = '/';
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, passphrase?: string) => {
    if (passphrase) {
      const words = passphrase.trim().split(/\s+/);
      if (words.length !== 24) {
        throw new Error('Invalid passphrase: must be exactly 24 words');
      }
    }

    cleanupAuthState();
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      if (data.session) {
        // Force page reload when session is created immediately
        window.location.href = '/';
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {
        // ignore errors
      }
      // Redirect to root for a clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};