
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
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

        // Fetch profile async after state update to prevent blocking UI
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (error) {
              console.error("Error fetching profile:", error);
              setProfile(null);
            } else {
              setProfile(data);
            }
          } catch (err) {
            console.error("Exception fetching profile:", err);
            setProfile(null);
          }
        }, 0);
      } else {
        setUser(null);
        setProfile(null);

        // Only navigate to login if not already there (avoids infinite loop)
        if (window.location.pathname !== "/login") {
          console.log("No session detected, navigating to login");
          navigate("/login");
        }
      }
    });

    // Then fetch existing session once listener is established
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);

      if (session && session.user) {
        setUser(session.user);

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
          } else {
            setProfile(data);
          }
        } catch (err) {
          console.error("Exception fetching profile:", err);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, profile, session };
};
