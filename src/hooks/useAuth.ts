import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('🔍 useAuth called, context exists:', !!context);
  if (!context) {
    console.error('❌ useAuth called outside of AuthProvider!');
    console.error('❌ AuthContext is null - this should not happen if AuthProvider is wrapping the app');
    console.trace('Stack trace for debugging:');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};