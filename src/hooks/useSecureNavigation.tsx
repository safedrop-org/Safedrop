import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/components/ui/language-context";
import { toast } from "sonner";

/**
 * Custom hook for secure navigation with authentication checks
 */
export const useSecureNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const secureNavigate = useCallback((path: string, requireAuth: boolean = true) => {
    if (requireAuth && !user?.id) {
      toast.error(t("pleaseLoginFirst"));
      navigate("/auth/login");
      return;
    }
    navigate(path);
  }, [navigate, user?.id, t]);

  const navigateToCustomerSection = useCallback((section: string) => {
    secureNavigate(`/customer/${section}`, true);
  }, [secureNavigate]);

  return {
    secureNavigate,
    navigateToCustomerSection,
    isAuthenticated: !!user?.id,
  };
};
