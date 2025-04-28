
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
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
      
      // Check for user type in user_metadata
      if (newSession?.user?.user_metadata?.user_type) {
        console.log("User type from metadata:", newSession.user.user_metadata.user_type);
        setUserType(newSession.user.user_metadata.user_type);
        
        // Store authentication flags in localStorage based on user type
        if (newSession.user.user_metadata.user_type === 'customer') {
          localStorage.setItem('customerAuth', 'true');
        } else if (newSession.user.user_metadata.user_type === 'driver') {
          localStorage.setItem('driverAuth', 'true');
        } else if (newSession.user.user_metadata.user_type === 'admin') {
          localStorage.setItem('adminAuth', 'true');
        }
      } else {
        // If not in metadata, try to fetch from profiles table
        if (newSession?.user) {
          setTimeout(async () => {
            try {
              const { data } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', newSession.user.id)
                .maybeSingle();
                
              console.log("User type from profile:", data?.user_type);
              
              if (data?.user_type) {
                setUserType(data.user_type);
                
                // Store authentication flags in localStorage
                if (data.user_type === 'customer') {
                  localStorage.setItem('customerAuth', 'true');
                } else if (data.user_type === 'driver') {
                  localStorage.setItem('driverAuth', 'true');
                } else if (data.user_type === 'admin') {
                  localStorage.setItem('adminAuth', 'true');
                }
              }
            } catch (error) {
              console.error("Error fetching user type:", error);
            }
          }, 0);
        }
      }
      
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
        
        // Check for user type in user_metadata
        if (initialSession?.user?.user_metadata?.user_type) {
          console.log("Initial user type from metadata:", initialSession.user.user_metadata.user_type);
          setUserType(initialSession.user.user_metadata.user_type);
          
          // Store authentication flags
          if (initialSession.user.user_metadata.user_type === 'customer') {
            localStorage.setItem('customerAuth', 'true');
          } else if (initialSession.user.user_metadata.user_type === 'driver') {
            localStorage.setItem('driverAuth', 'true');
          } else if (initialSession.user.user_metadata.user_type === 'admin') {
            localStorage.setItem('adminAuth', 'true');
          }
        } else if (initialSession?.user) {
          // If not in metadata, try to fetch from profiles table
          try {
            const { data } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', initialSession.user.id)
              .maybeSingle();
              
            console.log("Initial user type from profile:", data?.user_type);
            
            if (data?.user_type) {
              setUserType(data.user_type);
              
              // Store authentication flags
              if (data.user_type === 'customer') {
                localStorage.setItem('customerAuth', 'true');
              } else if (data.user_type === 'driver') {
                localStorage.setItem('driverAuth', 'true');
              } else if (data.user_type === 'admin') {
                localStorage.setItem('adminAuth', 'true');
              }
            }
          } catch (error) {
            console.error("Error fetching initial user type:", error);
          }
        }
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
      setUserType(null);
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
    userType,
    isAuthenticated: !!session || !!user
  };
};
