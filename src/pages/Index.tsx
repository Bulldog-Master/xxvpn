import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Index: Starting auth check...');
    
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('🔍 Index: Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📋 Index: Session result:', { session: !!session, error });
        
        if (error) {
          console.error('❌ Index: Session error:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        console.log('✅ Index: Auth state updated:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
      } catch (err) {
        console.error('❌ Index: Auth initialization error:', err);
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Index: Auth timeout - forcing loading to false');
      setLoading(false);
    }, 5000);

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Index: Auth state change:', event, !!session);
      clearTimeout(timeoutId);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
};

export default Index;