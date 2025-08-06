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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
        // Simulate session check
        const savedUser = localStorage.getItem('xxvpn_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement Supabase authentication
      // For now, simulate sign in
      const mockUser: User = {
        id: '1',
        email,
        fullName: 'Demo User',
        subscriptionTier: 'premium',
        xxCoinBalance: 125.50,
        referrals: 12
      };
      
      setUser(mockUser);
      localStorage.setItem('xxvpn_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // TODO: Implement Supabase authentication
      // For now, simulate sign up
      const mockUser: User = {
        id: '1',
        email,
        fullName,
        subscriptionTier: 'free',
        xxCoinBalance: 0,
        referrals: 0
      };
      
      setUser(mockUser);
      localStorage.setItem('xxvpn_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Failed to create account');
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