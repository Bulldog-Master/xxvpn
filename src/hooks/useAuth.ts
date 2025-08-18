import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('❌ useAuth called outside of AuthProvider!');
    console.trace('Stack trace for debugging:');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};