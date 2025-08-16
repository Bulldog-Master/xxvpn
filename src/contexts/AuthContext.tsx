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

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Fetching profile for user ID:', supabaseUser.id);
      console.log('🔍 User metadata:', supabaseUser.user_metadata);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      console.log('📊 Profile query result:', { profile, error: error?.message });

      if (error) {
        console.error('❌ Database error fetching profile:', error);
        // Create fallback user object when profile fetch fails
        const fallbackUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
          subscriptionTier: 'free' as const,
          xxCoinBalance: 10,
          referrals: 0,
        };
        console.log('👤 Created fallback user due to error:', fallbackUser);
        return fallbackUser;
      }

      if (profile) {
        console.log('✅ Profile found in database, creating user object');
        return {
          id: profile.user_id,
          email: supabaseUser.email || '',
          fullName: profile.display_name || '',
          avatarUrl: profile.avatar_url || '',
          subscriptionTier: profile.subscription_tier as 'free' | 'premium' | 'enterprise',
          xxCoinBalance: parseFloat(profile.xx_coin_balance?.toString() || '0'),
          referrals: profile.referrals || 0,
        };
      } else {
        console.log('⚠️ No profile found in database, creating fallback user');
        // No profile found, create fallback user object
        const fallbackUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
          subscriptionTier: 'free' as const,
          xxCoinBalance: 10,
          referrals: 0,
        };
        console.log('👤 Created fallback user (no profile):', fallbackUser);
        return fallbackUser;
      }
    } catch (error) {
      console.error('💥 Exception in fetchUserProfile:', error);
      // Create fallback user object on any exception
      const fallbackUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
        subscriptionTier: 'free' as const,
        xxCoinBalance: 10,
        referrals: 0,
      };
      console.log('👤 Created fallback user due to exception:', fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect starting...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event);
        console.log('📄 Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'undefined',
          accessToken: session?.access_token ? 'present' : 'missing',
          userId: session?.user?.id || 'undefined'
        });

        setSession(session);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 User signed out or no session');
          setUser(null);
          setLoading(false);
          return;
        }

        // For ANY sign-in event (including OAuth), set user immediately
        if (session?.user) {
          console.log('✅ User session found, setting user immediately');
          setLoading(false);
          
          // Create immediate user object to prevent loading state
          const immediateUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     session.user.email?.split('@')[0] || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url || 
                      session.user.user_metadata?.picture || '',
            subscriptionTier: 'free' as const,
            xxCoinBalance: 10,
            referrals: 0,
          };
          
          console.log('👤 Setting immediate user:', immediateUser);
          setUser(immediateUser);
          
          // Fetch profile in background to update if needed
          setTimeout(async () => {
            try {
              const userData = await fetchUserProfile(session.user);
              console.log('👤 Profile updated in background:', userData);
              setUser(userData);
            } catch (error) {
              console.log('⚠️ Profile fetch failed, keeping immediate user:', error);
            }
          }, 100);
        }
      }
    );

    // Check for existing session
    console.log('🔍 Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 getSession result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: error?.message
      });
      
      if (session?.user) {
        console.log('✅ Found existing session on direct check');
        setSession(session);
        
        // Set user immediately for existing sessions too
        const immediateUser = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.name || 
                   session.user.email?.split('@')[0] || 'User',
          avatarUrl: session.user.user_metadata?.avatar_url || 
                    session.user.user_metadata?.picture || '',
          subscriptionTier: 'free' as const,
          xxCoinBalance: 10,
          referrals: 0,
        };
        
        setUser(immediateUser);
        setLoading(false);
        
        // Background profile fetch
        fetchUserProfile(session.user).then(userProfile => {
          console.log('👤 Profile loaded from direct session check:', userProfile);
          setUser(userProfile);
        }).catch(error => {
          console.log('⚠️ Profile fetch failed for existing session:', error);
        });
      } else {
        console.log('❌ No existing session found on direct check');
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
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
      console.log('🔵 Starting Google OAuth...');
      
      // ROBUST cleanup to prevent limbo states
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        console.log('🚪 Performing global sign out first...');
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Global sign out completed');
      } catch (err) {
        console.log('⚠️ Global sign out failed, continuing anyway:', err);
      }
      
      // Use the exact redirect URL from your preview link
      const redirectUrl = `${window.location.origin}/`;
      console.log('🔗 Redirect URL:', redirectUrl);
      
      console.log('🚀 Initiating OAuth with Google...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            hl: 'en' // Force English language
          }
        }
      });

      console.log('📤 OAuth response:', { 
        data: data ? 'present' : 'null', 
        error: error?.message,
        url: data?.url ? 'present' : 'missing'
      });
      
      if (error) {
        console.error('❌ OAuth initiation error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('🌐 Redirecting to OAuth URL...');
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('💥 Google OAuth error:', error);
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