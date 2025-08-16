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
    console.log('🔄 AuthProvider useEffect starting...');
    
    // Check if we just returned from OAuth
    const checkOAuthReturn = () => {
      const oauthInitiated = sessionStorage.getItem('oauth_initiated');
      if (oauthInitiated) {
        console.log('🔄 Detected OAuth return, starting session polling...');
        sessionStorage.removeItem('oauth_initiated');
        
        // Poll for session
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds
        
        const pollForSession = async () => {
          attempts++;
          console.log(`🔍 Polling for session attempt ${attempts}/${maxAttempts}...`);
          
          try {
            const { data, error } = await supabase.auth.getSession();
            console.log('📊 Session poll result:', {
              hasSession: !!data.session,
              hasUser: !!data.session?.user,
              error: error?.message
            });
            
            if (data.session?.user) {
              console.log('✅ Session found via polling!');
              setSession(data.session);
              
              try {
                const userProfile = await fetchUserProfile(data.session.user);
                setUser(userProfile);
              } catch (profileError) {
                console.error('Profile fetch error, using fallback:', profileError);
                setUser({
                  id: data.session.user.id,
                  email: data.session.user.email || '',
                  fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || '',
                  avatarUrl: data.session.user.user_metadata?.avatar_url || '',
                  subscriptionTier: 'free',
                  xxCoinBalance: 10,
                  referrals: 0,
                });
              }
              
              setLoading(false);
              return;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(pollForSession, 500);
            } else {
              console.log('⚠️ Session polling timed out');
              setLoading(false);
            }
          } catch (error) {
            console.error('Polling error:', error);
            setLoading(false);
          }
        };
        
        pollForSession();
        return;
      }
    };
    
    // First check for OAuth return
    checkOAuthReturn();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event);
        console.log('📄 Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          accessToken: session?.access_token ? 'present' : 'missing'
        });
        
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in via auth state change!');
          setLoading(true);
          
          try {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
            setLoading(false);
          } catch (error) {
            console.error('Profile fetch error:', error);
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
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 User signed out or no session');
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Also check for existing session if no OAuth return
    if (!sessionStorage.getItem('oauth_initiated')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          console.log('✅ Found existing session on mount');
          setSession(session);
          fetchUserProfile(session.user).then(userProfile => {
            setUser(userProfile);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }

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
      console.log('🔵 Starting Google OAuth...');
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('🔗 Redirect URL:', redirectUrl);
      
      console.log('🚀 Initiating OAuth with Google...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
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
      
      // After OAuth initiation, set up session polling
      console.log('⏰ Setting up session polling for OAuth return...');
      
      // Store a flag that we initiated OAuth
      sessionStorage.setItem('oauth_initiated', 'true');
      
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