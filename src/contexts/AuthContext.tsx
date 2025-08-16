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
        setSession(session);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        // For ANY sign-in event (including OAuth), set user immediately
        if (session?.user) {
          setLoading(false);
          
          // Create immediate user object to prevent loading state
          const immediateUser = createImmediateUser(session.user);
          setUser(immediateUser);
          
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