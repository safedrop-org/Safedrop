import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";

const DriverLogout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        toast.success(t("logoutSuccess"));
      } catch (error) {
        toast.error(t("logoutError"));
      } finally {
        // Always redirect to login after attempt, regardless of result
        navigate("/login");
      }
    };

    performLogout();
  }, [navigate, signOut]);

  // Display a loading indicator while logout is processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safedrop-primary mx-auto"></div>
        <p className="mt-4 text-lg">{t("loggingOut")}</p>
      </div>
    </div>
  );
};

export default DriverLogout;
