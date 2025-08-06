import { createContext, useContext, useEffect, useState } from 'react';

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

  useEffect(() => {
    // TODO: Check for existing session
    // For now, simulate checking session
    const checkSession = async () => {
      try {
        // Temporarily clear localStorage to show login page
        localStorage.removeItem('xxvpn_user');
        setUser(null);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string, passphrase?: string) => {
    try {
      // Validate passphrase if provided
      if (passphrase) {
        const words = passphrase.trim().split(/\s+/);
        if (words.length !== 24) {
          throw new Error('Invalid passphrase: must be exactly 24 words');
        }
      }
      
      const mockUser: User = {
        id: 'user-123',
        email: 'user@xxvpn.app',
        fullName: 'John Doe',
        subscriptionTier: 'premium',
        xxCoinBalance: 125.50,
        referrals: 8
      };
      
      setUser(mockUser);
      localStorage.setItem('xxvpn_user', JSON.stringify(mockUser));
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, passphrase?: string) => {
    try {
      // Validate passphrase if provided
      if (passphrase) {
        const words = passphrase.trim().split(/\s+/);
        if (words.length !== 24) {
          throw new Error('Invalid passphrase: must be exactly 24 words');
        }
      }
      
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email: 'user@xxvpn.app',
        fullName,
        subscriptionTier: 'free',
        xxCoinBalance: 10, // Welcome bonus
        referrals: 0
      };
      
      setUser(mockUser);
      localStorage.setItem('xxvpn_user', JSON.stringify(mockUser));
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // TODO: Implement Supabase sign out
      setUser(null);
      localStorage.removeItem('xxvpn_user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};