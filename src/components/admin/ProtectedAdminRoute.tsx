
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/components/ui/language-context";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { signOut } = useAuth();

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
          toast.error(t('adminAuthRequired'));
          // Redirect to login with parameters
          navigate("/login?redirect=admin", { replace: true });
          return;
        }

        // All checks passed
        console.log("Admin is authorized via localStorage");
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAuthorized(false);
        toast.error(t('adminCheckError'));
        
        // Clear admin auth on error
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        
        navigate("/login?redirect=admin", { replace: true });
      }
    };

    checkAdmin();
  }, [navigate, t]);

  // Render children only if authorized
  if (isAuthorized === null) {
    // You can render a loader here while checking auth
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  } else if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
