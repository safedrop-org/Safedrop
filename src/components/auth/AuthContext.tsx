
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  userType: string | null;
  signOut: () => Promise<void>;
  checkUserProfile: (userId: string) => Promise<any>;
  checkDriverStatus: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  
  useEffect(() => {
    // 1. First: Set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Get user type from profile
        const { data } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();
          
        setUserType(data?.user_type || null);
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    // 2. Then: Fetch the current session after setting up the listener
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Get user type from profile
        const { data } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();
          
        setUserType(data?.user_type || null);
      }
      
      setLoading(false);
    });

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserType(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('customerAuth');
    localStorage.removeItem('driverAuth');
  };

  // Check user profile without throwing errors
  const checkUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking user profile:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Exception when checking profile:", err);
      return null;
    }
  };

  // Check driver status to handle driver-specific flows
  const checkDriverStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('status, rejection_reason')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking driver status:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Exception when checking driver status:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        isLoggedIn: !!session, 
        userType,
        signOut,
        checkUserProfile,
        checkDriverStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
