import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Cookie settings object for reuse
const COOKIE_OPTIONS = {
  secure: window.location.protocol === "https:",
  sameSite: "Strict",
  expires: 30, // 30 days
} as const;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  // Clear all auth data (cookies, localStorage, etc)
  const clearAuthData = useCallback(() => {
    // Clear all cookies
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });

    // Clear localStorage items related to auth
    localStorage.removeItem("pendingDriverRegistration");
    localStorage.removeItem("pendingDriverData");

    // Clear Supabase tokens from localStorage
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }

    // Clear any other app-specific storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }, []);

  // Set auth cookie based on user type
  const setAuthCookieByType = useCallback((type, email) => {
    // First remove any existing auth cookies to prevent conflicts
    Object.keys(Cookies.get())
      .filter((key) => key.includes("Auth") || key.includes("Email"))
      .forEach((key) => Cookies.remove(key, { path: "/" }));

    // Set new cookie
    Cookies.set(`${type}Auth`, "true", COOKIE_OPTIONS);
    if (email && type === "admin") {
      Cookies.set("adminEmail", email, COOKIE_OPTIONS);
    }
  }, []);

  // Handle user type detection
  const handleUserType = useCallback(
    async (userData) => {
      // Try metadata first (faster)
      if (userData.user_metadata?.user_type) {
        const type = userData.user_metadata.user_type;
        setUserType(type);
        setAuthCookieByType(type, userData.email);
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
          setAuthCookieByType(data.user_type, userData.email);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    },
    [setAuthCookieByType]
  );

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      // Handle sign-out event
      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setUserType(null);
        clearAuthData();
        setLoading(false);
        return;
      }

      // Handle other auth events
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
  }, [handleUserType, clearAuthData]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // First, clear client-side auth data
      clearAuthData();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      // Reset state even if there was an error signing out from Supabase
      setUser(null);
      setSession(null);
      setUserType(null);

      if (error) {
        console.warn("Error during Supabase sign out:", error);
        return { success: true, warning: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);

      // Clear auth data and reset state anyway
      clearAuthData();
      setUser(null);
      setSession(null);
      setUserType(null);

      return { success: false, error };
    }
  }, [clearAuthData]);

  // Check driver status using the server function
  const checkDriverStatus = useCallback(async (userId) => {
    try {
      // Use the server function
      const { data, error } = await supabase.rpc("get_driver_status_v3", {
        driver_id: userId,
      });

      if (error) throw error;

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.error || "Failed to get driver status",
        };
      }

      return {
        success: true,
        status: data.status,
        rejection_reason: data.rejection_reason,
      };
    } catch (err) {
      console.error("Error checking driver status:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Check user profile
  const checkUserProfile = useCallback(async (userId) => {
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

  return {
    user,
    session,
    loading,
    signOut,
    clearAuthData,
    checkUserProfile,
    checkDriverStatus,
    userType,
    isAuthenticated: !!session || !!user,

    // Added helper methods
    setAuthCookieByType,
    handleUserType,
  };
}
