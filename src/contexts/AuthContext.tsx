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

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        const savedUser = localStorage.getItem('xxvpn_user');
        if (savedUser) {
          console.log('Found saved user, logging in...');
          const parsedUser = JSON.parse(savedUser);
          console.log('Parsed user:', parsedUser);
          setUser(parsedUser);
          console.log('User set successfully');
        } else {
          console.log('No saved user found, showing login page');
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
        console.log('Loading set to false');
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
        id: crypto.randomUUID(),
        email: 'user@xxvpn.app',
        fullName: '', // Empty so it will use translation fallback
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
        id: crypto.randomUUID(),
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

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('xxvpn_user', JSON.stringify(updatedUser));
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