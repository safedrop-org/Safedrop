import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/components/ui/language-context";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

// Cookie settings for consistency
const COOKIE_OPTIONS = {
  secure: window.location.protocol === "https:",
  sameSite: "Strict",
  expires: 30, // 30 days
};

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      const isAdminLoggedIn = Cookies.get("adminAuth") === "true";
      const isAdminViaContext = userType === "admin";

      if (!isAdminLoggedIn && !isAdminViaContext) {
        toast.error(t("adminAuthRequired"));
        navigate("/login?redirect=admin", { replace: true });
        return false;
      }

      return true;
    };

    const isAuthorized = checkAdminAuth();
    setIsChecking(false);

    return () => {
      // Cleanup if needed
    };
  }, [navigate, t, userType]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-safedrop-primary animate-spin mb-2" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
