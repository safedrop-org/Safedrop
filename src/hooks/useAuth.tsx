
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up auth state listener");
    // 1. First: Set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    // 2. Then: Fetch the current session after setting up the listener
    const getInitialSession = async () => {
      try {
        console.log("Fetching initial session");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session fetched:", initialSession?.user?.id);
        setSession(initialSession);
        setUser(initialSession?.user || null);
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Clean up subscription when component unmounts
    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    console.log("Signing out...");
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('customerAuth');
      localStorage.removeItem('driverAuth');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
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

  return { 
    user, 
    session, 
    loading, 
    signOut, 
    checkUserProfile, 
    checkDriverStatus,
    isAuthenticated: !!session || !!user
  };
};
