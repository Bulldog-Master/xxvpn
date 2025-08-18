import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // More robust error handling
  if (context === null || context === undefined) {
    console.error('❌ useAuth: AuthContext is null/undefined');
    console.error('❌ This indicates AuthProvider is not wrapping this component');
    console.error('❌ Current context value:', context);
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};