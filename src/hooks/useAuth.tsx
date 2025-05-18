import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import Cookies from "js-cookie";

// Cookie settings object for reuse
const COOKIE_OPTIONS = {
  secure: window.location.protocol === "https:",
  sameSite: "Strict",
  expires: 30, // 30 days
} as const;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  // Set auth cookie based on user type - extracted for reuse
  const setAuthCookieByType = useCallback((type: string, email?: string) => {
    Cookies.set(`${type}Auth`, "true", COOKIE_OPTIONS);
    if (email && type === "admin") {
      Cookies.set("adminEmail", email, COOKIE_OPTIONS);
    }
  }, []);

  // Handle user type detection and cookie setting
  const handleUserType = useCallback(
    async (userData: User) => {
      // Try metadata first (faster)
      if (userData.user_metadata?.user_type) {
        const type = userData.user_metadata.user_type;
        setUserType(type);
        setAuthCookieByType(type, userData.email || undefined);
        return;
      }

      // If not in metadata, try profiles table
      try {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", userData.id)
          .maybeSingle();

        if (data?.user_type) {
          setUserType(data.user_type);
          setAuthCookieByType(data.user_type, userData.email || undefined);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    },
    [setAuthCookieByType]
  );

  // Clear all auth data (cookies and localStorage)
  const clearAuthData = useCallback(() => {
    // Clear cookies
    Cookies.remove("adminAuth");
    Cookies.remove("adminEmail");
    Cookies.remove("customerAuth");
    Cookies.remove("driverAuth");

    // Clear Supabase tokens from localStorage
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await handleUserType(newSession.user);
      }

      setLoading(false);
    });

    // Fetch initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          await handleUserType(initialSession.user);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [handleUserType]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();

      // Reset state
      setUser(null);
      setSession(null);
      setUserType(null);

      // Clear auth data
      clearAuthData();

      // Direct navigation for reliability
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      clearAuthData();
      window.location.href = "/login";
    }
  }, [clearAuthData]);

  // Check user profile
  const checkUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error checking profile:", err);
      return null;
    }
  }, []);

  // Check driver status
  const checkDriverStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("status, rejection_reason")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error checking driver status:", err);
      return null;
    }
  }, []);

  return {
    user,
    session,
    loading,
    signOut,
    checkUserProfile,
    checkDriverStatus,
    userType,
    isAuthenticated: !!session || !!user,
  };
}
