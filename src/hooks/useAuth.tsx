
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
    // 1. First: Set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // 2. Then: Fetch the current session after setting up the listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);
      setUser(session?.user || null);
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
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('customerAuth');
    localStorage.removeItem('driverAuth');
    navigate('/login');
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

  return { user, session, loading, signOut, checkUserProfile, checkDriverStatus };
};
