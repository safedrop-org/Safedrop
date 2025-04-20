
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null);
        setProfile(null);
        navigate("/login");
      } else {
        setUser(session.user);
        // fetch profile async after state update using timeout to avoid blocking
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!error && data) {
            setProfile(data);
          } else {
            setProfile(null);
          }
        }, 0);
      }
    });

    // THEN check existing session after listener setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setUser(session.user);
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setProfile(data);
            } else {
              setProfile(null);
            }
          });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // unsubscribe on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, profile, session };
};
