import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/components/ui/language-context";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    user,
    userType,
    session,
    loading: authLoading,
    isInitialized,
  } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log("=== ADMIN AUTH CHECK ===");
      console.log("Auth loading:", authLoading);
      console.log("Is initialized:", isInitialized);
      console.log("User:", !!user);
      console.log("Session:", !!session);
      console.log("UserType:", userType);

      // Get current user from either source
      const currentUser = user || session?.user;

      // IMMEDIATE SUCCESS CASES:

      // Case 1: If we have user and userType is admin, authorize immediately
      if (currentUser && userType === "admin") {
        console.log("✅ Admin verified via userType - IMMEDIATE SUCCESS");

        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 7,
        });

        setIsAuthorized(true);
        setAuthCheckComplete(true);
        return;
      }

      // Case 2: If we have admin storage/cookies and a valid user, authorize
      if (currentUser) {
        const hasAdminStorage = localStorage.getItem("adminAuth") === "true";
        const hasAdminCookie = Cookies.get("adminAuth") === "true";

        if (hasAdminStorage || hasAdminCookie) {
          console.log(
            "✅ Admin verified via persistent storage - IMMEDIATE SUCCESS"
          );
          setIsAuthorized(true);
          setAuthCheckComplete(true);
          return;
        }
      }

      // Case 3: Check user metadata
      if (currentUser?.user_metadata?.user_type === "admin") {
        console.log("✅ Admin verified via user metadata - IMMEDIATE SUCCESS");

        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 7,
        });

        setIsAuthorized(true);
        setAuthCheckComplete(true);
        return;
      }

      // WAIT FOR AUTH TO COMPLETE:

      // If auth is still loading, wait
      if (authLoading) {
        console.log("Still waiting for auth to load...");
        return;
      }

      // If no user found after auth is complete
      if (!currentUser) {
        console.log("❌ No user found after auth complete");
        // Clear any stale auth data
        localStorage.removeItem("adminAuth");
        Cookies.remove("adminAuth");

        toast.error(t("adminAuthRequired") || "Admin authentication required");
        navigate("/login?redirect=admin", { replace: true });
        setAuthCheckComplete(true);
        setIsAuthorized(false);
        return;
      }

      // DATABASE CHECKS (with proper error handling):

      console.log(
        "🔍 Performing database verification for user:",
        currentUser.email
      );

      let isAdmin = false;

      // Method 1: Check profiles table (most reliable)
      if (!isAdmin) {
        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!error && profileData?.user_type === "admin") {
            console.log("✅ Admin verified via profiles table");
            isAdmin = true;
          } else if (error) {
            console.warn("⚠️ Profiles table check failed:", error.message);
          }
        } catch (error) {
          console.warn("⚠️ Profiles table error:", error);
        }
      }

      // Method 2: Check user_roles table
      if (!isAdmin) {
        try {
          const { data: roleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();

          if (!error && roleData) {
            console.log("✅ Admin verified via user_roles table");
            isAdmin = true;
          } else if (error) {
            console.warn("⚠️ User roles table check failed:", error.message);
          }
        } catch (error) {
          console.warn("⚠️ User roles table error:", error);
        }
      }

      // Method 3: Email whitelist fallback (add your admin emails here)
      if (!isAdmin && currentUser.email) {
        const adminEmails = [
          "admin@safedrop.com",
          "support@safedrop.com",
          // Add more admin emails here if needed
        ];

        if (adminEmails.includes(currentUser.email.toLowerCase())) {
          console.log("✅ Admin verified via email whitelist");
          isAdmin = true;
        }
      }

      // FINAL DECISION:

      if (!isAdmin) {
        console.log("❌ User is not an admin after all checks");
        toast.error(t("adminAuthRequired") || "Admin access required");
        navigate("/login?redirect=admin", { replace: true });
        setAuthCheckComplete(true);
        setIsAuthorized(false);
        return;
      }

      console.log("✅ Admin authentication successful via database!");

      // Set admin auth flags for future use
      localStorage.setItem("adminAuth", "true");
      Cookies.set("adminAuth", "true", {
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
        expires: 7,
      });

      setIsAuthorized(true);
      setAuthCheckComplete(true);
    };

    // Only run the check if we haven't completed it yet
    if (!authCheckComplete) {
      checkAdminAuth();
    }
  }, [
    user,
    userType,
    session,
    authLoading,
    isInitialized,
    navigate,
    t,
    authCheckComplete,
  ]);

  // Show loading state
  if (!authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              تهيئة نظام المصادقة...
            </h2>
            <p className="text-sm text-gray-600">
              {t("loading") || "جاري التحميل..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              غير مصرح بالوصول
            </h2>
            <p className="text-gray-600 mb-6">
              يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login?redirect=admin")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول كمسؤول
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success! Render the protected content
  console.log("🎉 Rendering admin content!");
  return <div className="w-full">{children}</div>;
};

export default ProtectedAdminRoute;
