
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
    let isMounted = true;

    const checkAdmin = async () => {
      // Check if localStorage adminAuth exists first for faster check
      const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';

      if (!isAdminLoggedIn) {
        if (isMounted) {
          setIsAuthorized(false);
          navigate("/admin", { replace: true });
        }
        return;
      }

      // Then verify session via Supabase for security
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (isMounted) {
          setIsAuthorized(false);
          navigate("/admin", { replace: true });
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || profile.user_type !== "admin") {
        toast.error("ليس لديك صلاحية الدخول إلى هذه الصفحة.");
        if (profile?.user_type === "customer") {
          navigate("/customer/dashboard", { replace: true });
        } else if (profile?.user_type === "driver") {
          navigate("/driver/dashboard", { replace: true });
        } else {
          navigate("/admin", { replace: true });
        }
        if (isMounted) {
          setIsAuthorized(false);
        }
        return;
      }

      if (isMounted) {
        setIsAuthorized(true);
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isAuthorized === null) {
    // Optionally render a spinner or loader here
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
