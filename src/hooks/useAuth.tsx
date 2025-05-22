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
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Clear all auth data (cookies, localStorage, etc) - but be more selective
  const clearAuthData = useCallback((preserveVerificationData = false) => {
    // Only clear auth-related cookies, not verification data
    const authCookieKeys = Object.keys(Cookies.get()).filter(
      (key) =>
        key.includes("Auth") ||
        key.includes("Email") ||
        (key === "pendingUserDetails" && !preserveVerificationData)
    );

    authCookieKeys.forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });

    // Clear localStorage items related to auth (but preserve driver files during verification)
    if (!preserveVerificationData) {
      for (const key of Object.keys(localStorage)) {
        if (
          key.startsWith("driverFiles_") ||
          key === "pendingDriverRegistration" ||
          key === "pendingDriverData"
        ) {
          localStorage.removeItem(key);
        }
      }
    }

    // Clear Supabase tokens from localStorage
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }, []);

  // Set auth cookie based on user type
  const setAuthCookieByType = useCallback((type, email) => {
    // Only remove conflicting auth cookies, not all cookies
    const existingAuthCookies = Object.keys(Cookies.get()).filter(
      (key) => key.includes("Auth") && key !== `${type}Auth`
    );

    existingAuthCookies.forEach((key) => {
      Cookies.remove(key, { path: "/" });
    });

    // Set new cookie
    Cookies.set(`${type}Auth`, "true", COOKIE_OPTIONS);
    if (email && type === "admin") {
      Cookies.set("adminEmail", email, COOKIE_OPTIONS);
    }
  }, []);

  // Handle user type detection
  const handleUserType = useCallback(
    async (userData) => {
      if (!userData) return null;

      // Try metadata first (faster)
      if (userData.user_metadata?.user_type) {
        const type = userData.user_metadata.user_type;
        setUserType(type);
        setAuthCookieByType(type, userData.email);
        return type;
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
          return data.user_type;
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }

      // Fallback: check for admin role in user_roles table
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.id)
          .eq("role", "admin")
          .maybeSingle();

        if (data) {
          setUserType("admin");
          setAuthCookieByType("admin", userData.email);
          return "admin";
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      }

      // Default to customer if no type found
      setUserType("customer");
      return "customer";
    },
    [setAuthCookieByType]
  );

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, "Session:", !!newSession);

      if (!mounted) return;

      // Handle sign-out event
      if (event === "SIGNED_OUT") {
        console.log("Processing sign out");
        setUser(null);
        setSession(null);
        setUserType(null);

        // Only clear auth data if we're not in the middle of verification
        const isVerificationFlow =
          window.location.pathname.includes("/auth/callback");
        if (!isVerificationFlow) {
          clearAuthData();
        }

        setLoading(false);
        return;
      }

      // Handle successful sign in or token refresh
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        console.log("Processing sign in/token refresh/initial session");

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await handleUserType(newSession.user);
        } else {
          setUserType(null);
        }

        setLoading(false);

        // Mark as initialized after first session check
        if (!isInitialized) {
          setIsInitialized(true);
        }
        return;
      }

      // Handle other events
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await handleUserType(newSession.user);
      } else {
        setUserType(null);
      }

      setLoading(false);
    });

    // Fetch initial session
    const getInitialSession = async () => {
      try {
        console.log("Fetching initial session...");
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        console.log("Initial session:", !!initialSession);

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          await handleUserType(initialSession.user);
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setUserType(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true); // ← MAKE SURE THIS LINE EXISTS
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleUserType, clearAuthData, isInitialized]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      console.log("Starting sign out process...");

      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.warn("Error during Supabase sign out:", error);
      }

      // Clear client-side auth data
      clearAuthData();

      // Reset state
      setUser(null);
      setSession(null);
      setUserType(null);

      console.log("Sign out completed");
      return { success: true, warning: error?.message };
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
      const { data, error } = await supabase.rpc("get_driver_status_v3", {
        in_driver_id: userId,
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

  // Computed value for authentication status
  const isAuthenticated = !!(session || user);

  return {
    user,
    session,
    loading,
    signOut,
    clearAuthData,
    checkUserProfile,
    checkDriverStatus,
    userType,
    isAuthenticated,
    isInitialized,

    // Added helper methods
    setAuthCookieByType,
    handleUserType,
  };
}
