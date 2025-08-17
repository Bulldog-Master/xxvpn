import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, AuthContextType } from '@/types/auth';
import { 
  fetchUserProfile, 
  createImmediateUser, 
  checkAlternativeAuth 
} from '@/utils/authHelpers';
import { useAuthMethods } from '@/hooks/useAuthMethods';

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

  const authMethods = useAuthMethods(user, session, setUser, setSession, setLoading);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        // For ANY sign-in event, check if user has 2FA enabled
        if (session?.user && event === 'SIGNED_IN') {
          console.log('🔐 Sign-in detected, checking 2FA status...');
          
          try {
            // Check if user has 2FA enabled
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('totp_enabled')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Profile check error:', profileError);
            }

            // If 2FA is enabled and this is a fresh login (not from verification), sign out
            if (profile?.totp_enabled) {
              console.log('🛡️ 2FA enabled - checking if this is a verified session');
              
              // Check if this session has been 2FA verified (we'll use a session flag)
              const sessionData = session.user.user_metadata || {};
              if (!sessionData.twofa_verified) {
                console.log('🚫 2FA not verified - signing out');
                await supabase.auth.signOut();
                return;
              }
            }
          } catch (error) {
            console.error('2FA check error:', error);
          }
        }

        setSession(session);
        
        // Create immediate user object to prevent loading state
        const immediateUser = createImmediateUser(session.user);
        setUser(immediateUser);
        setLoading(false);
        
        // Fetch profile in background to update if needed
        setTimeout(async () => {
          try {
            const userData = await fetchUserProfile(session.user);
            setUser(userData);
          } catch (error) {
            // Keep immediate user if profile fetch fails
          }
        }, 100);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user) {
        setSession(session);
        
        // Set user immediately for existing sessions too
        const immediateUser = createImmediateUser(session.user);
        setUser(immediateUser);
        setLoading(false);
        
        // Background profile fetch
        fetchUserProfile(session.user).then(userProfile => {
          setUser(userProfile);
        }).catch(error => {
          // Keep immediate user if profile fetch fails
        });
      } else {
        // Check for alternative authentication methods
        const altUser = checkAlternativeAuth();
        if (altUser) {
          setUser(altUser);
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    session,
    ...authMethods,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};