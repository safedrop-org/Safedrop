
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
        
        if (!isAdminLoggedIn) {
          console.log("No admin auth in localStorage, redirecting to login");
          setIsAuthorized(false);
          toast.error("يجب تسجيل الدخول للوصول إلى لوحة التحكم");
          navigate("/admin", { replace: true });
          return;
        }

        // All checks passed
        console.log("Admin is authorized via localStorage");
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAuthorized(false);
        toast.error("حدث خطأ أثناء التحقق من صلاحيات المشرف");
        navigate("/admin", { replace: true });
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
