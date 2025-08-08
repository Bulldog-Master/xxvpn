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
    try {
      const saved = sessionStorage.getItem('xxvpn_session');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string, passphrase?: string) => {
    if (!passphrase) throw new Error('Passphrase is required');
    const words = passphrase.trim().split(/\s+/);
    if (words.length !== 24) {
      throw new Error('Invalid passphrase: must be exactly 24 words');
    }

    // Derive a deterministic user id from the passphrase (no storage of the phrase)
    const enc = new TextEncoder().encode(passphrase.trim());
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const id = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const mockUser: User = {
      id,
      email: '',
      fullName: '',
      subscriptionTier: 'premium',
      xxCoinBalance: 125.5,
      referrals: 8,
    };

    setUser(mockUser);
    sessionStorage.setItem('xxvpn_session', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password: string, fullName: string, passphrase?: string) => {
    if (!passphrase) throw new Error('Passphrase is required');
    const words = passphrase.trim().split(/\s+/);
    if (words.length !== 24) {
      throw new Error('Invalid passphrase: must be exactly 24 words');
    }

    // Derive deterministic id from passphrase
    const enc = new TextEncoder().encode(passphrase.trim());
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const id = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const mockUser: User = {
      id,
      email: '',
      fullName,
      subscriptionTier: 'free',
      xxCoinBalance: 10,
      referrals: 0,
    };

    setUser(mockUser);
    sessionStorage.setItem('xxvpn_session', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      sessionStorage.removeItem('xxvpn_session');
      setUser(null);
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