
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

const DriverLogout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        toast.success("تم تسجيل الخروج بنجاح");
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("حدث خطأ أثناء تسجيل الخروج");
      } finally {
        // Always redirect to login after attempt, regardless of result
        navigate('/login');
      }
    };

    performLogout();
  }, [navigate, signOut]);

  // Display a loading indicator while logout is processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safedrop-primary mx-auto"></div>
        <p className="mt-4 text-lg">جاري تسجيل الخروج...</p>
      </div>
    </div>
  );
};

export default DriverLogout;
