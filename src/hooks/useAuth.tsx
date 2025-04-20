
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth changes first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);

      if (session && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
        // Only navigate to login if not already there (avoids infinite loop)
        if (window.location.pathname !== "/login") {
          console.log("No session detected, navigating to login");
          navigate("/login");
        }
      }
    });

    // Then fetch existing session once listener is established
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);

      if (session && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, session };
};
