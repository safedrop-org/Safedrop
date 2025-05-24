import React, { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { user, userType, session, loading: authLoading } = useAuth();
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authorized" | "unauthorized"
  >("checking");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRunInitialCheck = useRef(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const currentUser = user || session?.user;

      if (userType === "admin") {
        console.log("✅ IMMEDIATE SUCCESS: Admin verified via userType");
        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 7,
        });
        setAuthStatus("authorized");
        return;
      }

      if (currentUser) {
        const hasAdminStorage = localStorage.getItem("adminAuth") === "true";
        const hasAdminCookie = Cookies.get("adminAuth") === "true";

        if (hasAdminStorage || hasAdminCookie) {
          console.log(
            "✅ IMMEDIATE SUCCESS: Admin verified via persistent storage"
          );
          setAuthStatus("authorized");
          return;
        }
      }

      if (currentUser?.user_metadata?.user_type === "admin") {
        console.log("✅ IMMEDIATE SUCCESS: Admin verified via user metadata");
        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 7,
        });
        setAuthStatus("authorized");
        return;
      }

      if (currentUser && !authLoading) {
        console.log(
          "🔍 User found but no immediate admin verification - checking database..."
        );

        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!profileError && profileData?.user_type === "admin") {
            console.log("✅ Admin verified via profiles table");
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true", {
              secure: window.location.protocol === "https:",
              sameSite: "Strict",
              expires: 7,
            });
            setAuthStatus("authorized");
            return;
          }

          // Check user_roles table as fallback
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();

          if (!roleError && roleData) {
            console.log("✅ Admin verified via user_roles table");
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true", {
              secure: window.location.protocol === "https:",
              sameSite: "Strict",
              expires: 7,
            });
            setAuthStatus("authorized");
            return;
          }

          // Email whitelist as final check
          if (currentUser.email) {
            const adminEmails = ["admin@safedrop.com", "support@safedrop.com"];

            if (adminEmails.includes(currentUser.email.toLowerCase())) {
              console.log("✅ Admin verified via email whitelist");
              localStorage.setItem("adminAuth", "true");
              Cookies.set("adminAuth", "true", {
                secure: window.location.protocol === "https:",
                sameSite: "Strict",
                expires: 7,
              });
              setAuthStatus("authorized");
              return;
            }
          }

          // If we get here, user exists but is not admin
          console.log("❌ User exists but is not admin");
          setAuthStatus("unauthorized");
          return;
        } catch (error) {
          console.warn("Database check failed:", error);
        }
      }

      // TIMEOUT MECHANISM - Don't wait forever
      // If we're still here and auth is not loading, we need to make a decision
      if (!authLoading) {
        if (!currentUser) {
          console.log("❌ No user found and auth not loading - unauthorized");
          setAuthStatus("unauthorized");
          return;
        }
      }

      // If auth is still loading, wait a bit more but with a timeout
      if (authLoading && !hasRunInitialCheck.current) {
        console.log("🔄 Auth still loading - setting timeout...");
        hasRunInitialCheck.current = true;

        // Set a reasonable timeout to prevent infinite waiting
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }

        checkTimeoutRef.current = setTimeout(() => {
          console.log("⏰ Timeout reached - making final decision");
          const finalUser = user || session?.user;

          if (
            userType === "admin" ||
            localStorage.getItem("adminAuth") === "true"
          ) {
            console.log(
              "✅ Timeout decision: Authorized via userType or storage"
            );
            setAuthStatus("authorized");
          } else if (finalUser) {
            console.log(
              "🔍 Timeout decision: Have user but need to verify admin status"
            );
            // We have a user but need to check if they're admin
            checkAdminAuth();
          } else {
            console.log("❌ Timeout decision: No user - unauthorized");
            setAuthStatus("unauthorized");
          }
        }, 3000); // 3 second timeout

        return;
      }
    };

    // Always run the check, but with protection against infinite loops
    checkAdminAuth();

    // Cleanup timeout on unmount
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [user, userType, session, authLoading, location.pathname]);

  // Handle unauthorized state with redirect
  useEffect(() => {
    if (authStatus === "unauthorized") {
      console.log("🔀 Redirecting unauthorized user to login");

      // Clear any stale admin data
      localStorage.removeItem("adminAuth");
      Cookies.remove("adminAuth");

      // Only show toast and redirect if we're not already on login page
      if (!location.pathname.includes("/login")) {
        toast.error(
          t("adminAuthRequired") ||
            "يجب تسجيل الدخول كمسؤول للوصول إلى لوحة التحكم"
        );
        navigate("/login?redirect=admin", { replace: true });
      }
    }
  }, [authStatus, location.pathname, navigate, t]);

  // Show loading state while checking
  if (authStatus === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              تحميل لوحة التحكم...
            </h2>
            <p className="text-sm text-gray-600">
              التحقق من صلاحيات المسؤول...
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {authLoading ? "تحميل بيانات المصادقة..." : "تأكيد الصلاحيات..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state (brief before redirect)
  if (authStatus === "unauthorized") {
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
              ليس لديك صلاحية الوصول إلى لوحة تحكم المسؤول
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
  console.log("🎉 Rendering admin content successfully!");
  return <div className="w-full">{children}</div>;
};

export default ProtectedAdminRoute;
