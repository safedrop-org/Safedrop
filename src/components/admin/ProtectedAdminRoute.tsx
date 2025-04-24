
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
      try {
        console.log("Checking admin authorization");
        
        // Check localStorage flag for adminAuth first
        const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';
        console.log("Admin logged in from localStorage:", isAdminLoggedIn);
        
        if (isAdminLoggedIn) {
          console.log("Admin is authorized via localStorage");
          setIsAuthorized(true);
          return;
        }

        // Not logged in as admin via localStorage, verify Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Session from Supabase:", session?.user?.id);

        if (!session) {
          console.log("No session found, redirecting to login");
          setIsAuthorized(false);
          navigate("/admin");
          return;
        }

        // Fetch user profile to check user_type
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        console.log("Profile data:", profile);
        
        if (error) {
          console.error("Error fetching profile:", error);
        }

        if (error || !profile || profile.user_type !== "admin") {
          console.log("User is not an admin, redirecting");
          toast.error("ليس لديك صلاحية الدخول إلى هذه الصفحة.");
          
          if (profile?.user_type === "customer") {
            navigate("/customer/dashboard");
          } else if (profile?.user_type === "driver") {
            navigate("/driver/dashboard");
          } else {
            navigate("/admin");
          }
          
          setIsAuthorized(false);
          return;
        }

        // All checks passed
        console.log("Admin is authorized via Supabase");
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAuthorized(false);
        navigate("/admin");
      }
    };

    checkAdmin();
  }, [navigate]);

  // Render children only if authorized
  if (isAuthorized === null) {
    // You can render a loader here while checking auth
    return <div className="flex items-center justify-center min-h-screen">جاري التحقق...</div>;
  } else if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
