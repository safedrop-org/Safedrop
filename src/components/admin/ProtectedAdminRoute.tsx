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
  const { user, userType, session, loading: authLoading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log("=== ADMIN AUTH CHECK ===");
      console.log("Auth loading:", authLoading);
      console.log("User:", !!user);
      console.log("Session:", !!session);
      console.log("UserType:", userType);

      // Wait for auth to finish loading (ignore isInitialized since it's undefined)
      if (authLoading) {
        console.log("Still waiting for auth to load...");
        return;
      }

      // Check if user is authenticated
      const isAuthenticated = !!(session || user);

      if (!isAuthenticated) {
        console.log("❌ User not authenticated");
        toast.error(t("adminAuthRequired") || "Admin authentication required");
        navigate("/login?redirect=admin", { replace: true });
        setAuthCheckComplete(true);
        setIsAuthorized(false);
        return;
      }

      console.log("✅ User is authenticated");

      // Get current user
      let currentUser = user || session?.user;

      if (!currentUser) {
        console.log("❌ No user object found");
        toast.error("User data not available");
        navigate("/login", { replace: true });
        setAuthCheckComplete(true);
        setIsAuthorized(false);
        return;
      }

      console.log("✅ User object available:", currentUser.email);

      // Check admin status - start with userType since it's already 'admin'
      let isAdmin = false;

      // Method 1: Check userType from context (this should work since logs show userType: 'admin')
      if (userType === "admin") {
        console.log("✅ Admin verified via context userType");
        isAdmin = true;
      }

      // Method 2: Check localStorage/cookies
      if (!isAdmin) {
        const hasAdminStorage = localStorage.getItem("adminAuth") === "true";
        const hasAdminCookie = Cookies.get("adminAuth") === "true";

        if (hasAdminStorage || hasAdminCookie) {
          console.log("✅ Admin verified via storage/cookies");
          isAdmin = true;
        }
      }

      // Method 3: Check profile user_type in database
      if (!isAdmin) {
        try {
          console.log("🔍 Checking profile user_type in database...");
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (error) {
            console.warn("⚠️ Error checking profile:", error);
          } else if (profileData?.user_type === "admin") {
            console.log("✅ Admin verified via profile user_type");
            isAdmin = true;
          }
        } catch (error) {
          console.warn("⚠️ Profile check failed:", error);
        }
      }

      // Method 4: Check user_roles table
      if (!isAdmin) {
        try {
          console.log("🔍 Checking user_roles table...");
          const { data: roleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();

          if (error) {
            console.warn("⚠️ Error checking user roles:", error);
          } else if (roleData) {
            console.log("✅ Admin verified via user_roles table");
            isAdmin = true;
          }
        } catch (error) {
          console.warn("⚠️ User roles check failed:", error);
        }
      }

      if (!isAdmin) {
        console.log("❌ User is not an admin");
        toast.error(t("adminAuthRequired") || "Admin access required");
        navigate("/login?redirect=admin", { replace: true });
        setAuthCheckComplete(true);
        setIsAuthorized(false);
        return;
      }

      console.log("✅ Admin authentication successful!");

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

    // Run check when auth loading is done and we have user/session data
    if (!authLoading && (user || session)) {
      checkAdminAuth();
    } else if (!authLoading && !user && !session) {
      // No user and auth is done loading = not authenticated
      console.log("❌ No authentication found after loading complete");
      toast.error(t("adminAuthRequired") || "Admin authentication required");
      navigate("/login?redirect=admin", { replace: true });
      setAuthCheckComplete(true);
      setIsAuthorized(false);
    }
  }, [user, userType, session, authLoading, navigate, t]);

  // Show loading state
  if (!authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-safedrop-primary animate-spin mb-2" />
          <p>{t("loading") || "جاري التحميل..."}</p>
          <p className="text-sm text-gray-500 mt-2">
            {authLoading
              ? "تهيئة نظام المصادقة..."
              : "التحقق من صلاحيات المسؤول..."}
          </p>

          {/* Debug info */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>Auth Loading: {authLoading ? "Yes" : "No"}</p>
            <p>User: {user ? "Yes" : "No"}</p>
            <p>Session: {session ? "Yes" : "No"}</p>
            <p>User Type: {userType || "null"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            غير مصرح بالوصول
          </h2>
          <p className="text-gray-600 mb-4">
            يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Success! Render the protected content
  console.log("🎉 Rendering admin content!");
  return <div>{children}</div>;
};

export default ProtectedAdminRoute;
