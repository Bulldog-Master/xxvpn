import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // More robust error handling
  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};