
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      // Check localStorage flag for adminAuth first
      const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';
      if (!isAdminLoggedIn) {
        // Not logged in as admin, verify Supabase session as well (for added security)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsAuthorized(false);
          navigate("/login");
          return;
        }

        // Fetch user profile to check user_type
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.user_type !== "admin") {
          toast.error("ليس لديك صلاحية الدخول إلى هذه الصفحة.");
          if (profile?.user_type === "customer") {
            navigate("/customer/dashboard");
          } else if (profile?.user_type === "driver") {
            navigate("/driver/dashboard");
          } else {
            navigate("/login");
          }
          setIsAuthorized(false);
          return;
        }
      }

      // All checks passed
      setIsAuthorized(true);
    };

    checkAdmin();
  }, [navigate]);

  // Render children only if authorized
  if (isAuthorized === null) {
    // You can render a loader here if desired while checking auth
    return null;
  } else if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
